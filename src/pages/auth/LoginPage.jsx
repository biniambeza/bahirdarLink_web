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
      let response;

      // ================= ADMIN LOGIN =================
      try {
        response = await axios.post(
          "http://localhost:5000/api/users/login",
          form,
        );

        const { user, accessToken, mustChangePassword } = response.data;

        if (!accessToken) throw new Error("No token received");

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", accessToken);
        localStorage.setItem("role", "admin");

        if (mustChangePassword) {
          navigate("/change-password");
          return;
        }

        navigate("/dashboard/admin");
        return;
      } catch {}

      // ================= AGENCY LOGIN =================
      try {
        response = await axios.post(
          "http://localhost:5000/api/agency/agent-login",
          form,
        );

        const { agency, token } = response.data;

        if (!token) throw new Error("No token received");

        localStorage.setItem("agency", JSON.stringify(agency));
        localStorage.setItem("token", token);
        localStorage.setItem("role", "agency");

        navigate("/dashboard/agency");
        return;
      } catch {}

      // ================= RESPONDER LOGIN =================
      try {
        response = await axios.post(
          "http://localhost:5000/api/responderTeam/login",
          form,
        );

        const { responder, token } = response.data;

        if (!token) throw new Error("No token received");

        localStorage.setItem("responder", JSON.stringify(responder));
        localStorage.setItem("token", token);
        localStorage.setItem("role", "responder");

        navigate("/dashboard/responder");
        return;
      } catch {}

      throw new Error("Invalid email or password");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden px-4">
      {/* Background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full opacity-20 blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-200 rounded-3xl shadow-2xl p-8 z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xl">
            <span className="text-white font-bold text-xl">BL</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">BahirLink</h2>
          <p className="text-sm text-gray-600">
            Emergency Command Center Login
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-2 rounded-md mb-4 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} BahirLink
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
