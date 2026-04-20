import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const CrewSettingsPage = () => {
  const [form, setForm] = useState({
    name: "",
    role: "",
    status: "available",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // 🔹 Load crew info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("crewToken");

        const decoded = jwtDecode(token);
        const crewId = decoded.id;

        const res = await axios.get(
          `http://localhost:5000/api/crew/${crewId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setForm((prev) => ({
          ...prev,
          name: res.data.name || "",
          role: res.data.role || "",
          status: res.data.status || "available",
        }));
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  // 🔹 Handle change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Update profile
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("crewToken");

      const decoded = jwtDecode(token);
      const crewId = decoded.id;

      await axios.put(
        `http://localhost:5000/api/crew/${crewId}`,
        {
          name: form.name,
          role: form.role,
          status: form.status,
          password: form.password || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Profile updated successfully");
      setForm({ ...form, password: "" });
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("crewToken");
    window.location.href = "/login";
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Crew Settings</h2>

      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm text-gray-500">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Role */}
        <div>
          <label className="text-sm text-gray-500">Role</label>
          <input
            type="text"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-sm text-gray-500">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-gray-500">
            New Password (optional)
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            onClick={handleLogout}
            className="text-red-600 font-semibold"
          >
            Logout
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrewSettingsPage;