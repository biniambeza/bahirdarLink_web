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
      localStorage.clear();

      // ================= 1. ADMIN / SERVICE ADMIN LOGIN =================
      try {
        const adminRes = await axios.post(
          "http://localhost:5000/api/users/login",
          form,
        );

        if (adminRes.data.accessToken) {
          const { user, accessToken, mustChangePassword } = adminRes.data;

          localStorage.setItem("token", accessToken);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("role", user.role); // IMPORTANT FIX

          // ROUTE BASED ON ROLE
          const role = user.role;

          if (role === "admin") {
            return navigate(
              mustChangePassword ? "/change-password" : "/dashboard/admin",
            );
          }

          if (role === "serviceadmin") {
            return navigate("/dashboard/service-admin");
          }
        }
      } catch (err) {
        // continue
      }

      // ================= 2. AGENCY LOGIN =================
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
        // continue
      }

      // ================= 3. RESPONDER LOGIN =================
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
        // continue
      }

      throw new Error("Invalid email or password");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">BahirLink</h2>
          <p className="text-sm text-gray-600">Emergency System</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
