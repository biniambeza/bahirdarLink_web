import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const AddResponseTeamDrawer = ({ isOpen, onClose, onSave, agencyId = 1 }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    status: "active",
    kebeles: [],
    agencyId, // Backend requires this
  });

  const [kebeleInput, setKebeleInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync agencyId if it changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, agencyId }));
  }, [agencyId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add kebele to list
  const handleAddKebele = () => {
    const trimmed = kebeleInput.trim();
    if (trimmed && !formData.kebeles.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        kebeles: [...prev.kebeles, trimmed],
      }));
      setKebeleInput("");
    }
  };

  // Remove kebele from list
  const handleRemoveKebele = (kebele) => {
    setFormData((prev) => ({
      ...prev,
      kebeles: prev.kebeles.filter((k) => k !== kebele),
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.kebeles.length === 0) {
      alert("Please add at least one kebele.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:5000/api/responderTeam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save team");
      }

      onSave(data.data); // backend sends team in data
      onClose();
      setFormData((prev) => ({
        ...prev,
        name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        status: "active",
        kebeles: [],
      }));
    } catch (err) {
      console.error("AddResponseTeamDrawer Error:", err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "tween", duration: 0.35 }}
        className="fixed top-0 right-0 w-full max-w-md h-screen bg-white shadow-2xl z-50 p-8 overflow-y-auto rounded-l-3xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h3 className="text-2xl font-extrabold text-gray-800">
            Add Response Team
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {["name", "username", "email", "password", "phone"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-semibold text-gray-600 mb-1 capitalize">
                {field}
              </label>
              <input
                type={field === "password" ? "password" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required={field !== "phone"}
                placeholder={`Enter ${field}`}
                className="w-full p-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            </div>
          ))}

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Kebeles */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Kebeles
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {formData.kebeles.map((k) => (
                <span
                  key={k}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                >
                  {k}
                  <button
                    type="button"
                    onClick={() => handleRemoveKebele(k)}
                    className="hover:text-red-500 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={kebeleInput}
                onChange={(e) => setKebeleInput(e.target.value)}
                placeholder="Add kebele"
                className="flex-1 p-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={handleAddKebele}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow hover:scale-105 transition transform"
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 text-white rounded-2xl font-bold shadow-lg transition transform ${
              submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105"
            }`}
          >
            {submitting ? "Saving..." : "Save Team"}
          </button>
        </form>
      </motion.div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}></div>
      )}
    </>
  );
};

export default AddResponseTeamDrawer;
