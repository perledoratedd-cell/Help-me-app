import { useState, useEffect, useContext } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { LanguageContext, AuthContext, t, API } from "../App";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeft, MapPin, Clock, Send } from "lucide-react";

export default function RequestService() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("provider");
  
  const { language } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    urgency: "normal",
    postal_code: user?.postal_code || "",
    category_id: categoryId || ""
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories?language=${language}`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error(language === "es" ? "Completa todos los campos" : "Complete all fields");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("hmn_token");

    try {
      const response = await axios.post(`${API}/requests`, {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id || categoryId,
        urgency: formData.urgency,
        postal_code: formData.postal_code,
        provider_id: providerId || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(
        language === "es" 
          ? "Solicitud enviada correctamente"
          : "Request sent successfully"
      );
      
      navigate(`/messages/${response.data.request_id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error sending request");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.category_id === (formData.category_id || categoryId));

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9] py-8">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
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
              {t("request_service", language)}
            </CardTitle>
            <CardDescription>
              {language === "es"
                ? "Describe lo que necesitas y te conectaremos con ayuda"
                : "Describe what you need and we'll connect you with help"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category */}
              <div className="space-y-2">
                <Label>
                  {language === "es" ? "Categoría" : "Category"}
                </Label>
                <Select 
                  value={formData.category_id || categoryId}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v }))}
                >
                  <SelectTrigger className="h-12 border-slate-200" data-testid="request-category">
                    <SelectValue placeholder={t("select_category", language)} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {language === "es" ? "Título de la solicitud" : "Request title"}
                </Label>
                <Input
                  id="title"
                  placeholder={language === "es" 
                    ? "Ej: Necesito ayuda con limpieza de casa"
                    : "E.g: Need help with house cleaning"}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="h-12 border-slate-200"
                  data-testid="request-title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {language === "es" ? "Descripción detallada" : "Detailed description"}
                </Label>
                <Textarea
                  id="description"
                  placeholder={language === "es" 
                    ? "Describe exactamente lo que necesitas, cuándo y cualquier detalle importante..."
                    : "Describe exactly what you need, when, and any important details..."}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[120px] border-slate-200"
                  data-testid="request-description"
                />
              </div>

              {/* Urgency */}
              <div className="space-y-2">
                <Label>
                  {language === "es" ? "Urgencia" : "Urgency"}
                </Label>
                <div className="flex gap-2">
                  {[
                    { value: "flexible", label: language === "es" ? "Flexible" : "Flexible", color: "border-slate-200" },
                    { value: "normal", label: "Normal", color: "border-slate-200" },
                    { value: "urgent", label: language === "es" ? "Urgente" : "Urgent", color: "border-[#E07A5F]" }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={formData.urgency === option.value ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, urgency: option.value }))}
                      className={formData.urgency === option.value 
                        ? (option.value === "urgent" ? "bg-[#E07A5F] hover:bg-[#E07A5F]/90" : "bg-[#0F4C75] hover:bg-[#0F4C75]/90")
                        : option.color}
                      data-testid={`urgency-${option.value}`}
                    >
                      {option.value === "urgent" && <Clock className="w-4 h-4 mr-1" />}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <Label htmlFor="postal_code">
                  {language === "es" ? "Tu código postal" : "Your postal code"}
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                  <Input
                    id="postal_code"
                    placeholder="28001"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    className="pl-10 h-12 border-slate-200"
                    data-testid="request-postal"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                disabled={loading}
                data-testid="submit-request"
              >
                {loading ? (
                  t("loading", language)
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {language === "es" ? "Enviar solicitud" : "Send request"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
