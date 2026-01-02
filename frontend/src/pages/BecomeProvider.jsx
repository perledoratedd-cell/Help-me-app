import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, AuthContext, t, API } from "../App";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeft, Plus, Trash2, MapPin } from "lucide-react";

export default function BecomeProvider() {
  const { language } = useContext(LanguageContext);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    bio: "",
    selectedCategories: [],
    services: [{ name: "", description: "", price: "" }],
    response_time: "24h",
    postal_code: ""
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories?language=${language}`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, [language]);

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { name: "", description: "", price: "" }]
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.selectedCategories.length === 0) {
      toast.error(language === "es" ? "Selecciona al menos una categoría" : "Select at least one category");
      return;
    }

    if (!formData.services[0]?.name) {
      toast.error(language === "es" ? "Añade al menos un servicio" : "Add at least one service");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("hmn_token");

    try {
      await axios.post(`${API}/providers/register`, {
        bio: formData.bio,
        categories: formData.selectedCategories,
        services: formData.services.filter(s => s.name).map(s => ({
          name: s.name,
          description: s.description,
          price: parseFloat(s.price) || null,
          per_hour: true
        })),
        response_time: formData.response_time,
        postal_code: formData.postal_code
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update user role
      setUser(prev => ({ ...prev, role: "provider" }));
      
      toast.success(
        language === "es" 
          ? "¡Registro completado! Ya eres proveedor"
          : "Registration complete! You're now a provider"
      );
      
      navigate("/provider-dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 text-[#718096] hover:text-[#1A202C] -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "es" ? "Volver" : "Back"}
        </Button>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1A202C]">
              {t("become_provider", language)}
            </CardTitle>
            <CardDescription>
              {language === "es"
                ? "Completa tu perfil para empezar a ofrecer servicios"
                : "Complete your profile to start offering services"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">
                  {language === "es" ? "Sobre ti" : "About you"}
                </Label>
                <Textarea
                  id="bio"
                  placeholder={language === "es" 
                    ? "Cuéntanos sobre tu experiencia y habilidades..."
                    : "Tell us about your experience and skills..."}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="min-h-[100px] border-slate-200"
                  data-testid="provider-bio"
                />
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <Label htmlFor="postal_code">
                  {language === "es" ? "Código postal" : "Postal code"}
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                  <Input
                    id="postal_code"
                    placeholder="28001"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    className="pl-10 border-slate-200"
                    data-testid="provider-postal"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <Label>
                  {language === "es" ? "Categorías de servicio" : "Service categories"}
                </Label>
                {fetchingCategories ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-10 bg-slate-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <div 
                        key={cat.category_id}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.selectedCategories.includes(cat.category_id)
                            ? "border-[#E07A5F] bg-[#E07A5F]/5"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => handleCategoryToggle(cat.category_id)}
                        data-testid={`cat-${cat.category_id}`}
                      >
                        <Checkbox 
                          checked={formData.selectedCategories.includes(cat.category_id)}
                          className="pointer-events-none"
                        />
                        <span className="text-sm text-[#1A202C]">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Services */}
              <div className="space-y-3">
                <Label>
                  {language === "es" ? "Tus servicios y precios" : "Your services & prices"}
                </Label>
                
                {formData.services.map((service, index) => (
                  <div key={index} className="p-4 rounded-xl bg-[#F9F9F9] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#718096]">
                        {language === "es" ? `Servicio ${index + 1}` : `Service ${index + 1}`}
                      </span>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="text-[#E53E3E] hover:text-[#E53E3E]/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <Input
                      placeholder={language === "es" ? "Nombre del servicio" : "Service name"}
                      value={service.name}
                      onChange={(e) => updateService(index, "name", e.target.value)}
                      className="border-slate-200"
                      data-testid={`service-name-${index}`}
                    />
                    
                    <Input
                      placeholder={language === "es" ? "Descripción breve" : "Brief description"}
                      value={service.description}
                      onChange={(e) => updateService(index, "description", e.target.value)}
                      className="border-slate-200"
                    />
                    
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]">€</span>
                      <Input
                        type="number"
                        placeholder={language === "es" ? "Precio por hora" : "Price per hour"}
                        value={service.price}
                        onChange={(e) => updateService(index, "price", e.target.value)}
                        className="pl-8 border-slate-200"
                        data-testid={`service-price-${index}`}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addService}
                  className="w-full border-dashed border-slate-300 text-[#718096]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {language === "es" ? "Añadir otro servicio" : "Add another service"}
                </Button>
              </div>

              {/* Response Time */}
              <div className="space-y-2">
                <Label>
                  {language === "es" ? "Tiempo de respuesta" : "Response time"}
                </Label>
                <div className="flex gap-2">
                  {["1h", "4h", "24h", "48h"].map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={formData.response_time === time ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, response_time: time }))}
                      className={formData.response_time === time 
                        ? "bg-[#0F4C75] hover:bg-[#0F4C75]/90" 
                        : "border-slate-200"}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white font-semibold rounded-xl"
                disabled={loading}
                data-testid="submit-provider"
              >
                {loading 
                  ? t("loading", language)
                  : (language === "es" ? "Completar registro" : "Complete registration")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
