import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LanguageContext, AuthContext, t, API, LANGUAGES } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import { Mail, Lock, User, Eye, EyeOff, Globe } from "lucide-react";

export default function Register() {
  const { language, setLanguage } = useContext(LanguageContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferredLang, setPreferredLang] = useState(language);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(language === "es" ? "Las contraseñas no coinciden" : "Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error(language === "es" ? "La contraseña debe tener al menos 6 caracteres" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/register`, {
        name,
        email,
        password,
        preferred_language: preferredLang
      });

      login(response.data.user, response.data.token);
      setLanguage(preferredLang);
      toast.success(t("welcome", language) + ", " + response.data.user.name);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#F9F9F9] via-white to-[#F1F5F9]">
      <div className="absolute inset-0 noise pointer-events-none"></div>
      
      <Card className="w-full max-w-md border-slate-200 shadow-xl relative">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#E07A5F]/80 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <CardTitle className="text-2xl font-bold text-[#1A202C]">
            {t("register", language)}
          </CardTitle>
          <CardDescription className="text-[#718096]">
            {language === "es" 
              ? "Crea tu cuenta para empezar" 
              : "Create your account to get started"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#4A5568]">{t("name", language)}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                <Input
                  id="name"
                  type="text"
                  placeholder={language === "es" ? "Tu nombre" : "Your name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-[#E07A5F] focus:ring-[#E07A5F]/20"
                  required
                  data-testid="register-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#4A5568]">{t("email", language)}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-[#E07A5F] focus:ring-[#E07A5F]/20"
                  required
                  data-testid="register-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-[#4A5568]">
                {language === "es" ? "Idioma preferido" : "Preferred language"}
              </Label>
              <Select value={preferredLang} onValueChange={setPreferredLang}>
                <SelectTrigger className="h-12 border-slate-200" data-testid="register-language">
                  <Globe className="w-4 h-4 mr-2 text-[#A0AEC0]" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.slice(0, 15).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#4A5568]">{t("password", language)}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-slate-200 focus:border-[#E07A5F] focus:ring-[#E07A5F]/20"
                  required
                  data-testid="register-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#4A5568]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#4A5568]">{t("confirm_password", language)}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-[#E07A5F] focus:ring-[#E07A5F]/20"
                  required
                  data-testid="register-confirm-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              disabled={loading}
              data-testid="register-submit"
            >
              {loading ? t("loading", language) : t("register", language)}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#A0AEC0]">
                {t("or_continue_with", language)}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-12 border-slate-200 hover:bg-slate-50 font-medium"
            data-testid="google-register"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t("google", language)}
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center pb-6">
          <p className="text-sm text-[#718096]">
            {t("have_account", language)}{" "}
            <Link to="/login" className="text-[#E07A5F] hover:underline font-medium">
              {t("login", language)}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
