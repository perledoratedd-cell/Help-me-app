import { useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, API, t, LanguageContext } from "../App";
import axios from "axios";

export default function AuthCallback() {
  const hasProcessed = useRef(false);
  const { login } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      // Extract session_id from URL fragment
      const hash = window.location.hash;
      const sessionId = hash.split("session_id=")[1]?.split("&")[0];

      if (!sessionId) {
        navigate("/login");
        return;
      }

      try {
        // Exchange session_id for user data
        const response = await axios.post(
          `${API}/auth/session`,
          {},
          {
            headers: { "X-Session-ID": sessionId },
            withCredentials: true
          }
        );

        const userData = response.data;
        
        // Store token and set user
        login({
          user_id: userData.user_id,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
          role: userData.role,
          preferred_language: "es"
        }, userData.session_token);

        // Clear hash and redirect
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/login");
      }
    };

    processCallback();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#E07A5F]/80 flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
          <span className="text-white font-bold text-2xl">H</span>
        </div>
        <p className="text-[#718096]">{t("loading", language)}</p>
      </div>
    </div>
  );
}
