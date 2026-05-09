import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  ChevronRight,
  Search,
  Layers,
  X,
  CheckCircle2,
} from "lucide-react";

const CategoryPage = () => {
  // --- Data State ---
  const [categories, setCategories] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState(null);
  const [search, setSearch] = useState("");

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  /**
   * Helper to safely extract English name from potential objects or strings
   */
  const getEnName = (item) => {
    if (!item) return "";
    const nameData = item.name;

    if (typeof nameData === "object" && nameData !== null) {
      return nameData.en || nameData.am || Object.values(nameData)[0] || "";
    }

    // Check if it's a stringified JSON (just in case)
    if (typeof nameData === "string" && nameData.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(nameData);
        return parsed.en || parsed.am || Object.values(parsed)[0] || "";
      } catch (e) {
        return nameData;
      }
    }

    return nameData || "";
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [catRes, typeRes] = await Promise.all([
        axios.get("http://localhost:5000/api/serviceCategory", { headers }),
        axios.get("http://localhost:5000/api/serviceType", { headers }),
      ]);

      // Adapt based on your API response structure
      const fetchedCats =
        catRes.data.categories ||
        catRes.data.data ||
        (Array.isArray(catRes.data) ? catRes.data : []);
      const fetchedTypes = Array.isArray(typeRes.data)
        ? typeRes.data
        : typeRes.data.data || [];

      setCategories(fetchedCats);
      setServiceTypes(fetchedTypes);

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

  const currentCategories = useMemo(() => {
    return categories.filter((cat) => {
      const activeId = activeType?.id || activeType?._id;
      const catTypeId =
        cat.serviceTypeId || cat.serviceType?.id || cat.serviceType?._id;

      const matchesType = String(catTypeId) === String(activeId);
      const matchesSearch = getEnName(cat)
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [categories, activeType, search]);

  // --- Form Handlers ---
  const openAddModal = () => {
    if (!activeType) return alert("Select a service type first");
    setModalMode("add");
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setModalMode("edit");
    setSelectedCategoryId(cat.id || cat._id);
    setFormData({
      name: getEnName(cat),
      description: getEnName({ name: cat.description }), // Reuse logic for description if localized
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Send as object to support the backend localization logic
      const payload = {
        name: { en: formData.name },
        description: { en: formData.description },
        serviceTypeId: activeType.id || activeType._id,
      };

      if (modalMode === "add") {
        await axios.post("http://localhost:5000/api/serviceCategory", payload, {
          headers,
        });
      } else {
        await axios.put(
          `http://localhost:5000/api/serviceCategory/${selectedCategoryId}`,
          payload,
          { headers },
        );
      }

      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      {/* Top Navbar */}
      <nav className="border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Layers size={16} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase text-slate-800">
              Service Management
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Category Hierarchy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search services..."
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 w-64 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={fetchAllData}
            className="p-2 hover:bg-slate-50 rounded-xl transition-all"
          >
            <RefreshCw
              size={16}
              className={
                loading ? "animate-spin text-blue-600" : "text-slate-400"
              }
            />
          </button>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row">
        {/* Sidebar - Service Types */}
        <aside className="w-full md:w-80 border-r border-slate-50 min-h-[calc(100vh-70px)] p-8">
          <div className="mb-8 px-2">
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              Service Types
            </h2>
          </div>
          <div className="space-y-2">
            {serviceTypes.map((type) => {
              const typeId = type.id || type._id;
              const activeId = activeType?.id || activeType?._id;
              const isActive = String(activeId) === String(typeId);
              return (
                <button
                  key={typeId}
                  onClick={() => setActiveType(type)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm font-bold">{getEnName(type)}</span>
                  <ChevronRight
                    size={14}
                    className={isActive ? "opacity-100" : "opacity-0"}
                  />
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 md:p-16 bg-slate-50/50">
          <header className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-12 gap-6">
            <div>
              <span className="text-blue-600 font-black text-[10px] tracking-widest uppercase mb-2 block">
                Management Console
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
                {getEnName(activeType) || "Select Type"}
              </h2>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-xs font-black transition-all shadow-lg shadow-blue-100"
            >
              <Plus size={18} /> ADD NEW UNIT
            </button>
          </header>

          <div className="grid gap-4">
            {currentCategories.length > 0 ? (
              currentCategories.map((cat) => (
                <div
                  key={cat.id || cat._id}
                  className="group bg-white p-6 rounded-3xl flex items-center justify-between border border-transparent hover:border-blue-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 font-bold text-xs">
                      {cat.id || "#"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {getEnName(cat)}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md line-clamp-1">
                        {getEnName({ name: cat.description }) ||
                          "No description provided."}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit size={16} />
                    </button>
                    <button className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[40px] py-20 flex flex-col items-center justify-center text-slate-400">
                <p className="font-bold text-sm tracking-tight">
                  No units found for this category.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight">
                  {modalMode === "add" ? "New Unit" : "Edit Unit"}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Parent: {getEnName(activeType)}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                  Unit Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                  placeholder="e.g. Traffic Management"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                  Description
                </label>
                <textarea
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-100 text-sm min-h-[120px]"
                  placeholder="Explain what this unit handles..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-3xl font-black text-xs transition-all shadow-xl shadow-slate-200"
              >
                <CheckCircle2 size={18} />{" "}
                {modalMode === "add" ? "CREATE UNIT" : "UPDATE UNIT"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
