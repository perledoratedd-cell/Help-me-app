import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LanguageContext, AuthContext, t, API } from "../App";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import axios from "axios";
import { Star, Clock, Shield, MapPin, MessageSquare, ArrowLeft, Euro } from "lucide-react";

export default function ProviderDetail() {
  const { providerId } = useParams();
  const { language } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await axios.get(`${API}/providers/${providerId}?language=${language}`);
        setProvider(response.data);
      } catch (error) {
        console.error("Error fetching provider:", error);
        toast.error(language === "es" ? "Proveedor no encontrado" : "Provider not found");
        navigate("/providers");
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [providerId, language, navigate]);

  const handleContact = () => {
    if (!user) {
      toast.info(language === "es" ? "Inicia sesión para contactar" : "Login to contact");
      navigate("/login");
      return;
    }
    
    // Navigate to request service page
    navigate(`/request/${provider.categories?.[0] || 'general'}?provider=${providerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9] flex items-center justify-center">
        <div className="animate-pulse-gentle text-[#0F4C75]">{t("loading", language)}</div>
      </div>
    );
  }

  if (!provider) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 text-[#718096] hover:text-[#1A202C] -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "es" ? "Volver" : "Back"}
          </Button>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            {provider.picture ? (
              <img 
                src={provider.picture} 
                alt={provider.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-slate-100 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[#0F4C75] flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {provider.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1A202C]">
                  {provider.name}
                </h1>
                {provider.verified && (
                  <Badge className="bg-[#38A169]/10 text-[#38A169] border-0">
                    <Shield className="w-3 h-3 mr-1" />
                    {t("verified", language)}
                  </Badge>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-[#D69E2E] fill-[#D69E2E]" />
                  <span className="font-semibold text-[#1A202C]">
                    {provider.rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-[#718096]">
                    ({provider.total_reviews || 0} {language === "es" ? "reseñas" : "reviews"})
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-[#718096]">
                  <Clock className="w-4 h-4" />
                  <span>{language === "es" ? "Responde en" : "Responds in"} {provider.response_time || "24h"}</span>
                </div>
              </div>

              {provider.postal_code && (
                <div className="flex items-center gap-1 text-[#718096] mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.postal_code}</span>
                </div>
              )}

              {/* CTA */}
              <Button 
                onClick={handleContact}
                className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white px-6 h-12 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                data-testid="contact-provider"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {t("contact", language)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Bio */}
          {provider.bio && (
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h2 className="font-semibold text-[#1A202C] mb-3">
                  {language === "es" ? "Sobre mí" : "About me"}
                </h2>
                <p className="text-[#4A5568] leading-relaxed">
                  {provider.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Services */}
          {provider.services?.length > 0 && (
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h2 className="font-semibold text-[#1A202C] mb-4">
                  {language === "es" ? "Servicios y precios" : "Services & prices"}
                </h2>
                <div className="space-y-3">
                  {provider.services.map((service, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#F9F9F9] hover:bg-[#F1F5F9] transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-[#1A202C]">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-[#718096] mt-1">{service.description}</p>
                        )}
                      </div>
                      {service.price && (
                        <div className="text-right">
                          <span className="text-xl font-bold text-[#E07A5F] font-mono">
                            €{service.price}
                          </span>
                          {service.per_hour && (
                            <span className="text-sm text-[#718096]">{t("per_hour", language)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Availability */}
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h2 className="font-semibold text-[#1A202C] mb-3">
                {language === "es" ? "Disponibilidad" : "Availability"}
              </h2>
              <Badge 
                className={
                  provider.availability === "available" 
                    ? "bg-[#38A169]/10 text-[#38A169] border-0 text-base px-4 py-2" 
                    : "bg-[#D69E2E]/10 text-[#D69E2E] border-0 text-base px-4 py-2"
                }
              >
                {provider.availability === "available" 
                  ? (language === "es" ? "Disponible ahora" : "Available now")
                  : (language === "es" ? "Ocupado temporalmente" : "Temporarily busy")}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
