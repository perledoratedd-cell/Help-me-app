import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import { Toaster } from "sonner";
import axios from "axios";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Categories from "./pages/Categories";
import Providers from "./pages/Providers";
import ProviderDetail from "./pages/ProviderDetail";
import ClientDashboard from "./pages/ClientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import BecomeProvider from "./pages/BecomeProvider";
import RequestService from "./pages/RequestService";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import AuthCallback from "./pages/AuthCallback";

// Components
import Navbar from "./components/Navbar";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Language Context
export const LanguageContext = createContext();

// Auth Context
export const AuthContext = createContext();

// Supported Languages
export const LANGUAGES = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
  { code: "no", name: "Norsk", flag: "🇳🇴" },
  { code: "da", name: "Dansk", flag: "🇩🇰" },
  { code: "fi", name: "Suomi", flag: "🇫🇮" },
  { code: "el", name: "Ελληνικά", flag: "🇬🇷" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
  { code: "ro", name: "Română", flag: "🇷🇴" },
  { code: "hu", name: "Magyar", flag: "🇭🇺" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "he", name: "עברית", flag: "🇮🇱" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", name: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
];

// Translations
export const TRANSLATIONS = {
  es: {
    hero_title: "Ayuda cuando la necesitas",
    hero_subtitle: "Conectamos personas que necesitan ayuda con profesionales locales disponibles en minutos",
    find_help: "Buscar ayuda",
    offer_services: "Ofrecer servicios",
    urgent_help: "Ayuda urgente",
    categories: "Categorías",
    providers: "Proveedores",
    login: "Iniciar sesión",
    register: "Registrarse",
    logout: "Cerrar sesión",
    dashboard: "Panel",
    settings: "Configuración",
    messages: "Mensajes",
    my_requests: "Mis solicitudes",
    my_services: "Mis servicios",
    search_location: "Tu ubicación o código postal",
    select_category: "Selecciona una categoría",
    view_providers: "Ver proveedores",
    price_from: "Desde",
    per_hour: "/hora",
    available: "Disponible",
    busy: "Ocupado",
    verified: "Verificado",
    contact: "Contactar",
    request_service: "Solicitar servicio",
    become_provider: "Ofrecer mis servicios",
    welcome: "Bienvenido",
    email: "Correo electrónico",
    password: "Contraseña",
    name: "Nombre",
    confirm_password: "Confirmar contraseña",
    or_continue_with: "O continúa con",
    google: "Google",
    no_account: "¿No tienes cuenta?",
    have_account: "¿Ya tienes cuenta?",
    payment_success: "Pago completado",
    payment_cancel: "Pago cancelado",
    loading: "Cargando...",
  },
  en: {
    hero_title: "Help when you need it",
    hero_subtitle: "We connect people who need help with local professionals available in minutes",
    find_help: "Find help",
    offer_services: "Offer services",
    urgent_help: "Urgent help",
    categories: "Categories",
    providers: "Providers",
    login: "Log in",
    register: "Sign up",
    logout: "Log out",
    dashboard: "Dashboard",
    settings: "Settings",
    messages: "Messages",
    my_requests: "My requests",
    my_services: "My services",
    search_location: "Your location or postal code",
    select_category: "Select a category",
    view_providers: "View providers",
    price_from: "From",
    per_hour: "/hour",
    available: "Available",
    busy: "Busy",
    verified: "Verified",
    contact: "Contact",
    request_service: "Request service",
    become_provider: "Offer my services",
    welcome: "Welcome",
    email: "Email",
    password: "Password",
    name: "Name",
    confirm_password: "Confirm password",
    or_continue_with: "Or continue with",
    google: "Google",
    no_account: "Don't have an account?",
    have_account: "Already have an account?",
    payment_success: "Payment completed",
    payment_cancel: "Payment cancelled",
    loading: "Loading...",
  },
  fr: {
    hero_title: "De l'aide quand vous en avez besoin",
    hero_subtitle: "Nous connectons les personnes ayant besoin d'aide avec des professionnels locaux disponibles en quelques minutes",
    find_help: "Trouver de l'aide",
    offer_services: "Offrir des services",
    urgent_help: "Aide urgente",
    categories: "Catégories",
    providers: "Prestataires",
    login: "Connexion",
    register: "S'inscrire",
    logout: "Déconnexion",
    dashboard: "Tableau de bord",
    settings: "Paramètres",
    messages: "Messages",
    loading: "Chargement...",
  },
  de: {
    hero_title: "Hilfe wenn Sie sie brauchen",
    hero_subtitle: "Wir verbinden Menschen, die Hilfe benötigen, mit lokalen Fachleuten, die in Minuten verfügbar sind",
    find_help: "Hilfe finden",
    offer_services: "Dienste anbieten",
    urgent_help: "Dringende Hilfe",
    categories: "Kategorien",
    providers: "Anbieter",
    login: "Anmelden",
    register: "Registrieren",
    logout: "Abmelden",
    loading: "Laden...",
  },
  it: {
    hero_title: "Aiuto quando ne hai bisogno",
    hero_subtitle: "Colleghiamo persone che hanno bisogno di aiuto con professionisti locali disponibili in pochi minuti",
    find_help: "Trova aiuto",
    offer_services: "Offri servizi",
    urgent_help: "Aiuto urgente",
    categories: "Categorie",
    providers: "Fornitori",
    login: "Accedi",
    register: "Registrati",
    logout: "Esci",
    loading: "Caricamento...",
  },
  pt: {
    hero_title: "Ajuda quando você precisa",
    hero_subtitle: "Conectamos pessoas que precisam de ajuda com profissionais locais disponíveis em minutos",
    find_help: "Encontrar ajuda",
    offer_services: "Oferecer serviços",
    urgent_help: "Ajuda urgente",
    categories: "Categorias",
    providers: "Fornecedores",
    login: "Entrar",
    register: "Cadastrar",
    logout: "Sair",
    loading: "Carregando...",
  },
};

// Get translation helper
export function t(key, lang = "es") {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS["es"]?.[key] || TRANSLATIONS["en"]?.[key] || key;
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
        <div className="animate-pulse-gentle text-[#0F4C75] text-lg font-medium">
          {t("loading")}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// App Router with session_id detection
function AppRouter() {
  const location = useLocation();
  
  // Check for OAuth callback session_id in URL fragment
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/providers" element={<Providers />} />
      <Route path="/providers/:providerId" element={<ProviderDetail />} />
      <Route path="/callback" element={<AuthCallback />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/provider-dashboard" element={
        <ProtectedRoute>
          <ProviderDashboard />
        </ProtectedRoute>
      } />
      <Route path="/become-provider" element={
        <ProtectedRoute>
          <BecomeProvider />
        </ProtectedRoute>
      } />
      <Route path="/request/:categoryId" element={
        <ProtectedRoute>
          <RequestService />
        </ProtectedRoute>
      } />
      <Route path="/messages/:requestId" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("hmn_language") || "es";
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("hmn_language", language);
  }, [language]);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("hmn_token");
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem("hmn_token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("hmn_token", token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      console.error("Logout error:", e);
    }
    localStorage.removeItem("hmn_token");
    setUser(null);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
        <BrowserRouter>
          <div className="min-h-screen bg-[#F9F9F9]">
            <Navbar />
            <AppRouter />
            <Toaster 
              position="top-right" 
              richColors 
              toastOptions={{
                style: {
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }
              }}
            />
          </div>
        </BrowserRouter>
      </AuthContext.Provider>
    </LanguageContext.Provider>
  );
}

export default App;
