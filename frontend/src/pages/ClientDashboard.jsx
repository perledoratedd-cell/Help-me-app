import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, AuthContext, t, API } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import axios from "axios";
import { Clock, MessageSquare, CreditCard, Plus, ArrowRight } from "lucide-react";

export default function ClientDashboard() {
  const { language } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("hmn_token");
      try {
        const response = await axios.get(`${API}/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-[#D69E2E]/10 text-[#D69E2E]",
      accepted: "bg-[#3182CE]/10 text-[#3182CE]",
      in_progress: "bg-[#0F4C75]/10 text-[#0F4C75]",
      completed: "bg-[#38A169]/10 text-[#38A169]",
      cancelled: "bg-[#E53E3E]/10 text-[#E53E3E]"
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      es: {
        pending: "Pendiente",
        accepted: "Aceptado",
        in_progress: "En progreso",
        completed: "Completado",
        cancelled: "Cancelado"
      },
      en: {
        pending: "Pending",
        accepted: "Accepted",
        in_progress: "In progress",
        completed: "Completed",
        cancelled: "Cancelled"
      }
    };
    return texts[language]?.[status] || texts.en[status] || status;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9]" data-testid="client-dashboard">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A202C]">
              {t("welcome", language)}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-[#718096] mt-1">
              {language === "es" 
                ? "Gestiona tus solicitudes de ayuda"
                : "Manage your help requests"}
            </p>
          </div>
          
          <Button 
            onClick={() => navigate("/categories")}
            className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white font-semibold rounded-xl"
            data-testid="new-request-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === "es" ? "Nueva solicitud" : "New request"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D69E2E]/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#D69E2E]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A202C]">
                    {requests.filter(r => r.status === "pending").length}
                  </p>
                  <p className="text-sm text-[#718096]">
                    {language === "es" ? "Pendientes" : "Pending"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#3182CE]/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[#3182CE]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A202C]">
                    {requests.filter(r => ["accepted", "in_progress"].includes(r.status)).length}
                  </p>
                  <p className="text-sm text-[#718096]">
                    {language === "es" ? "En curso" : "In progress"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#38A169]/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-[#38A169]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A202C]">
                    {requests.filter(r => r.status === "completed").length}
                  </p>
                  <p className="text-sm text-[#718096]">
                    {language === "es" ? "Completados" : "Completed"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-[#1A202C]">
              {t("my_requests", language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse p-4 rounded-xl bg-slate-50">
                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-[#A0AEC0] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1A202C] mb-2">
                  {language === "es" 
                    ? "No tienes solicitudes aún"
                    : "You don't have any requests yet"}
                </h3>
                <p className="text-[#718096] mb-4">
                  {language === "es"
                    ? "Encuentra ayuda para cualquier tarea"
                    : "Find help for any task"}
                </p>
                <Button 
                  onClick={() => navigate("/categories")}
                  className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                >
                  {t("find_help", language)}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div 
                    key={request.request_id}
                    className="p-4 rounded-xl bg-[#F9F9F9] hover:bg-[#F1F5F9] transition-colors cursor-pointer group"
                    onClick={() => navigate(`/messages/${request.request_id}`)}
                    data-testid={`request-${request.request_id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[#1A202C] group-hover:text-[#0F4C75] transition-colors">
                            {request.title}
                          </h3>
                          <Badge className={`${getStatusColor(request.status)} border-0 text-xs`}>
                            {getStatusText(request.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#718096] line-clamp-1">
                          {request.description}
                        </p>
                        <p className="text-xs text-[#A0AEC0] mt-2">
                          {new Date(request.created_at).toLocaleDateString(language === "es" ? "es-ES" : "en-US")}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {request.price_agreed && (
                          <span className="font-mono font-bold text-[#E07A5F]">
                            €{request.price_agreed}
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-[#A0AEC0] group-hover:text-[#0F4C75] transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Become Provider CTA */}
        {user?.role !== "provider" && (
          <Card className="border-slate-200 mt-6 bg-gradient-to-r from-[#0F4C75] to-[#0F4C75]/90">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {language === "es" 
                      ? "¿Tienes habilidades que ofrecer?"
                      : "Have skills to offer?"}
                  </h3>
                  <p className="text-white/80">
                    {language === "es"
                      ? "Únete como proveedor y empieza a ganar"
                      : "Join as a provider and start earning"}
                  </p>
                </div>
                <Button 
                  onClick={() => navigate("/become-provider")}
                  className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white font-semibold"
                  data-testid="become-provider-btn"
                >
                  {t("become_provider", language)}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
