import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, AuthContext, t, API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import axios from "axios";
import { 
  MapPin, 
  Search, 
  Clock, 
  Shield, 
  Star,
  ArrowRight,
  Heart
} from "lucide-react";

// Category images mapping
const CATEGORY_IMAGES = {
  cat_cooking: "https://images.pexels.com/photos/3298637/pexels-photo-3298637.jpeg",
  cat_gardening: "https://images.pexels.com/photos/6508952/pexels-photo-6508952.jpeg",
  cat_hairdressing: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg",
  cat_psychology: "https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg",
  cat_sewing: "https://images.pexels.com/photos/3738088/pexels-photo-3738088.jpeg",
  cat_painting: "https://images.pexels.com/photos/6474446/pexels-photo-6474446.jpeg",
  cat_cleaning: "https://images.pexels.com/photos/6195275/pexels-photo-6195275.jpeg",
  cat_moving: "https://images.pexels.com/photos/7464722/pexels-photo-7464722.jpeg",
  cat_childcare: "https://images.pexels.com/photos/3536630/pexels-photo-3536630.jpeg",
  cat_eldercare: "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg",
  cat_accessibility: "https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg",
  cat_reading: "https://images.pexels.com/photos/1741231/pexels-photo-1741231.jpeg",
  cat_repairs: "https://images.pexels.com/photos/5691639/pexels-photo-5691639.jpeg",
  cat_technology: "https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg",
  cat_pets: "https://images.pexels.com/photos/6235233/pexels-photo-6235233.jpeg",
};

export default function Landing() {
  const { language } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories?language=${language}`);
        setCategories(response.data.slice(0, 8));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [language]);

  const handleSearch = () => {
    navigate(`/categories${postalCode ? `?postal_code=${postalCode}` : ''}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F9F9F9] via-white to-[#F1F5F9] py-16 lg:py-24">
        <div className="absolute inset-0 noise"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#E07A5F]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#0F4C75]/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-[#E07A5F]/10 text-[#E07A5F] hover:bg-[#E07A5F]/20 border-0 px-4 py-1.5">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {language === "es" ? "Respuesta en minutos" : "Response in minutes"}
                </Badge>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A202C] leading-tight tracking-tight">
                  {t("hero_title", language)}
                </h1>
                
                <p className="text-lg text-[#4A5568] max-w-xl leading-relaxed">
                  {t("hero_subtitle", language)}
                </p>
              </div>

              {/* Search Box */}
              <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 max-w-xl border border-slate-100">
                <div className="flex-1 flex items-center gap-2 px-4">
                  <MapPin className="w-5 h-5 text-[#718096]" />
                  <Input
                    type="text"
                    placeholder={t("search_location", language)}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="border-0 focus-visible:ring-0 text-[#1A202C] placeholder:text-[#A0AEC0]"
                    data-testid="postal-code-input"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white px-6 h-12 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
                  data-testid="search-btn"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {t("find_help", language)}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-[#4A5568]">
                  <Shield className="w-5 h-5 text-[#38A169]" />
                  <span className="text-sm font-medium">
                    {language === "es" ? "Proveedores verificados" : "Verified providers"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#4A5568]">
                  <Star className="w-5 h-5 text-[#D69E2E]" />
                  <span className="text-sm font-medium">
                    {language === "es" ? "Reseñas reales" : "Real reviews"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#4A5568]">
                  <Clock className="w-5 h-5 text-[#3182CE]" />
                  <span className="text-sm font-medium">
                    {language === "es" ? "24/48h disponible" : "24/48h available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/4260639/pexels-photo-4260639.jpeg?w=600&h=500&fit=crop"
                  alt="Diverse happy family laughing together"
                  className="rounded-3xl shadow-2xl object-cover w-full h-[500px]"
                />
                
                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#38A169]/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-[#38A169]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1A202C]">+1,500</p>
                      <p className="text-sm text-[#718096]">
                        {language === "es" ? "Servicios completados" : "Services completed"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Help Sticky Button (Mobile) */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <Button 
          onClick={() => navigate("/categories?urgency=urgent")}
          className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white rounded-full px-6 h-14 shadow-lg hover:shadow-xl transition-all font-semibold"
          data-testid="urgent-help-mobile"
        >
          <Clock className="w-5 h-5 mr-2" />
          {t("urgent_help", language)}
        </Button>
      </div>

      {/* Categories Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#1A202C]">
                {t("categories", language)}
              </h2>
              <p className="text-[#718096] mt-2">
                {language === "es" 
                  ? "Encuentra ayuda en cualquier área" 
                  : "Find help in any area"}
              </p>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/categories")}
              className="text-[#0F4C75] hover:text-[#0F4C75]/80 font-medium hidden sm:flex"
              data-testid="view-all-categories"
            >
              {language === "es" ? "Ver todas" : "View all"}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 mb-4"></div>
                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              categories.map((category) => {
                const imageUrl = CATEGORY_IMAGES[category.category_id] || "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg";
                return (
                  <Card 
                    key={category.category_id}
                    className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                    onClick={() => navigate(`/providers?category=${category.category_id}`)}
                    data-testid={`category-${category.category_id}`}
                  >
                    {/* Image with overlay */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={`${imageUrl}?w=300&h=225&fit=crop`}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-lg text-white drop-shadow-lg">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button 
              variant="outline" 
              onClick={() => navigate("/categories")}
              className="border-[#0F4C75] text-[#0F4C75]"
            >
              {language === "es" ? "Ver todas las categorías" : "View all categories"}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A202C]">
              {language === "es" ? "Cómo funciona" : "How it works"}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: language === "es" ? "Elige un servicio" : "Choose a service",
                desc: language === "es" 
                  ? "Busca entre nuestras categorías o describe lo que necesitas"
                  : "Browse our categories or describe what you need",
                icon: Search
              },
              {
                step: "02",
                title: language === "es" ? "Conecta con proveedores" : "Connect with providers",
                desc: language === "es"
                  ? "Encuentra profesionales verificados en tu zona"
                  : "Find verified professionals in your area",
                icon: MapPin
              },
              {
                step: "03",
                title: language === "es" ? "Recibe ayuda" : "Get help",
                desc: language === "es"
                  ? "Acuerda el precio, comunícate y recibe el servicio"
                  : "Agree on price, communicate and receive the service",
                icon: Heart
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl font-extrabold text-[#E07A5F]/20">{item.step}</span>
                    <div className="w-12 h-12 rounded-xl bg-[#0F4C75]/10 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-[#0F4C75]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#1A202C] mb-2">{item.title}</h3>
                  <p className="text-[#718096]">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-[#E07A5F]/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-[#0F4C75] relative overflow-hidden">
        <div className="absolute inset-0 noise"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E07A5F]/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {language === "es" 
              ? "¿Tienes habilidades que ofrecer?" 
              : "Have skills to offer?"}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {language === "es"
              ? "Únete a nuestra comunidad de proveedores y empieza a ayudar a personas en tu zona. Tú estableces tus precios y horarios."
              : "Join our community of providers and start helping people in your area. You set your prices and schedule."}
          </p>
          <Button 
            onClick={() => navigate(user ? "/become-provider" : "/register")}
            className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white px-8 h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            data-testid="become-provider-cta"
          >
            {t("become_provider", language)}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#E07A5F]/80 flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="font-bold text-xl text-[#0F4C75]">Help My New</span>
            </div>
            <p className="text-[#718096] text-sm">
              © 2024 Help My New. {language === "es" ? "Todos los derechos reservados." : "All rights reserved."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
