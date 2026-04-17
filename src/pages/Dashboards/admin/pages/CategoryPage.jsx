import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2 } from "lucide-react";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          "http://localhost:5000/api/categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setCategories(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setSelectedCategory(category);

    setFormData({
      name: category.name || "",
      type: category.type || "",
    });

    setIsEditOpen(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(`http://localhost:5000/api/categories/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // update UI instantly
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === selectedCategory.id ? { ...cat, ...formData } : cat,
        ),
      );

      setIsEditOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update category");
    }
  };

  // =========================
  // DELETE CATEGORY
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0052CC] mb-2">Categories</h1>
        <p className="text-sm text-slate-500">
          Manage categories and emergency types
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <p className="p-6">Loading categories...</p>
        ) : error ? (
          <p className="p-6 text-red-500">{error}</p>
        ) : categories.length === 0 ? (
          <p className="p-6">No categories found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#0052CC] to-blue-600 text-white">
                <tr>
                  <th className="p-4 text-left">#</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Emergency Type</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-blue-50 transition">
                    <td className="p-4">{index + 1}</td>

                    <td className="p-4 font-medium">{cat.name}</td>

                    <td className="p-4">{cat.type || "-"}</td>

                    <td className="p-4">{cat.emergencyType?.name || "-"}</td>

                    {/* ACTIONS */}
                    <td className="p-4 flex gap-3 items-center">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================
          EDIT MODAL
      ========================= */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
            <h2 className="text-lg font-bold">Edit Category</h2>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Category Name"
              className="w-full border p-2 rounded"
            />

            <input
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Type"
              className="w-full border p-2 rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
