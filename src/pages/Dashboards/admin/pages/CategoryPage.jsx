import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Plus, X, Save, RefreshCw, ChevronRight, Hash, AlertCircle } from "lucide-react";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [emergencyTypes, setEmergencyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // MODAL & SELECTION STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [activeType, setActiveType] = useState(null); 
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [formData, setFormData] = useState({ name: "", emergencyType: "" });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [catRes, typeRes] = await Promise.all([
        axios.get("http://localhost:5000/api/categories", { headers }),
        axios.get("http://localhost:5000/api/emergencyType", { headers }),
      ]);

      const fetchedCats = Array.isArray(catRes.data) ? catRes.data : catRes.data.data || [];
      const fetchedTypes = Array.isArray(typeRes.data) ? typeRes.data : typeRes.data.data || [];

      setCategories(fetchedCats);
      setEmergencyTypes(fetchedTypes);

      // IMPORTANT: Set initial active type if none selected
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

  // Filter categories based on the selected sidebar item
  const currentUnits = categories.filter((cat) => {
    if (!activeType) return false;
    const catTypeId = cat.emergencyType?._id || cat.emergencyType?.id || cat.emergencyType;
    const activeId = activeType._id || activeType.id;
    return catTypeId === activeId;
  });

  const openAddModal = () => {
    if (!activeType) return alert("Please select a category group first");
    setModalMode("add");
    setFormData({ name: "", emergencyType: activeType._id || activeType.id });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setModalMode("edit");
    setSelectedCategoryId(cat._id || cat.id);
    const typeId = cat.emergencyType?._id || cat.emergencyType?.id || cat.emergencyType;
    setFormData({ name: cat.name, emergencyType: typeId });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        name: formData.name,
        emergencyTypeId: formData.emergencyType,
        type: formData.name.trim().toUpperCase().replace(/\s+/g, "_"),
      };

      if (modalMode === "add") {
        await axios.post("http://localhost:5000/api/categories", payload, { headers });
      } else {
        await axios.put(`http://localhost:5000/api/categories/${selectedCategoryId}`, payload, { headers });
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
      {/* NAV */}
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
        {/* SIDEBAR */}
        <aside className="w-full md:w-80 border-r border-slate-100 min-h-[calc(100vh-70px)] p-6">
          <div className="mb-6 px-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Emergency Types</h2>
          </div>
          <div className="space-y-1">
            {emergencyTypes.map((type) => (
              <button
                key={type._id || type.id}
                onClick={() => setActiveType(type)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  (activeType?._id || activeType?.id) === (type._id || type.id)
                    ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className="text-sm font-bold">{type.name}</span>
                <ChevronRight size={14} className={(activeType?._id || activeType?.id) === (type._id || type.id) ? "opacity-100" : "opacity-0"} />
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 md:p-12 bg-slate-50/30">
          {loading && categories.length === 0 ? (
             <div className="flex items-center justify-center h-64 text-slate-300 animate-pulse font-bold text-xs tracking-widest">INITIALIZING...</div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">{activeType?.name || "Select Type"}</h2>
                  <p className="text-slate-400 text-sm mt-1 font-medium italic">Protocol configuration for {activeType?.name}</p>
                </div>
                <button 
                  onClick={openAddModal}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  <Plus size={16} strokeWidth={3} /> ADD NEW UNIT
                </button>
              </div>

              <div className="grid gap-3">
                {currentUnits.length > 0 ? (
                  currentUnits.map((cat) => (
                    <div key={cat._id || cat.id} className="bg-white border border-slate-100 p-5 rounded-[1.5rem] flex items-center justify-between group hover:border-blue-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Hash size={18} />
                        </div>
                        <span className="font-bold text-slate-700">{cat.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEditModal(cat)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
                    <AlertCircle size={40} className="text-slate-200 mb-2" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No Units Assigned</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {modalMode === "add" ? "Deploy Unit" : "Update Unit"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Designation Name</label>
                <input
                  autoFocus
                  required
                  className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-800"
                  placeholder="e.g. Engine 42"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-[10px]">
                {modalMode === "add" ? "Confirm Deployment" : "Apply Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;