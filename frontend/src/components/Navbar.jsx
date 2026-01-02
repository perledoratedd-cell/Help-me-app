import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LanguageContext, AuthContext, LANGUAGES, t } from "../App";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Globe, Menu, X, User, LogOut, Settings, LayoutDashboard, MessageSquare } from "lucide-react";

export default function Navbar() {
  const { language, setLanguage } = useContext(LanguageContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#E07A5F]/80 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-xl text-[#0F4C75] hidden sm:block">
              Help My New
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/categories" 
              className="text-[#4A5568] hover:text-[#0F4C75] font-medium transition-colors"
              data-testid="nav-categories"
            >
              {t("categories", language)}
            </Link>
            <Link 
              to="/providers" 
              className="text-[#4A5568] hover:text-[#0F4C75] font-medium transition-colors"
              data-testid="nav-providers"
            >
              {t("providers", language)}
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-[#4A5568] hover:text-[#0F4C75]"
                  data-testid="language-selector"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === language)?.flag}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? "bg-[#E07A5F]/10 text-[#E07A5F]" : ""}
                    data-testid={`lang-${lang.code}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="gap-2 text-[#4A5568] hover:text-[#0F4C75]"
                    data-testid="user-menu"
                  >
                    {user.picture ? (
                      <img 
                        src={user.picture} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#0F4C75] flex items-center justify-center text-white font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline font-medium">{user.name?.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="font-medium text-[#1A202C]">{user.name}</p>
                    <p className="text-sm text-[#718096]">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate(user.role === "provider" ? "/provider-dashboard" : "/dashboard")}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {t("dashboard", language)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages/all")}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t("messages", language)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t("settings", language)}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.role !== "provider" && (
                    <DropdownMenuItem onClick={() => navigate("/become-provider")} className="text-[#E07A5F]">
                      {t("become_provider", language)}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("logout", language)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/login")}
                  className="text-[#4A5568] hover:text-[#0F4C75]"
                  data-testid="login-btn"
                >
                  {t("login", language)}
                </Button>
                <Button 
                  onClick={() => navigate("/register")}
                  className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                  data-testid="register-btn"
                >
                  {t("register", language)}
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/50 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link 
                to="/categories" 
                className="px-3 py-2 text-[#4A5568] hover:text-[#0F4C75] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("categories", language)}
              </Link>
              <Link 
                to="/providers" 
                className="px-3 py-2 text-[#4A5568] hover:text-[#0F4C75] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("providers", language)}
              </Link>
              {!user && (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                    className="justify-start text-[#4A5568]"
                  >
                    {t("login", language)}
                  </Button>
                  <Button 
                    onClick={() => { navigate("/register"); setMobileMenuOpen(false); }}
                    className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                  >
                    {t("register", language)}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
