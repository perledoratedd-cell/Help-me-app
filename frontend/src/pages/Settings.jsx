import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, AuthContext, t, API, LANGUAGES } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeft, User, Globe, MapPin, Save } from "lucide-react";

export default function Settings() {
  const { language, setLanguage } = useContext(LanguageContext);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    preferred_language: user?.preferred_language || language,
    postal_code: user?.postal_code || ""
  });

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem("hmn_token");

    try {
      await axios.put(`${API}/users/profile`, {
        name: formData.name,
        preferred_language: formData.preferred_language,
        postal_code: formData.postal_code
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(prev => ({
        ...prev,
        name: formData.name,
        preferred_language: formData.preferred_language,
        postal_code: formData.postal_code
      }));
      
      setLanguage(formData.preferred_language);
      
      toast.success(language === "es" ? "Perfil actualizado" : "Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

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
              {t("settings", language)}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#4A5568]">
                {t("name", language)}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10 h-12 border-slate-200"
                  data-testid="settings-name"
                />
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="text-[#4A5568]">
                {language === "es" ? "Idioma preferido" : "Preferred language"}
              </Label>
              <Select 
                value={formData.preferred_language} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, preferred_language: v }))}
              >
                <SelectTrigger className="h-12 border-slate-200" data-testid="settings-language">
                  <Globe className="w-4 h-4 mr-2 text-[#A0AEC0]" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postal_code" className="text-[#4A5568]">
                {language === "es" ? "Código postal" : "Postal code"}
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  className="pl-10 h-12 border-slate-200"
                  placeholder="28001"
                  data-testid="settings-postal"
                />
              </div>
            </div>

            {/* Email (read only) */}
            <div className="space-y-2">
              <Label className="text-[#4A5568]">{t("email", language)}</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="h-12 border-slate-200 bg-[#F9F9F9] text-[#718096]"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-12 bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white font-semibold rounded-xl"
              data-testid="save-settings"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? t("loading", language) : (language === "es" ? "Guardar cambios" : "Save changes")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
