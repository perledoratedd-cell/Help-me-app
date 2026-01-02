import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LanguageContext, t, API } from "../App";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import axios from "axios";
import { Search, Sparkles } from "lucide-react";

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

export default function Categories() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories?language=${language}`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [language]);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const urgency = searchParams.get("urgency");

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1A202C]">
                {t("categories", language)}
              </h1>
              <p className="text-[#718096] mt-1">
                {language === "es" 
                  ? `${categories.length} categorías disponibles`
                  : `${categories.length} categories available`}
              </p>
            </div>
            
            {urgency === "urgent" && (
              <Badge className="bg-[#E07A5F] text-white px-4 py-2 text-sm">
                {language === "es" ? "Modo urgente activado" : "Urgent mode active"}
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
              <Input
                type="text"
                placeholder={language === "es" ? "Buscar categoría..." : "Search category..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-slate-200 focus:border-[#E07A5F] focus:ring-[#E07A5F]/20"
                data-testid="category-search"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-slate-200 mb-3"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-[#A0AEC0] mx-auto mb-4" />
            <p className="text-[#718096]">
              {language === "es" 
                ? "No se encontraron categorías"
                : "No categories found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 stagger">
            {filteredCategories.map((category) => {
              const imageUrl = CATEGORY_IMAGES[category.category_id] || "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg";
              
              return (
                <Card 
                  key={category.category_id}
                  className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white"
                  onClick={() => navigate(`/providers?category=${category.category_id}${urgency ? '&urgency=urgent' : ''}`)}
                  data-testid={`category-card-${category.category_id}`}
                >
                  {/* Image with overlay text */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={`${imageUrl}?w=400&h=300&fit=crop`}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    
                    {/* Category name on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-xl text-white drop-shadow-lg">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <CardContent className="p-4">
                    <p className="text-sm text-[#718096] line-clamp-2">
                      {category.description}
                    </p>
                    
                    {/* CTA hint */}
                    <p className="text-xs text-[#E07A5F] font-medium mt-3 group-hover:translate-x-1 transition-transform">
                      {language === "es" ? "Ver proveedores →" : "View providers →"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
