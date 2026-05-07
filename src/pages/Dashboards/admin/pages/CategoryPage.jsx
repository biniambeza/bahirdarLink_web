import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Edit,
  Trash2,
  Plus,
  X,
  RefreshCw,
  ChevronRight,
  Hash,
  AlertCircle,
} from "lucide-react";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [emergencyTypes, setEmergencyTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [activeType, setActiveType] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    emergencyType: "",
  });

  // Helper to safely extract English name from potential objects or old strings
  const getEnName = (item) => {
    if (!item) return "";
    if (typeof item.name === "object" && item.name !== null) {
      return item.name.en || "";
    }
    return item.name || "";
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [catRes, typeRes] = await Promise.all([
        axios.get("http://localhost:5000/api/categories", { headers }),
        axios.get("http://localhost:5000/api/emergencyType", { headers }),
      ]);

      const fetchedCats = Array.isArray(catRes.data)
        ? catRes.data
        : catRes.data.data || [];
      const fetchedTypes = Array.isArray(typeRes.data)
        ? typeRes.data
        : typeRes.data.data || [];

      setCategories(fetchedCats);
      setEmergencyTypes(fetchedTypes);

      if (fetchedTypes.length > 0 && !activeType) {
        setActiveType(fetchedTypes[0]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const currentUnits = categories.filter((cat) => {
    if (!activeType) return false;
    const catTypeId = cat.emergencyType?._id || cat.emergencyType?.id || cat.emergencyType;
    const activeId = activeType._id || activeType.id;
    return catTypeId === activeId;
  });

  const openAddModal = () => {
    if (!activeType) return alert("Please select a category group first");
    setModalMode("add");
    setFormData({
      name: "",
      emergencyType: activeType._id || activeType.id,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setModalMode("edit");
    setSelectedCategoryId(cat._id || cat.id);
    const typeId = cat.emergencyType?._id || cat.emergencyType?.id || cat.emergencyType;

    setFormData({
      name: getEnName(cat), // Use helper here to set initial form value
      emergencyType: typeId,
    });

    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        name: { en: formData.name }, // Send as object to support DB localization
        emergencyTypeId: formData.emergencyType,
        type: formData.name.trim().toUpperCase().replace(/\s+/g, "_"),
      };

      if (modalMode === "add") {
        await axios.post("http://localhost:5000/api/categories", payload, { headers });
      } else {
        await axios.put(
          `http://localhost:5000/api/categories/${selectedCategoryId}`,
          payload,
          { headers }
        );
      }

      setIsModalOpen(false);
      setFormData({ name: "", emergencyType: "" });
      fetchAllData();
    } catch (err) {
      alert(`Action Failed: ${err.response?.data?.message || "Server Error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">CC</div>
          <h1 className="text-xs font-black tracking-widest text-slate-400 uppercase">System / Hierarchy</h1>
        </div>
        <button onClick={fetchAllData} className="p-2 hover:bg-slate-50 rounded-full transition-all">
          <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : "text-slate-400"} />
        </button>
      </nav>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <aside className="w-full md:w-80 border-r border-slate-100 min-h-[calc(100vh-70px)] p-6">
          <div className="mb-6 px-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Emergency Types</h2>
          </div>

          <div className="space-y-1">
            {emergencyTypes.map((type) => {
              const typeId = type._id || type.id;
              const isActive = (activeType?._id || activeType?.id) === typeId;
              return (
                <button
                  key={typeId}
                  onClick={() => setActiveType(type)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {/* SAFE RENDER: Name object fix */}
                  <span className="text-sm font-bold">{getEnName(type)}</span>
                  <ChevronRight size={14} className={isActive ? "opacity-100" : "opacity-0"} />
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-12 bg-slate-50/30">
          {loading && categories.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-300 animate-pulse font-bold text-xs">LOADING...</div>
          ) : (
            <>
              <div className="flex justify-between mb-10">
                <div>
                  <h2 className="text-4xl font-black">
                    {/* SAFE RENDER: Active Type Name fix */}
                    {getEnName(activeType) || "Select Type"}
                  </h2>
                </div>
                <button onClick={openAddModal} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black">
                  ADD NEW UNIT
                </button>
              </div>

              <div className="grid gap-3">
                {currentUnits.length > 0 ? (
                  currentUnits.map((cat) => (
                    <div key={cat._id || cat.id} className="bg-white p-5 rounded-2xl flex justify-between">
                      {/* SAFE RENDER: Category Name fix */}
                      <span className="font-bold">{getEnName(cat)}</span>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(cat)}><Edit size={16} /></button>
                        <button><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400">No Units Assigned</div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal remains largely same, ensure formData.name binds correctly to simple input */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl uppercase tracking-tighter">
                {modalMode === "add" ? "New Unit" : "Edit Unit"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Unit Name (English)"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-xs uppercase">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;