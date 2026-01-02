#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class HelpMyNewAPITester:
    def __init__(self, base_url="https://multilang-assist.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
                if success:
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
            except:
                response_data = response.text[:200] if response.text else "No response body"

            if success:
                self.log_test(name, True, response_data=response_data)
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response_data}")

            return success, response_data

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   Error: {error_msg}")
            self.log_test(name, False, error_msg)
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_categories_endpoint(self):
        """Test categories endpoint"""
        success, data = self.run_test("Get Categories", "GET", "categories", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} categories")
            if len(data) >= 15:
                self.log_test("Categories Count Check", True, f"Found {len(data)} categories (expected 15)")
            else:
                self.log_test("Categories Count Check", False, f"Found {len(data)} categories, expected 15")
        return success

    def test_categories_with_language(self):
        """Test categories with language parameter"""
        for lang in ["es", "en", "fr"]:
            success, data = self.run_test(f"Get Categories ({lang})", "GET", f"categories?language={lang}", 200)
            if success and isinstance(data, list) and len(data) > 0:
                # Check if category names are in the requested language
                first_cat = data[0]
                if 'name' in first_cat:
                    print(f"   Sample category name in {lang}: {first_cat['name']}")

    def test_seed_categories(self):
        """Test seeding categories"""
        return self.run_test("Seed Categories", "POST", "seed/categories", 200)

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        test_name = f"Test User {uuid.uuid4().hex[:4]}"
        
        user_data = {
            "email": test_email,
            "name": test_name,
            "password": "TestPass123!",
            "preferred_language": "es"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, user_data)
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['user_id']
            print(f"   Registered user: {test_email}")
            print(f"   User ID: {self.user_id}")
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not self.user_id:
            print("   Skipping login test - no registered user")
            return False
            
        # We'll use the same credentials from registration
        # For this test, we'll create a new user specifically for login testing
        test_email = f"login_test_{uuid.uuid4().hex[:8]}@example.com"
        
        # First register a user
        reg_data = {
            "email": test_email,
            "name": "Login Test User",
            "password": "LoginTest123!",
            "preferred_language": "en"
        }
        
        reg_success, reg_response = self.run_test("Registration for Login Test", "POST", "auth/register", 200, reg_data)
        
        if not reg_success:
            return False
            
        # Now test login
        login_data = {
            "email": test_email,
            "password": "LoginTest123!"
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        
        if success and 'token' in response:
            print(f"   Login successful for: {test_email}")
            return True
        return False

    def test_auth_me(self):
        """Test getting current user info"""
        if not self.token:
            print("   Skipping auth/me test - no token")
            return False
            
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_providers_endpoint(self):
        """Test providers endpoint"""
        return self.run_test("Get Providers", "GET", "providers", 200)

    def test_provider_registration(self):
        """Test provider registration"""
        if not self.token:
            print("   Skipping provider registration - no token")
            return False
            
        provider_data = {
            "bio": "Experienced professional offering quality services",
            "categories": ["cat_cooking", "cat_cleaning"],
            "services": [
                {
                    "name": "Home Cooking",
                    "description": "Healthy meal preparation",
                    "price": 25.0,
                    "per_hour": True
                }
            ],
            "response_time": "24h",
            "postal_code": "28001"
        }
        
        return self.run_test("Provider Registration", "POST", "providers/register", 200, provider_data)

    def test_service_requests(self):
        """Test service request creation"""
        if not self.token:
            print("   Skipping service request test - no token")
            return False
            
        request_data = {
            "category_id": "cat_cooking",
            "title": "Need help with dinner preparation",
            "description": "Looking for someone to help prepare a family dinner",
            "urgency": "normal",
            "postal_code": "28001"
        }
        
        success, response = self.run_test("Create Service Request", "POST", "requests", 200, request_data)
        
        if success and 'request_id' in response:
            request_id = response['request_id']
            print(f"   Created request: {request_id}")
            
            # Test getting requests
            self.run_test("Get User Requests", "GET", "requests", 200)
            
            # Test getting specific request
            self.run_test("Get Specific Request", "GET", f"requests/{request_id}", 200)
            
        return success

    def test_translation_endpoint(self):
        """Test translation endpoint"""
        if not self.token:
            print("   Skipping translation test - no token")
            return False
            
        translation_data = {
            "text": "Hello, how are you?",
            "target_language": "es"
        }
        
        return self.run_test("Text Translation", "POST", "translate", 200, translation_data)

    def test_invalid_endpoints(self):
        """Test invalid endpoints return proper errors"""
        # Test non-existent endpoint
        self.run_test("Invalid Endpoint", "GET", "nonexistent", 404)
        
        # Test unauthorized access to protected endpoint
        old_token = self.token
        self.token = None
        self.run_test("Unauthorized Access", "GET", "auth/me", 401)
        self.token = old_token

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Help My New API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Basic API tests
        self.test_root_endpoint()
        
        # Categories tests
        self.test_seed_categories()
        self.test_categories_endpoint()
        self.test_categories_with_language()
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_auth_me()
        
        # Provider tests
        self.test_providers_endpoint()
        self.test_provider_registration()
        
        # Service request tests
        self.test_service_requests()
        
        # Translation tests
        self.test_translation_endpoint()
        
        # Error handling tests
        self.test_invalid_endpoints()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary:")
        print(f"   Total tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = HelpMyNewAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': tester.tests_passed/tester.tests_run if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())