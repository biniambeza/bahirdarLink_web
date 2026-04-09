import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API = "http://localhost:5000/api";

const EditResponderTeamDrawer = ({ isOpen, onClose, teamId, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    status: "active",
    kebeles: [],
    password: "",
  });
  const [allKebeles, setAllKebeles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !teamId) return;

    const fetchTeam = async () => {
      try {
        const res = await axios.get(`${API}/responderTeam/${teamId}`);
        const team = res.data.data || res.data;
        setFormData({
          name: team.name,
          username: team.username,
          email: team.email,
          phone: team.phone,
          status: team.status || "active",
          kebeles: team.kebeles ? team.kebeles.map((k) => k.id) : [],
          password: "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load team data.");
      }
    };

    const fetchKebeles = async () => {
      try {
        const res = await axios.get(`${API}/kebele`);
        setAllKebeles(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTeam();
    fetchKebeles();
  }, [isOpen, teamId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleKebele = (id) => {
    setFormData((prev) => ({
      ...prev,
      kebeles: prev.kebeles.includes(id)
        ? prev.kebeles.filter((k) => k !== id)
        : [...prev.kebeles, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axios.put(`${API}/responderTeam/${teamId}`, formData);
      onSave(); // refresh parent table
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update team.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 p-6 flex flex-col overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">Edit Responder Team</h2>
            {error && (
              <div className="p-2 mb-2 text-sm text-red-700 bg-red-100 rounded">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Team Name"
                value={formData.name}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Kebele buttons */}
              <div className="grid grid-cols-3 gap-2">
                {allKebeles.map((k) => (
                  <button
                    type="button"
                    key={k.id}
                    onClick={() => toggleKebele(k.id)}
                    className={`p-2 rounded-lg border ${
                      formData.kebeles.includes(k.id)
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    {k.name}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                {submitting ? "Updating..." : "Update Team"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditResponderTeamDrawer;
