import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
      // 1. Always start with a clean slate
      localStorage.clear();

      // ================= 1. ATTEMPT ADMIN LOGIN =================
      try {
        const adminRes = await axios.post(
          "http://localhost:5000/api/users/login",
          form,
        );
        if (adminRes.data.accessToken) {
          const { user, accessToken, mustChangePassword } = adminRes.data;

          localStorage.setItem("token", accessToken);
          localStorage.setItem("role", "admin");
          localStorage.setItem("user", JSON.stringify(user));

          return navigate(
            mustChangePassword ? "/change-password" : "/dashboard/admin",
          );
        }
      } catch (err) {
        /* Move to next role */
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
          // Store under both keys for compatibility
          localStorage.setItem("agency", JSON.stringify(agency));
          localStorage.setItem("user", JSON.stringify(agency));

          return navigate("/dashboard/agency");
        }
      } catch (err) {
        /* Move to next role */
      }

      // ================= 3. ATTEMPT RESPONDER LOGIN =================
      try {
        const responderRes = await axios.post(
          "http://localhost:5000/api/responderTeam/login",
          form,
        );
        if (responderRes.data.token) {
          const { responder, token } = responderRes.data;

          // NORMALIZATION: Ensure AddCasePage can always find these IDs
          const userData = {
            ...responder,
            responderTeamId: responder.id || responder.responderTeamId,
            agencyId: responder.agencyId,
          };

          localStorage.setItem("token", token);
          localStorage.setItem("role", "responder");
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("responder", JSON.stringify(userData));

          return navigate("/dashboard/responder");
        }
      } catch (err) {
        /* Move to error handling */
      }

      // If all attempts failed
      throw new Error("Invalid email or password");
    } catch (err) {
      console.error("Login sequence failed:", err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden px-4">
      {/* Decorative Background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full opacity-20 blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-200 rounded-3xl shadow-2xl p-8 z-10"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xl">
            <span className="text-white font-bold text-xl">BL</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">BahirLink</h2>
          <p className="text-sm text-gray-600">Emergency Command Center</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold p-3 rounded-r-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
          />
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all uppercase text-xs tracking-widest"
          >
            {loading ? "Verifying..." : "Sign In"}
          </motion.button>
        </form>

        <p className="mt-8 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
          © {new Date().getFullYear()} BahirLink System
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
