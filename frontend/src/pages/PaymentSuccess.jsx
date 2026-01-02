import { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LanguageContext, t, API } from "../App";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import axios from "axios";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  
  const [status, setStatus] = useState("checking");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      if (!sessionId || attempts >= 5) {
        setStatus(attempts >= 5 ? "timeout" : "error");
        return;
      }

      const token = localStorage.getItem("hmn_token");
      try {
        const response = await axios.get(`${API}/payments/stripe/status/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.payment_status === "paid") {
          setStatus("success");
        } else if (response.data.status === "expired") {
          setStatus("expired");
        } else {
          // Continue polling
          setAttempts(prev => prev + 1);
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        setStatus("error");
      }
    };

    checkStatus();
  }, [sessionId, attempts]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9] flex items-center justify-center px-4">
      <Card className="max-w-md w-full border-slate-200">
        <CardContent className="p-8 text-center">
          {status === "checking" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[#3182CE]/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <div className="w-8 h-8 border-4 border-[#3182CE] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-bold text-[#1A202C] mb-2">
                {language === "es" ? "Verificando pago..." : "Verifying payment..."}
              </h2>
            </>
          ) : status === "success" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[#38A169]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#38A169]" />
              </div>
              <h2 className="text-xl font-bold text-[#1A202C] mb-2">
                {t("payment_success", language)}
              </h2>
              <p className="text-[#718096] mb-6">
                {language === "es" 
                  ? "Tu pago ha sido procesado correctamente"
                  : "Your payment has been processed successfully"}
              </p>
              <Button 
                onClick={() => navigate("/dashboard")}
                className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
              >
                {language === "es" ? "Ir al panel" : "Go to dashboard"}
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[#E53E3E]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-[#1A202C] mb-2">
                {language === "es" ? "Error en el pago" : "Payment error"}
              </h2>
              <p className="text-[#718096] mb-6">
                {language === "es" 
                  ? "Hubo un problema al verificar tu pago"
                  : "There was a problem verifying your payment"}
              </p>
              <Button 
                onClick={() => navigate("/dashboard")}
                className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white"
              >
                {language === "es" ? "Volver" : "Go back"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
