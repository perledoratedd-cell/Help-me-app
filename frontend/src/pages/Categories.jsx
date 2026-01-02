import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LanguageContext, t, API } from "../App";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import axios from "axios";
import { 
  Search, 
  ChefHat, 
  Flower2, 
  Scissors, 
  Brain, 
  Sparkles, 
  Truck, 
  Baby, 
  Heart,
  Wrench,
  Eye,
  BookOpen,
  Laptop,
  Cat,
  Shirt,
  Paintbrush
} from "lucide-react";

const ICON_MAP = {
  ChefHat: ChefHat,
  Flower2: Flower2,
  Scissors: Scissors,
  Brain: Brain,
  Sparkles: Sparkles,
  Truck: Truck,
  Baby: Baby,
  Heart: Heart,
  Wrench: Wrench,
  Eye: Eye,
  BookOpen: BookOpen,
  Laptop: Laptop,
  Cat: Cat,
  Shirt: Shirt,
  Paintbrush: Paintbrush,
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

  const getIcon = (iconName) => {
    const Icon = ICON_MAP[iconName] || Sparkles;
    return Icon;
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-slate-200 mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                </CardContent>
              </Card>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
            {filteredCategories.map((category) => {
              const Icon = getIcon(category.icon);
              return (
                <Card 
                  key={category.category_id}
                  className="group cursor-pointer border border-slate-200 hover:border-[#E07A5F]/30 hover:shadow-lg transition-all duration-200 bg-white"
                  onClick={() => navigate(`/providers?category=${category.category_id}${urgency ? '&urgency=urgent' : ''}`)}
                  data-testid={`category-card-${category.category_id}`}
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#E07A5F]/10 to-[#E07A5F]/5 flex items-center justify-center mb-4 group-hover:from-[#E07A5F]/20 group-hover:to-[#E07A5F]/10 transition-colors">
                      <Icon className="w-7 h-7 text-[#E07A5F]" />
                    </div>
                    <h3 className="font-semibold text-lg text-[#1A202C] mb-2 group-hover:text-[#0F4C75] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-[#718096] line-clamp-2">
                      {category.description}
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
