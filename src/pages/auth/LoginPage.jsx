import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        form,
      );

      const { user, accessToken, mustChangePassword } = res.data;

      if (!accessToken) {
        throw new Error("Login failed: No token received");
      }

      // ✅ Store auth data
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", accessToken);

      // ✅ Force password change (temporary password case)
      if (mustChangePassword) {
        navigate("/change-password");
        return;
      }

      // ✅ Role-based navigation
      if (user.role === "admin") {
        navigate("/dashboard/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.error || err.message || "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          {/* Logo / Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <span className="text-white font-bold text-xl">BL</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">BahirLink</h2>
            <p className="text-sm text-gray-500">
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
