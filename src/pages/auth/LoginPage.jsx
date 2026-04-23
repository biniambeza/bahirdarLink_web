import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Activity,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Clear existing session
      localStorage.clear();

      // ================= 1. ATTEMPT ADMIN / SERVICE ADMIN LOGIN =================
      try {
        const adminRes = await axios.post(
          "http://localhost:5000/api/users/login",
          form,
        );
        if (adminRes.data.accessToken) {
          const { user, accessToken, mustChangePassword } = adminRes.data;
          localStorage.setItem("token", accessToken);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("role", user.role);

          if (user.role === "admin") {
            return navigate(
              mustChangePassword ? "/change-password" : "/dashboard/admin",
            );
          }
          if (user.role === "serviceadmin") {
            return navigate("/dashboard/service-admin");
          }
        }
      } catch (err) {
        /* Silent fail to try next endpoint */
      }

      // ================= 2. ATTEMPT AGENCY LOGIN =================
      try {
        const agencyRes = await axios.post(
          "http://localhost:5000/api/agency/agent-login",
          form,
        );
        if (agencyRes.data.token) {
          const { agency, token } = agencyRes.data;
          localStorage.setItem("token", token);
          localStorage.setItem("role", "agency");
          localStorage.setItem("agency", JSON.stringify(agency));
          localStorage.setItem("user", JSON.stringify(agency));
          return navigate("/dashboard/agency");
        }
      } catch (err) {
        /* Silent fail */
      }

      // ================= 3. ATTEMPT RESPONDER LOGIN =================
      try {
        const responderRes = await axios.post(
          "http://localhost:5000/api/responderTeam/login",
          form,
        );
        if (responderRes.data.token) {
          const { responder, token } = responderRes.data;
          const userData = {
            ...responder,
            responderTeamId: responder.id || responder.responderTeamId,
          };
          localStorage.setItem("token", token);
          localStorage.setItem("role", "responder");
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("responder", JSON.stringify(userData));
          return navigate("/dashboard/responder");
        }
      } catch (err) {
        /* Silent fail */
      }

      // If all three fails
      throw new Error("Invalid email or password. Access Denied.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* LEFT SIDE: Info Panel */}
      <div className="hidden lg:flex w-1/2 bg-blue-700 items-center justify-center p-16 relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 text-white"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-white p-2.5 rounded-xl shadow-lg">
              <Activity className="text-blue-700 w-10 h-10" />
            </div>
            <span className="text-4xl font-black tracking-tighter">
              BahirLink
            </span>
          </div>
          <h2 className="text-6xl font-extrabold mb-8 leading-tight">
            Emergency <br />
            Response <br />
            Command.
          </h2>
          <div className="space-y-6 text-blue-50 max-w-md">
            <p className="text-xl font-light leading-relaxed">
              Real-time synchronization for dispatchers, medical teams, and
              agency administrators.
            </p>
            <div className="flex gap-4 items-center pt-4">
              <div className="h-[2px] w-12 bg-blue-400"></div>
              <span className="text-sm font-bold uppercase tracking-widest text-blue-300">
                Secure Access Point
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Header Only */}
          <div className="lg:hidden flex flex-col items-center mb-10 text-center">
            <ShieldCheck className="text-blue-600 w-12 h-12 mb-2" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
              BahirLink
            </h1>
          </div>

          <div className="mb-10">
            <h3 className="text-3xl font-bold text-slate-900">Portal Login</h3>
            <p className="text-slate-500 mt-2 font-medium">
              Please enter your authorized credentials.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Official Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. john.doe@agency.gov"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl px-12 py-4 text-slate-900 focus:ring-0 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl px-12 py-4 text-slate-900 focus:ring-0 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transform active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Authenticate Access</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
              <span>SYSTEM ID: BL-2026-HQ</span>
              <span>ENCRYPTED CONNECTION</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
