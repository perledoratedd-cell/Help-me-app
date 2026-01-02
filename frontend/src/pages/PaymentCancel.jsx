import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, t } from "../App";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F9F9F9] flex items-center justify-center px-4">
      <Card className="max-w-md w-full border-slate-200">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#D69E2E]/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-[#D69E2E]" />
          </div>
          <h2 className="text-xl font-bold text-[#1A202C] mb-2">
            {t("payment_cancel", language)}
          </h2>
          <p className="text-[#718096] mb-6">
            {language === "es" 
              ? "Has cancelado el proceso de pago. No se ha realizado ningún cargo."
              : "You have cancelled the payment process. No charges have been made."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-slate-200"
            >
              {language === "es" ? "Volver" : "Go back"}
            </Button>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
            >
              {language === "es" ? "Ir al panel" : "Go to dashboard"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
