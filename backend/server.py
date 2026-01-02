from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'helpmynew-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Create the main app
app = FastAPI(title="Help My New API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer(auto_error=False)

# ============ MODELS ============

class UserBase(BaseModel):
    email: str
    name: str
    preferred_language: str = "es"
    
class UserCreate(UserBase):
    password: str
    
class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    role: str = "client"  # client, provider, admin
    picture: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    postal_code: Optional[str] = None
    created_at: datetime

class ProviderProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    provider_id: str
    user_id: str
    bio: Optional[str] = None
    categories: List[str] = []
    services: List[Dict[str, Any]] = []
    availability: str = "available"  # available, busy, offline
    response_time: str = "24h"
    rating: float = 0.0
    total_reviews: int = 0
    verified: bool = False
    location: Optional[Dict[str, Any]] = None
    postal_code: Optional[str] = None
    created_at: datetime

class ServiceCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    category_id: str
    name: Dict[str, str]  # {es: "Cocina", en: "Cooking", ...}
    icon: str
    description: Dict[str, str]
    parent_id: Optional[str] = None
    is_active: bool = True

class ServiceRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    request_id: str
    client_id: str
    provider_id: Optional[str] = None
    category_id: str
    title: str
    description: str
    urgency: str = "normal"  # urgent, normal, flexible
    status: str = "pending"  # pending, accepted, in_progress, completed, cancelled
    price_agreed: Optional[float] = None
    location: Optional[Dict[str, Any]] = None
    postal_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message_id: str
    request_id: str
    sender_id: str
    receiver_id: str
    content: str
    translated_content: Optional[Dict[str, str]] = None
    read: bool = False
    created_at: datetime

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    transaction_id: str
    request_id: str
    client_id: str
    provider_id: str
    amount: float
    currency: str = "EUR"
    payment_method: str  # stripe, paypal
    session_id: Optional[str] = None
    status: str = "pending"  # pending, completed, failed, refunded
    created_at: datetime

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request, credentials = Depends(security)) -> Optional[Dict]:
    token = None
    
    # Check cookie first
    token = request.cookies.get("session_token")
    
    # Then check Authorization header
    if not token and credentials:
        token = credentials.credentials
    
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        return user
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def require_auth(user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

# ============ TRANSLATION SERVICE ============

async def translate_text(text: str, target_language: str, source_language: str = "auto") -> str:
    """Translate text using OpenAI via Emergent LLM Key"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return text
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"translate-{uuid.uuid4().hex[:8]}",
            system_message=f"You are a translator. Translate the following text to {target_language}. Only respond with the translation, nothing else."
        ).with_model("openai", "gpt-4o-mini")
        
        response = await chat.send_message(UserMessage(text=text))
        return response.strip()
    except Exception as e:
        logging.error(f"Translation error: {e}")
        return text

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hash_password(user_data.password),
        "preferred_language": user_data.preferred_language,
        "role": "client",
        "picture": None,
        "location": None,
        "postal_code": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email, "client")
    
    return {
        "token": token,
        "user": {
            "user_id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "role": "client",
            "preferred_language": user_data.preferred_language
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["user_id"], user["email"], user["role"])
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=JWT_EXPIRATION_HOURS * 3600,
        path="/"
    )
    
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "preferred_language": user.get("preferred_language", "es"),
            "picture": user.get("picture")
        }
    }

@api_router.get("/auth/me")
async def get_me(user = Depends(require_auth)):
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "preferred_language": user.get("preferred_language", "es"),
        "picture": user.get("picture"),
        "location": user.get("location"),
        "postal_code": user.get("postal_code")
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# Emergent Google OAuth session handler
@api_router.post("/auth/session")
async def handle_oauth_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    # Get user data from Emergent Auth
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            oauth_data = auth_response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Auth service error: {str(e)}")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": oauth_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": oauth_data["name"], "picture": oauth_data.get("picture")}}
        )
        role = existing_user["role"]
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": oauth_data["email"],
            "name": oauth_data["name"],
            "password": None,
            "preferred_language": "es",
            "role": "client",
            "picture": oauth_data.get("picture"),
            "location": None,
            "postal_code": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        role = "client"
    
    # Create JWT token
    token = create_token(user_id, oauth_data["email"], role)
    
    # Store session
    session_doc = {
        "session_id": f"session_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "session_token": token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=JWT_EXPIRATION_HOURS * 3600,
        path="/"
    )
    
    return {
        "user_id": user_id,
        "email": oauth_data["email"],
        "name": oauth_data["name"],
        "picture": oauth_data.get("picture"),
        "role": role,
        "session_token": token
    }

# ============ CATEGORIES ROUTES ============

@api_router.get("/categories")
async def get_categories(language: str = "es"):
    categories = await db.categories.find({"is_active": True}, {"_id": 0}).to_list(100)
    
    # Format for frontend
    result = []
    for cat in categories:
        result.append({
            "category_id": cat["category_id"],
            "name": cat["name"].get(language, cat["name"].get("es", "Unknown")),
            "icon": cat["icon"],
            "description": cat["description"].get(language, cat["description"].get("es", "")),
            "parent_id": cat.get("parent_id")
        })
    
    return result

@api_router.post("/categories")
async def create_category(category_data: dict, user = Depends(require_auth)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    category_id = f"cat_{uuid.uuid4().hex[:8]}"
    category_doc = {
        "category_id": category_id,
        "name": category_data["name"],
        "icon": category_data["icon"],
        "description": category_data["description"],
        "parent_id": category_data.get("parent_id"),
        "is_active": True
    }
    
    await db.categories.insert_one(category_doc)
    return {"category_id": category_id, "message": "Category created"}

# ============ PROVIDERS ROUTES ============

@api_router.get("/providers")
async def get_providers(
    category_id: Optional[str] = None,
    postal_code: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    language: str = "es"
):
    query = {"availability": {"$ne": "offline"}}
    
    if category_id:
        query["categories"] = category_id
    
    if postal_code:
        query["postal_code"] = postal_code
    
    providers = await db.providers.find(query, {"_id": 0}).to_list(100)
    
    # Enrich with user data
    result = []
    for prov in providers:
        user = await db.users.find_one({"user_id": prov["user_id"]}, {"_id": 0, "password": 0})
        if user:
            result.append({
                **prov,
                "name": user["name"],
                "email": user["email"],
                "picture": user.get("picture")
            })
    
    return result

@api_router.get("/providers/{provider_id}")
async def get_provider(provider_id: str, language: str = "es"):
    provider = await db.providers.find_one({"provider_id": provider_id}, {"_id": 0})
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    user = await db.users.find_one({"user_id": provider["user_id"]}, {"_id": 0, "password": 0})
    
    return {
        **provider,
        "name": user["name"] if user else "Unknown",
        "email": user["email"] if user else None,
        "picture": user.get("picture") if user else None
    }

@api_router.post("/providers/register")
async def register_as_provider(provider_data: dict, user = Depends(require_auth)):
    # Check if already a provider
    existing = await db.providers.find_one({"user_id": user["user_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already registered as provider")
    
    provider_id = f"prov_{uuid.uuid4().hex[:8]}"
    provider_doc = {
        "provider_id": provider_id,
        "user_id": user["user_id"],
        "bio": provider_data.get("bio", ""),
        "categories": provider_data.get("categories", []),
        "services": provider_data.get("services", []),
        "availability": "available",
        "response_time": provider_data.get("response_time", "24h"),
        "rating": 0.0,
        "total_reviews": 0,
        "verified": False,
        "location": provider_data.get("location"),
        "postal_code": provider_data.get("postal_code"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.providers.insert_one(provider_doc)
    
    # Update user role
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"role": "provider"}}
    )
    
    return {"provider_id": provider_id, "message": "Registered as provider"}

@api_router.put("/providers/profile")
async def update_provider_profile(update_data: dict, user = Depends(require_auth)):
    provider = await db.providers.find_one({"user_id": user["user_id"]})
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    allowed_fields = ["bio", "categories", "services", "availability", "response_time", "location", "postal_code"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    await db.providers.update_one(
        {"user_id": user["user_id"]},
        {"$set": update_dict}
    )
    
    return {"message": "Profile updated"}

# ============ SERVICE REQUESTS ROUTES ============

@api_router.post("/requests")
async def create_request(request_data: dict, user = Depends(require_auth)):
    request_id = f"req_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()
    
    request_doc = {
        "request_id": request_id,
        "client_id": user["user_id"],
        "provider_id": request_data.get("provider_id"),
        "category_id": request_data["category_id"],
        "title": request_data["title"],
        "description": request_data["description"],
        "urgency": request_data.get("urgency", "normal"),
        "status": "pending",
        "price_agreed": request_data.get("price_agreed"),
        "location": request_data.get("location"),
        "postal_code": request_data.get("postal_code"),
        "created_at": now,
        "updated_at": now
    }
    
    await db.requests.insert_one(request_doc)
    
    return {"request_id": request_id, "message": "Request created"}

@api_router.get("/requests")
async def get_requests(user = Depends(require_auth)):
    # Get requests where user is client or provider
    query = {"$or": [
        {"client_id": user["user_id"]},
        {"provider_id": user["user_id"]}
    ]}
    
    requests = await db.requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    return requests

@api_router.get("/requests/{request_id}")
async def get_request(request_id: str, user = Depends(require_auth)):
    request = await db.requests.find_one({"request_id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check access
    if request["client_id"] != user["user_id"] and request.get("provider_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return request

@api_router.put("/requests/{request_id}")
async def update_request(request_id: str, update_data: dict, user = Depends(require_auth)):
    request = await db.requests.find_one({"request_id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Only allow updates from client or assigned provider
    if request["client_id"] != user["user_id"] and request.get("provider_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    allowed_fields = ["status", "price_agreed", "provider_id"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.requests.update_one(
        {"request_id": request_id},
        {"$set": update_dict}
    )
    
    return {"message": "Request updated"}

# ============ MESSAGES ROUTES ============

@api_router.post("/messages")
async def send_message(message_data: dict, user = Depends(require_auth)):
    message_id = f"msg_{uuid.uuid4().hex[:8]}"
    
    # Translate message if needed
    translated = {}
    receiver = await db.users.find_one({"user_id": message_data["receiver_id"]}, {"_id": 0})
    if receiver and receiver.get("preferred_language"):
        target_lang = receiver["preferred_language"]
        translated[target_lang] = await translate_text(message_data["content"], target_lang)
    
    message_doc = {
        "message_id": message_id,
        "request_id": message_data["request_id"],
        "sender_id": user["user_id"],
        "receiver_id": message_data["receiver_id"],
        "content": message_data["content"],
        "translated_content": translated,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message_doc)
    
    return {"message_id": message_id}

@api_router.get("/messages/{request_id}")
async def get_messages(request_id: str, user = Depends(require_auth), language: str = "es"):
    # Verify access to request
    request = await db.requests.find_one({"request_id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request["client_id"] != user["user_id"] and request.get("provider_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    messages = await db.messages.find({"request_id": request_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    
    # Mark as read
    await db.messages.update_many(
        {"request_id": request_id, "receiver_id": user["user_id"], "read": False},
        {"$set": {"read": True}}
    )
    
    return messages

# ============ TRANSLATION ROUTE ============

@api_router.post("/translate")
async def translate(data: dict, user = Depends(get_current_user)):
    text = data.get("text", "")
    target = data.get("target_language", "en")
    
    if not text:
        return {"translated": ""}
    
    translated = await translate_text(text, target)
    return {"translated": translated, "original": text, "target_language": target}

# ============ PAYMENT ROUTES (Stripe) ============

@api_router.post("/payments/stripe/checkout")
async def create_stripe_checkout(payment_data: dict, request: Request, user = Depends(require_auth)):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    api_key = os.environ.get('STRIPE_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    # Get request details
    service_request = await db.requests.find_one({"request_id": payment_data["request_id"]})
    if not service_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    amount = float(service_request.get("price_agreed", payment_data.get("amount", 10.00)))
    origin_url = payment_data.get("origin_url", host_url)
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="eur",
        success_url=f"{origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{origin_url}/payment/cancel",
        metadata={
            "request_id": payment_data["request_id"],
            "client_id": user["user_id"],
            "provider_id": service_request.get("provider_id", "")
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:8]}",
        "request_id": payment_data["request_id"],
        "client_id": user["user_id"],
        "provider_id": service_request.get("provider_id", ""),
        "amount": amount,
        "currency": "EUR",
        "payment_method": "stripe",
        "session_id": session.session_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/stripe/status/{session_id}")
async def get_stripe_status(session_id: str, user = Depends(require_auth)):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction status
    if status.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": "completed"}}
        )
        
        # Update request status
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        if transaction:
            await db.requests.update_one(
                {"request_id": transaction["request_id"]},
                {"$set": {"status": "completed", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {"status": "completed"}}
            )
        
        return {"status": "processed"}
    except Exception as e:
        logging.error(f"Stripe webhook error: {e}")
        return {"status": "error"}

# ============ USER PROFILE ROUTES ============

@api_router.put("/users/profile")
async def update_user_profile(update_data: dict, user = Depends(require_auth)):
    allowed_fields = ["name", "preferred_language", "location", "postal_code", "picture"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": update_dict}
    )
    
    return {"message": "Profile updated"}

@api_router.get("/users/provider-profile")
async def get_user_provider_profile(user = Depends(require_auth)):
    provider = await db.providers.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return provider

# ============ SEED DATA ============

@api_router.post("/seed/categories")
async def seed_categories():
    """Seed initial categories"""
    categories = [
        {
            "category_id": "cat_cooking",
            "name": {"es": "Cocina", "en": "Cooking", "fr": "Cuisine", "de": "Kochen", "it": "Cucina", "pt": "Cozinha"},
            "icon": "ChefHat",
            "description": {"es": "Ayuda en cocina y preparación de alimentos", "en": "Kitchen help and food preparation"},
            "is_active": True
        },
        {
            "category_id": "cat_gardening",
            "name": {"es": "Jardinería", "en": "Gardening", "fr": "Jardinage", "de": "Gartenarbeit", "it": "Giardinaggio", "pt": "Jardinagem"},
            "icon": "Flower2",
            "description": {"es": "Cuidado de jardines y plantas", "en": "Garden and plant care"},
            "is_active": True
        },
        {
            "category_id": "cat_hairdressing",
            "name": {"es": "Peluquería", "en": "Hairdressing", "fr": "Coiffure", "de": "Friseur", "it": "Parrucchiere", "pt": "Cabeleireiro"},
            "icon": "Scissors",
            "description": {"es": "Servicios de peluquería y estética", "en": "Hair and beauty services"},
            "is_active": True
        },
        {
            "category_id": "cat_psychology",
            "name": {"es": "Psicología", "en": "Psychology", "fr": "Psychologie", "de": "Psychologie", "it": "Psicologia", "pt": "Psicologia"},
            "icon": "Brain",
            "description": {"es": "Apoyo psicológico y bienestar mental", "en": "Psychological support and mental wellness"},
            "is_active": True
        },
        {
            "category_id": "cat_sewing",
            "name": {"es": "Costura", "en": "Sewing", "fr": "Couture", "de": "Nähen", "it": "Cucito", "pt": "Costura"},
            "icon": "Shirt",
            "description": {"es": "Arreglos y confección de ropa", "en": "Clothing repairs and tailoring"},
            "is_active": True
        },
        {
            "category_id": "cat_painting",
            "name": {"es": "Pintura", "en": "Painting", "fr": "Peinture", "de": "Malerei", "it": "Pittura", "pt": "Pintura"},
            "icon": "Paintbrush",
            "description": {"es": "Pintura de interiores y exteriores", "en": "Interior and exterior painting"},
            "is_active": True
        },
        {
            "category_id": "cat_cleaning",
            "name": {"es": "Limpieza", "en": "Cleaning", "fr": "Nettoyage", "de": "Reinigung", "it": "Pulizia", "pt": "Limpeza"},
            "icon": "Sparkles",
            "description": {"es": "Limpieza del hogar y oficinas", "en": "Home and office cleaning"},
            "is_active": True
        },
        {
            "category_id": "cat_moving",
            "name": {"es": "Mudanzas", "en": "Moving", "fr": "Déménagement", "de": "Umzug", "it": "Trasloco", "pt": "Mudança"},
            "icon": "Truck",
            "description": {"es": "Ayuda con mudanzas y transporte", "en": "Moving and transport assistance"},
            "is_active": True
        },
        {
            "category_id": "cat_childcare",
            "name": {"es": "Cuidado infantil", "en": "Childcare", "fr": "Garde d'enfants", "de": "Kinderbetreuung", "it": "Cura dei bambini", "pt": "Cuidado infantil"},
            "icon": "Baby",
            "description": {"es": "Cuidado de niños y actividades", "en": "Child care and activities"},
            "is_active": True
        },
        {
            "category_id": "cat_eldercare",
            "name": {"es": "Cuidado de mayores", "en": "Elder Care", "fr": "Soins aux personnes âgées", "de": "Altenpflege", "it": "Assistenza anziani", "pt": "Cuidado de idosos"},
            "icon": "Heart",
            "description": {"es": "Asistencia y compañía para personas mayores", "en": "Assistance and companionship for elderly"},
            "is_active": True
        },
        {
            "category_id": "cat_accessibility",
            "name": {"es": "Accesibilidad", "en": "Accessibility", "fr": "Accessibilité", "de": "Barrierefreiheit", "it": "Accessibilità", "pt": "Acessibilidade"},
            "icon": "Eye",
            "description": {"es": "Ayuda para personas con discapacidad visual u otras necesidades", "en": "Help for people with visual or other disabilities"},
            "is_active": True
        },
        {
            "category_id": "cat_reading",
            "name": {"es": "Lectura y compañía", "en": "Reading & Company", "fr": "Lecture et compagnie", "de": "Lesen und Gesellschaft", "it": "Lettura e compagnia", "pt": "Leitura e companhia"},
            "icon": "BookOpen",
            "description": {"es": "Lectura de cuentos, acompañamiento y conversación", "en": "Story reading, companionship and conversation"},
            "is_active": True
        },
        {
            "category_id": "cat_repairs",
            "name": {"es": "Reparaciones", "en": "Repairs", "fr": "Réparations", "de": "Reparaturen", "it": "Riparazioni", "pt": "Reparos"},
            "icon": "Wrench",
            "description": {"es": "Pequeñas reparaciones del hogar", "en": "Small home repairs"},
            "is_active": True
        },
        {
            "category_id": "cat_technology",
            "name": {"es": "Tecnología", "en": "Technology", "fr": "Technologie", "de": "Technologie", "it": "Tecnologia", "pt": "Tecnologia"},
            "icon": "Laptop",
            "description": {"es": "Ayuda con dispositivos y tecnología", "en": "Help with devices and technology"},
            "is_active": True
        },
        {
            "category_id": "cat_pets",
            "name": {"es": "Mascotas", "en": "Pets", "fr": "Animaux", "de": "Haustiere", "it": "Animali", "pt": "Animais"},
            "icon": "Cat",
            "description": {"es": "Cuidado y paseo de mascotas", "en": "Pet care and walking"},
            "is_active": True
        }
    ]
    
    # Clear existing
    await db.categories.delete_many({})
    
    # Insert new
    await db.categories.insert_many(categories)
    
    return {"message": f"Seeded {len(categories)} categories"}

# ============ ROOT ROUTE ============

@api_router.get("/")
async def root():
    return {"message": "Help My New API", "version": "1.0"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
