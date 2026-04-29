import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  ArrowLeftCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:5000";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Clear only our auth keys
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("agency");
      localStorage.removeItem("responder");
      localStorage.removeItem("responderTeamId");

      const endpoints = [
        { url: `${API_BASE}/api/users/login`, role: "admin" },
        { url: `${API_BASE}/api/agency/agent-login`, role: "agency" },
        { url: `${API_BASE}/api/responderTeam/login`, role: "responder" },
      ];

      for (const ep of endpoints) {
        try {
          const res = await axios.post(ep.url, form);
          const token = res.data.token || res.data.accessToken;
          if (!token) continue;

          // normalize payload
          const userData =
            res.data.user ||
            res.data.agency ||
            res.data.agent ||
            res.data.responder ||
            res.data[ep.role];

          localStorage.setItem("token", token);
          localStorage.setItem("role", ep.role);
          localStorage.setItem("user", JSON.stringify(userData || {}));

          if (ep.role === "agency") {
            localStorage.setItem("agency", JSON.stringify(userData || {}));
          }

          if (ep.role === "responder") {
            localStorage.setItem("responder", JSON.stringify(userData || {}));
            const responderTeamId = userData?.responderTeamId ?? userData?.id;
            if (responderTeamId) {
              localStorage.setItem("responderTeamId", String(responderTeamId));
            }
          }

          if (res.data.mustChangePassword) return navigate("/change-password");

          const targetRole =
            userData?.role === "serviceadmin" ? "service-admin" : ep.role;

          return navigate(`/dashboard/${targetRole}`);
        } catch (err) {
          // try next endpoint
          continue;
        }
      }

      throw new Error("Invalid Personnel Credentials.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Authentication failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-blue-600 font-['Inter'] selection:bg-white/30 overflow-hidden relative">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');`}
      </style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-400/30 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-800/40 blur-[160px] rounded-full" />
      </div>

      <motion.button
        whileHover={{ x: -4, opacity: 1 }}
        onClick={() => navigate("/")}
        className="absolute top-10 left-10 flex items-center gap-3 text-white/70 transition-all z-50 group font-['Plus_Jakarta_Sans']"
      >
        <ArrowLeftCircle size={28} strokeWidth={1.5} />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
          System Portal
        </span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px] px-6"
      >
        <div className="flex justify-center items-center gap-5 mb-10 font-['Plus_Jakarta_Sans']">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold text-white tracking-tighter leading-none text-center">
              BAHIRLINK
            </h1>
            <span className="text-[9px] opacity-60 font-bold tracking-[0.5em] uppercase mt-2 text-center">
              Secure Terminal
            </span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(30,58,138,0.3)]">
          <div className="mb-8 font-['Plus_Jakarta_Sans']">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Sign In
            </h2>
            <p className="text-[11px] text-white/50 font-medium mt-1 uppercase tracking-wider">
              Infrastructure Access
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl mb-6 flex items-center gap-3"
              >
                <AlertCircle className="w-4 h-4 text-white" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/70 font-bold ml-1">
                Personnel Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-[14px] text-white focus:bg-white/10 focus:border-white/40 outline-none transition-all placeholder:text-white/20"
                  placeholder="name@agency.gov.et"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/70 font-bold ml-1">
                Access Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-[14px] text-white focus:bg-white/10 focus:border-white/40 outline-none transition-all placeholder:text-white/20"
                  placeholder="••••••••••••"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-1 rounded-md active:scale-90"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={2} />
                  ) : (
                    <Eye size={18} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ y: -2, backgroundColor: "white" }}
              whileTap={{ y: 0 }}
              className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-[13px] shadow-lg flex items-center justify-center transition-all disabled:opacity-50 mt-4 uppercase tracking-widest"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <span>Enter Terminal</span>
                  <ChevronRight size={16} />
                </div>
              )}
            </motion.button>
          </form>
        </div>

        <div className="mt-10 flex justify-center items-center gap-6 text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white/80 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            <span>Encrypted Connection</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} strokeWidth={2.5} />
            <span>Secure Access</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;