import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Code2 } from "lucide-react";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Failed to authenticate. Please try again.");
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        login({ token, user });
        navigate("/", { replace: true });
      } catch {
        setError("Invalid response from provider.");
      }
    } else {
      setError("Missing authentication data.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6">
        <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10 text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6">
      <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10 text-center">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black mx-auto mb-6 animate-pulse">
          <Code2 size={24} />
        </div>
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}
