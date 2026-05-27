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
  ArrowLeft,
  Eye,
  EyeOff,
  Fingerprint,
  Activity,
} from "lucide-react";
import axios from "axios";

const API_BASE = (() => {
  try {
    return window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://bahirlink-backend-1.onrender.com";
  } catch {
    return "https://bahirlink-backend-1.onrender.com";
  }
})();

const RENDER_FALLBACK = "https://bahirlink-backend-1.onrender.com";

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

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

    let endpoints = [];
    if (!isEmail) {
      endpoints = [
        { url: `${API_BASE}/api/agency/agent-login`, fallbackUrl: `${RENDER_FALLBACK}/api/agency/agent-login`, role: "agency" },
      ];
    } else {
      endpoints = [
        { url: `${API_BASE}/api/users/login`, fallbackUrl: `${RENDER_FALLBACK}/api/users/login`, role: "admin" },
        { url: `${API_BASE}/api/users/login`, fallbackUrl: `${RENDER_FALLBACK}/api/users/login`, role: "service-admin" },
        { url: `${API_BASE}/api/agency/agent-login`, fallbackUrl: `${RENDER_FALLBACK}/api/agency/agent-login`, role: "agency" },
        { url: `${API_BASE}/api/responderTeam/login`, fallbackUrl: `${RENDER_FALLBACK}/api/responderTeam/login`, role: "responder" },
      ];
    }

    try {
      localStorage.clear();
      let successfulAuth = null;

      for (const ep of endpoints) {
        try {
          let res;
          try {
            // Attempt initial target url (could be localhost or Render)
            res = await axios.post(ep.url, {
              username: form.email.trim(),
              email: form.email.trim(),
              password: form.password,
            });
          } catch (primaryErr) {
            // If primary endpoint fails and fallback is different (e.g. localhost was down), try Render API
            if (ep.url !== ep.fallbackUrl) {
              res = await axios.post(ep.fallbackUrl, {
                username: form.email.trim(),
                email: form.email.trim(),
                password: form.password,
              });
            } else {
              throw primaryErr;
            }
          }

          const token = res.data.token || res.data.accessToken;
          if (!token) continue;

          successfulAuth = {
            resData: res.data,
            role: ep.role,
            token,
          };

          break;
        } catch (err) {
          continue;
        }
      }

      if (successfulAuth) {
        const { resData, role, token } = successfulAuth;

        const rawUserData =
          resData.user ||
          resData.agency ||
          resData.agent ||
          resData.responder ||
          resData.responderTeam ||
          resData[role];
        const userData = rawUserData || {};

        localStorage.setItem("token", token);

        if (
          role === "service-admin" ||
          (role === "admin" && userData?.role === "serviceadmin")
        ) {
          localStorage.setItem("role", "service-admin");
          localStorage.setItem(
            "user",
            JSON.stringify({ ...userData, role: "serviceadmin" }),
          );
        } else {
          localStorage.setItem("role", role);
        }

        if (role === "responder") {
          localStorage.setItem("responder", JSON.stringify(userData));
          const teamId = userData?.responderTeamId ?? userData?.id;
          if (teamId) localStorage.setItem("responderTeamId", String(teamId));
        } else if (
          role !== "service-admin" &&
          !(role === "admin" && userData?.role === "serviceadmin")
        ) {
          localStorage.setItem("user", JSON.stringify({ ...userData, role }));
        }

        if (role === "agency") {
          localStorage.setItem("agency", JSON.stringify(userData));
        }

        if (resData.mustChangePassword) {
          setLoading(false);
          return navigate("/change-password");
        }

        const targetRole =
          role === "service-admin" ||
          (role === "admin" && userData?.role === "serviceadmin")
            ? "service-admin"
            : role;

        setLoading(false);
        return navigate(`/dashboard/${targetRole}`);
      } else {
        throw new Error("Personnel record not found in secure database.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Authentication failed.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex items-center justify-center p-4 selection:bg-blue-200 overflow-hidden relative">
      {/* Safe Mesh Background with disabled pointer interactions */}
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          background: `
            radial-gradient(circle at 10% 20%, #dbeafe 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, #eff6ff 0%, transparent 40%)
          `,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white border border-white"
      >
        {/* LEFT SECTION: Visual Brand */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                <Activity className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">
                Bahir<span className="text-blue-200">Link</span>
              </h1>
            </div>

            <div className="space-y-6">
              <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tight">
                Command & <br />
                <span className="text-blue-200">Control.</span>
              </h2>
              <p className="text-blue-100 text-lg max-w-sm font-medium leading-relaxed opacity-90">
                Secure gateway for authorized personnel and emergency
                coordination teams.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-blue-200 uppercase bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              System Protocol: Active
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-[2rem] bg-white/10 border border-white/20 backdrop-blur-md">
                <ShieldCheck className="text-blue-200 mb-3" size={24} />
                <p className="text-[10px] uppercase font-black text-blue-300 tracking-wider">
                  Security
                </p>
                <p className="text-sm font-bold">AES-256</p>
              </div>
              <div className="p-5 rounded-[2rem] bg-white/10 border border-white/20 backdrop-blur-md">
                <Fingerprint className="text-blue-200 mb-3" size={24} />
                <p className="text-[10px] uppercase font-black text-blue-300 tracking-wider">
                  Access
                </p>
                <p className="text-sm font-bold">Multi-Layer</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Clean Form */}
        <div className="p-8 lg:p-20 flex flex-col justify-center bg-white relative">
          <div className="mb-10">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">
              Login
            </h3>
            <p className="text-slate-500 mt-3 font-medium text-lg">
              Enter your credentials to continue
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-8 flex items-center gap-3"
              >
                <div className="bg-red-500 p-1 rounded-full">
                  <AlertCircle className="w-4 h-4 text-white shrink-0" />
                </div>
                <p className="text-sm font-bold text-red-600 tracking-tight">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Official Identifier
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-14 py-5 text-base text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-semibold shadow-sm focus:shadow-blue-100"
                  placeholder="username or email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Security Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-14 py-5 text-base text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-semibold shadow-sm focus:shadow-blue-100"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-all p-1 z-20"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-200 flex items-center justify-center transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-3">
                  Authenticate <ChevronRight size={18} />
                </span>
              )}
            </motion.button>
          </form>

          <button
            onClick={() => navigate("/")}
            className="mt-10 flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all text-xs font-black uppercase tracking-tighter mx-auto relative z-20"
          >
            <ArrowLeft size={14} />
            Back to Portal
          </button>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 w-full flex justify-center items-center gap-6 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase z-20">
        <span className="hover:text-blue-600 cursor-pointer transition-colors">
          Privacy
        </span>
        <div className="w-1 h-1 bg-slate-300 rounded-full" />
        <span className="hover:text-blue-600 cursor-pointer transition-colors">
          Support
        </span>
        <div className="w-1 h-1 bg-slate-300 rounded-full" />
        <span className="text-blue-500/50">SECURED BY BAHIRLINK</span>
      </div>
    </div>
  );
};

export default LoginPage;