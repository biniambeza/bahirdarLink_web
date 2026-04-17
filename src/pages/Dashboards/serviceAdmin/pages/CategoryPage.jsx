import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
// import AddServiceCategoryPanel from "./AddServiceCategoryPanel";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/service-categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch service types (for display)
  const fetchServiceTypes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/service-types", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) setServiceTypes(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchServiceTypes();
  }, []);

  const getServiceTypeName = (id) => {
    return serviceTypes.find((t) => t.id === id)?.name || "N/A";
  };

  // Filter
  const filtered = useMemo(() => {
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(search.toLowerCase()) ||
        getServiceTypeName(c.serviceTypeId)
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
  }, [search, categories, serviceTypes]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Service Categories</h1>
          <p className="text-gray-500 text-sm">
            Manage all service categories under each service type
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <PlusCircle size={18} />
          Add Category
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Service Type</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((cat) => (
                <motion.tr
                  key={cat.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center hover:bg-gray-50"
                >
                  <td className="py-2 px-4 border-b">{cat.id}</td>
                  <td className="py-2 px-4 border-b font-medium">{cat.name}</td>
                  <td className="py-2 px-4 border-b">
                    {cat.description || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {getServiceTypeName(cat.serviceTypeId)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Panel */}
      {showAdd && (
        <AddServiceCategoryPanel
          closePanel={() => setShowAdd(false)}
          refreshCategories={fetchCategories}
        />
      )}
    </div>
  );
};

export default CategoryPage;
