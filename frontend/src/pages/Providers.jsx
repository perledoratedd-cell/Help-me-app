import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LanguageContext, t, API } from "../App";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import axios from "axios";
import { Search, MapPin, Star, Clock, Shield, Filter } from "lucide-react";

export default function Providers() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postalCode, setPostalCode] = useState(searchParams.get("postal_code") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providersRes, categoriesRes] = await Promise.all([
          axios.get(`${API}/providers`, {
            params: {
              category_id: selectedCategory !== "all" ? selectedCategory : undefined,
              postal_code: postalCode || undefined,
              language
            }
          }),
          axios.get(`${API}/categories?language=${language}`)
        ]);
        setProviders(providersRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [language, selectedCategory, postalCode]);

  const handleFilter = () => {
    setLoading(true);
    // Trigger re-fetch via useEffect
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-[#1A202C]">
            {t("providers", language)}
          </h1>
          <p className="text-[#718096] mt-1">
            {language === "es" 
              ? `${providers.length} proveedores disponibles`
              : `${providers.length} providers available`}
          </p>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
              <Input
                type="text"
                placeholder={language === "es" ? "Código postal..." : "Postal code..."}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="pl-10 h-11 border-slate-200"
                data-testid="postal-filter"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-64 h-11 border-slate-200" data-testid="category-filter">
                <Filter className="w-4 h-4 mr-2 text-[#A0AEC0]" />
                <SelectValue placeholder={t("select_category", language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === "es" ? "Todas las categorías" : "All categories"}
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-[#A0AEC0] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1A202C] mb-2">
              {language === "es" 
                ? "No se encontraron proveedores"
                : "No providers found"}
            </h3>
            <p className="text-[#718096]">
              {language === "es"
                ? "Intenta cambiar los filtros de búsqueda"
                : "Try changing your search filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {providers.map((provider) => (
              <Card 
                key={provider.provider_id}
                className="group cursor-pointer border border-slate-200 hover:border-[#E07A5F]/30 hover:shadow-lg transition-all duration-200 bg-white"
                onClick={() => navigate(`/providers/${provider.provider_id}`)}
                data-testid={`provider-card-${provider.provider_id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {provider.picture ? (
                      <img 
                        src={provider.picture} 
                        alt={provider.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#0F4C75] flex items-center justify-center text-white text-xl font-bold">
                        {provider.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#1A202C] truncate group-hover:text-[#0F4C75] transition-colors">
                          {provider.name}
                        </h3>
                        {provider.verified && (
                          <Shield className="w-4 h-4 text-[#38A169] flex-shrink-0" />
                        )}
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 text-[#D69E2E] fill-[#D69E2E]" />
                        <span className="text-sm font-medium text-[#1A202C]">
                          {provider.rating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-sm text-[#718096]">
                          ({provider.total_reviews || 0})
                        </span>
                      </div>

                      {/* Response time */}
                      <div className="flex items-center gap-1 text-sm text-[#718096]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {language === "es" ? "Responde en" : "Responds in"} {provider.response_time || "24h"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {provider.bio && (
                    <p className="mt-4 text-sm text-[#4A5568] line-clamp-2">
                      {provider.bio}
                    </p>
                  )}

                  {/* Services preview */}
                  {provider.services?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {provider.services.slice(0, 3).map((service, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary"
                          className="bg-[#F1F5F9] text-[#4A5568] text-xs"
                        >
                          {service.name}
                          {service.price && (
                            <span className="ml-1 text-[#E07A5F] font-mono">
                              €{service.price}
                            </span>
                          )}
                        </Badge>
                      ))}
                      {provider.services.length > 3 && (
                        <Badge variant="secondary" className="bg-[#F1F5F9] text-[#718096] text-xs">
                          +{provider.services.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Availability */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Badge 
                      className={
                        provider.availability === "available" 
                          ? "bg-[#38A169]/10 text-[#38A169] border-0" 
                          : "bg-[#D69E2E]/10 text-[#D69E2E] border-0"
                      }
                    >
                      {provider.availability === "available" 
                        ? t("available", language) 
                        : t("busy", language)}
                    </Badge>
                    
                    {provider.postal_code && (
                      <span className="text-xs text-[#A0AEC0] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {provider.postal_code}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
