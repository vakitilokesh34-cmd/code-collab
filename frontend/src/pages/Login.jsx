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

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">or continue with</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <div className="mt-6 flex gap-4">
            <a
              href={`${import.meta.env.VITE_API_URL || ""}/api/auth/google`}
              className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-slate-700 hover:border-slate-600 rounded-2xl py-4 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              <span className="text-sm font-medium text-slate-300">Google</span>
            </a>
            <a
              href={`${import.meta.env.VITE_API_URL || ""}/api/auth/github`}
              className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-slate-700 hover:border-slate-600 rounded-2xl py-4 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="text-sm font-medium text-slate-300">GitHub</span>
            </a>
          </div>

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