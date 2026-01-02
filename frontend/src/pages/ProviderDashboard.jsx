import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, AuthContext, t, API } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import axios from "axios";
import { Clock, MessageSquare, Euro, Settings, ArrowRight, CheckCircle } from "lucide-react";

export default function ProviderDashboard() {
  const { language } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState("available");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("hmn_token");
      try {
        const [requestsRes, profileRes] = await Promise.all([
          axios.get(`${API}/requests`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/users/provider-profile`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setRequests(requestsRes.data);
        if (profileRes.data) {
          setProfile(profileRes.data);
          setAvailability(profileRes.data.availability || "available");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleAvailability = async () => {
    const newAvailability = availability === "available" ? "busy" : "available";
    const token = localStorage.getItem("hmn_token");
    
    try {
      await axios.put(`${API}/providers/profile`, {
        availability: newAvailability
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailability(newAvailability);
      toast.success(
        language === "es" 
          ? `Estado cambiado a ${newAvailability === "available" ? "disponible" : "ocupado"}`
          : `Status changed to ${newAvailability}`
      );
    } catch (error) {
      toast.error(language === "es" ? "Error al cambiar estado" : "Error changing status");
    }
  };

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

  const acceptRequest = async (requestId) => {
    const token = localStorage.getItem("hmn_token");
    try {
      await axios.put(`${API}/requests/${requestId}`, {
        status: "accepted"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRequests(prev => prev.map(r => 
        r.request_id === requestId ? { ...r, status: "accepted" } : r
      ));
      
      toast.success(language === "es" ? "Solicitud aceptada" : "Request accepted");
    } catch (error) {
      toast.error(language === "es" ? "Error al aceptar" : "Error accepting");
    }
  };

  const earnings = requests
    .filter(r => r.status === "completed" && r.price_agreed)
    .reduce((sum, r) => sum + r.price_agreed, 0);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9]" data-testid="provider-dashboard">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A202C]">
              {language === "es" ? "Panel de proveedor" : "Provider Dashboard"}
            </h1>
            <p className="text-[#718096] mt-1">
              {language === "es" 
                ? "Gestiona tus servicios y solicitudes"
                : "Manage your services and requests"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Availability Toggle */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200">
              <span className="text-sm text-[#718096]">
                {language === "es" ? "Disponible" : "Available"}
              </span>
              <Switch 
                checked={availability === "available"}
                onCheckedChange={toggleAvailability}
                data-testid="availability-toggle"
              />
            </div>
            
            <Button 
              variant="outline"
              onClick={() => navigate("/settings")}
              className="border-slate-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              {t("settings", language)}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
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
                    {language === "es" ? "Nuevas" : "New"}
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
                    {language === "es" ? "Activas" : "Active"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#38A169]/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#38A169]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A202C]">
                    {requests.filter(r => r.status === "completed").length}
                  </p>
                  <p className="text-sm text-[#718096]">
                    {language === "es" ? "Completadas" : "Completed"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#E07A5F]/10 flex items-center justify-center">
                  <Euro className="w-6 h-6 text-[#E07A5F]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A202C] font-mono">
                    €{earnings.toFixed(0)}
                  </p>
                  <p className="text-sm text-[#718096]">
                    {language === "es" ? "Ganado" : "Earned"}
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
              {language === "es" ? "Solicitudes de servicio" : "Service Requests"}
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
                    ? "No hay solicitudes aún"
                    : "No requests yet"}
                </h3>
                <p className="text-[#718096]">
                  {language === "es"
                    ? "Las solicitudes de clientes aparecerán aquí"
                    : "Client requests will appear here"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div 
                    key={request.request_id}
                    className="p-4 rounded-xl bg-[#F9F9F9] hover:bg-[#F1F5F9] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[#1A202C]">
                            {request.title}
                          </h3>
                          <Badge className={`${getStatusColor(request.status)} border-0 text-xs`}>
                            {request.status}
                          </Badge>
                          {request.urgency === "urgent" && (
                            <Badge className="bg-[#E53E3E]/10 text-[#E53E3E] border-0 text-xs">
                              {language === "es" ? "Urgente" : "Urgent"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#718096] line-clamp-2">
                          {request.description}
                        </p>
                        <p className="text-xs text-[#A0AEC0] mt-2">
                          {new Date(request.created_at).toLocaleDateString(language === "es" ? "es-ES" : "en-US")}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {request.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => acceptRequest(request.request_id)}
                            className="bg-[#38A169] hover:bg-[#38A169]/90 text-white"
                            data-testid={`accept-${request.request_id}`}
                          >
                            {language === "es" ? "Aceptar" : "Accept"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/messages/${request.request_id}`)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
