import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Code2, ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", form);
      login(data);
      const from = location.state?.from || "/";
      navigate(from);
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        navigate("/signup", { state: { from: location.state?.from } });
      } else {
        setError(error.response?.data?.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[500px] relative z-10">
        <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>

          {/* LOGO */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Code2 size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">CodeCollab</span>
          </div>

          <h1 className="text-5xl font-black text-white mb-4">Welcome back.</h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Sign in to access your workspaces and collaborate in real-time.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 pl-14 pr-6 py-4 rounded-2xl outline-none focus:border-emerald-500/50 transition-all text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 pl-14 pr-6 py-4 rounded-2xl outline-none focus:border-emerald-500/50 transition-all text-white"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm flex items-center gap-3">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-5 rounded-2xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-400">
            Don't have an account?{" "}
            <Link to="/signup" state={{ from: location.state?.from }} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
              Create one free
            </Link>
          </p>

          <div className="mt-12 pt-8 border-t border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
              Real-time • Collaborative • Secure
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}