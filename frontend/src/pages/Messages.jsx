import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LanguageContext, AuthContext, t, API } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeft, Send, CreditCard, Globe } from "lucide-react";

export default function Messages() {
  const { requestId } = useParams();
  const { language } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("hmn_token");
      try {
        const [requestRes, messagesRes] = await Promise.all([
          axios.get(`${API}/requests/${requestId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/messages/${requestId}?language=${language}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setRequest(requestRes.data);
        setMessages(messagesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(language === "es" ? "Error al cargar" : "Error loading");
      } finally {
        setLoading(false);
      }
    };
    
    if (requestId !== "all") {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [requestId, language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const token = localStorage.getItem("hmn_token");
    const receiverId = request.client_id === user.user_id 
      ? request.provider_id 
      : request.client_id;

    if (!receiverId) {
      toast.error(language === "es" ? "No hay destinatario" : "No recipient");
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(`${API}/messages`, {
        request_id: requestId,
        receiver_id: receiverId,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, {
        message_id: response.data.message_id,
        sender_id: user.user_id,
        receiver_id: receiverId,
        content: newMessage,
        created_at: new Date().toISOString()
      }]);
      
      setNewMessage("");
    } catch (error) {
      toast.error(language === "es" ? "Error al enviar" : "Error sending");
    } finally {
      setSending(false);
    }
  };

  const handlePayment = async () => {
    const token = localStorage.getItem("hmn_token");
    try {
      const response = await axios.post(`${API}/payments/stripe/checkout`, {
        request_id: requestId,
        origin_url: window.location.origin
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      window.location.href = response.data.url;
    } catch (error) {
      toast.error(language === "es" ? "Error al iniciar pago" : "Error initiating payment");
    }
  };

  if (requestId === "all") {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9] py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#1A202C] mb-4">
            {t("messages", language)}
          </h1>
          <Card className="border-slate-200">
            <CardContent className="p-8 text-center">
              <p className="text-[#718096]">
                {language === "es" 
                  ? "Selecciona una solicitud para ver los mensajes"
                  : "Select a request to view messages"}
              </p>
              <Button 
                onClick={() => navigate("/dashboard")}
                className="mt-4 bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
              >
                {language === "es" ? "Ver solicitudes" : "View requests"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9] flex items-center justify-center">
        <div className="animate-pulse-gentle text-[#0F4C75]">{t("loading", language)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="text-[#718096]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1">
            <h1 className="font-semibold text-[#1A202C]">{request?.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={
                request?.status === "completed" 
                  ? "bg-[#38A169]/10 text-[#38A169] border-0" 
                  : "bg-[#3182CE]/10 text-[#3182CE] border-0"
              }>
                {request?.status}
              </Badge>
              {request?.price_agreed && (
                <span className="text-sm font-mono text-[#E07A5F]">
                  €{request.price_agreed}
                </span>
              )}
            </div>
          </div>

          {/* Payment button for clients */}
          {request?.status !== "completed" && 
           request?.price_agreed && 
           request?.client_id === user?.user_id && (
            <Button
              onClick={handlePayment}
              className="bg-[#38A169] hover:bg-[#38A169]/90 text-white"
              data-testid="pay-btn"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {language === "es" ? "Pagar" : "Pay"}
            </Button>
          )}
        </div>

        {/* Messages */}
        <Card className="border-slate-200 mb-4">
          <CardContent className="p-4">
            <div className="h-[400px] overflow-y-auto space-y-4 pr-2">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#718096]">
                  {language === "es" 
                    ? "No hay mensajes aún. ¡Inicia la conversación!"
                    : "No messages yet. Start the conversation!"}
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.user_id;
                  return (
                    <div 
                      key={msg.message_id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] ${isOwn ? "order-1" : ""}`}>
                        <div className={`rounded-2xl px-4 py-2 ${
                          isOwn 
                            ? "bg-[#0F4C75] text-white rounded-br-md" 
                            : "bg-white border border-slate-200 text-[#1A202C] rounded-bl-md"
                        }`}>
                          <p>{msg.content}</p>
                          
                          {/* Translated content */}
                          {msg.translated_content && Object.keys(msg.translated_content).length > 0 && (
                            <div className={`mt-2 pt-2 border-t ${isOwn ? "border-white/20" : "border-slate-100"}`}>
                              <div className="flex items-center gap-1 mb-1">
                                <Globe className="w-3 h-3 opacity-60" />
                                <span className={`text-xs ${isOwn ? "text-white/60" : "text-[#A0AEC0]"}`}>
                                  {language === "es" ? "Traducido" : "Translated"}
                                </span>
                              </div>
                              {Object.entries(msg.translated_content).map(([lang, text]) => (
                                <p key={lang} className={`text-sm ${isOwn ? "text-white/80" : "text-[#718096]"}`}>
                                  {text}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${isOwn ? "text-right" : ""} text-[#A0AEC0]`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder={language === "es" ? "Escribe un mensaje..." : "Type a message..."}
            className="h-12 border-slate-200"
            data-testid="message-input"
          />
          <Button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="h-12 px-6 bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
            data-testid="send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Note about visible communication */}
        <p className="text-xs text-[#A0AEC0] text-center mt-4">
          {language === "es" 
            ? "💡 Todos los mensajes quedan registrados como prueba del acuerdo"
            : "💡 All messages are recorded as proof of agreement"}
        </p>
      </div>
    </div>
  );
}
