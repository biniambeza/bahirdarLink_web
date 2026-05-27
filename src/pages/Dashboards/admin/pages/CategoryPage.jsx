import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Edit,
  Trash2,
  X,
  RefreshCw,
  ChevronRight,
  Loader2,
} from "lucide-react";

// Hardcoded directly to production backend service environment
const API_BASE = "https://bahirlink-backend-1.onrender.com";

// ─── Name Helpers ─────────────────────────────────────────────────────────────
const parseName = (raw) => {
  if (!raw) return { en: "", am: "" };
  if (typeof raw === "object") return { en: raw.en || "", am: raw.am || "" };

  let str = String(raw).trim();
  if (str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);
  str = str.replace(/\\"/g, '"');

  if (str.startsWith("{")) {
    try {
      const p = JSON.parse(str);
      if (p && typeof p === "object") return { en: p.en || "", am: p.am || "" };
    } catch {
      /* fall through */
    }
  }

  return { en: str, am: "" };
};

const extractEn = (raw) => {
  const { en, am } = parseName(raw);
  return en || am;
};

const extractAm = (raw) => parseName(raw).am;

// ─── Translation ──────────────────────────────────────────────────────────────
const translateToAmharic = async (text) => {
  if (!text?.trim()) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=am&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const json = await res.json();
    return json[0]?.map((seg) => seg[0]).join("") || "";
  } catch {
    return "";
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [emergencyTypes, setEmergencyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [activeType, setActiveType] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAm: "",
    emergencyType: "",
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [catRes, typeRes] = await Promise.all([
        axios.get(`${API_BASE}/api/categories`, { headers }),
        axios.get(`${API_BASE}/api/emergencyType`, { headers }),
      ]);
      const fetchedCats = Array.isArray(catRes.data)
        ? catRes.data
        : catRes.data.data || [];
      const fetchedTypes = Array.isArray(typeRes.data)
        ? typeRes.data
        : typeRes.data.data || [];
      setCategories(fetchedCats);
      setEmergencyTypes(fetchedTypes);
      if (fetchedTypes.length > 0 && !activeType)
        setActiveType(fetchedTypes[0]);
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
    const catTypeId =
      cat.emergencyType?._id || cat.emergencyType?.id || cat.emergencyType;
    const activeId = activeType._id || activeType.id;
    return String(catTypeId) === String(activeId);
  });

  const handleEnBlur = async () => {
    if (!formData.nameEn.trim() || formData.nameAm) return;
    setTranslating(true);
    const am = await translateToAmharic(formData.nameEn);
    setFormData((prev) => ({ ...prev, nameAm: am }));
    setTranslating(false);
  };

  const openAddModal = () => {
    if (!activeType) return alert("Please select a category group first");
    setModalMode("add");
    setFormData({
      nameEn: "",
      nameAm: "",
      emergencyType: activeType._id || activeType.id,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setModalMode("edit");
    setSelectedCategoryId(cat._id || cat.id);
    const typeId =
      cat.emergencyType?._id || cat.emergencyType?.id || cat.emergencyType;
    setFormData({
      nameEn: extractEn(cat.name),
      nameAm: extractAm(cat.name),
      emergencyType: typeId,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      let nameAm = formData.nameAm;
      if (!nameAm.trim() && formData.nameEn.trim()) {
        nameAm = await translateToAmharic(formData.nameEn);
      }
      const payload = {
        name: { en: formData.nameEn.trim(), am: nameAm.trim() },
        emergencyTypeId: formData.emergencyType,
        type: formData.nameEn.trim().toUpperCase().replace(/\s+/g, "_"),
      };
      if (modalMode === "add") {
        await axios.post(`${API_BASE}/api/categories`, payload, { headers });
      } else {
        await axios.put(
          `${API_BASE}/api/categories/${selectedCategoryId}`,
          payload,
          { headers },
        );
      }
      setIsModalOpen(false);
      setFormData({ nameEn: "", nameAm: "", emergencyType: "" });
      fetchAllData();
    } catch (err) {
      alert(`Action Failed: ${err.response?.data?.message || "Server Error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${extractEn(cat.name)}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE}/api/categories/${cat._id || cat.id}`, {
        headers,
      });
      fetchAllData();
    } catch (err) {
      alert(`Delete Failed: ${err.response?.data?.message || "Server Error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">
            CC
          </div>
          <h1 className="text-xs font-black tracking-widest text-slate-400 uppercase">
            System / Hierarchy
          </h1>
        </div>
        <button
          onClick={fetchAllData}
          className="p-2 hover:bg-slate-50 rounded-full transition-all"
        >
          <RefreshCw
            size={16}
            className={
              loading ? "animate-spin text-blue-600" : "text-slate-400"
            }
          />
        </button>
      </nav>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <aside className="w-full md:w-80 border-r border-slate-100 min-h-[calc(100vh-70px)] p-6">
          <div className="mb-6 px-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Emergency Types
            </h2>
          </div>
          <div className="space-y-1">
            {emergencyTypes.map((type) => {
              const typeId = type._id || type.id;
              const isActive =
                String(activeType?._id || activeType?.id) === String(typeId);
              return (
                <button
                  key={typeId}
                  onClick={() => setActiveType(type)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm font-bold">
                    {extractEn(type.name)}
                  </span>
                  <ChevronRight
                    size={14}
                    className={isActive ? "opacity-100" : "opacity-0"}
                  />
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-12 bg-slate-50/30">
          {loading && categories.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-300 animate-pulse font-bold text-xs">
              LOADING...
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-4xl font-black">
                  {extractEn(activeType?.name) || "Select Type"}
                </h2>
                <button
                  onClick={openAddModal}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-slate-700 transition-colors"
                >
                  ADD NEW UNIT
                </button>
              </div>

              <div className="grid gap-3">
                {currentUnits.length > 0 ? (
                  currentUnits.map((cat) => (
                    <div
                      key={cat._id || cat.id}
                      className="bg-white p-5 rounded-2xl flex justify-between items-center border border-slate-100"
                    >
                      <span className="font-bold text-slate-900">
                        {extractEn(cat.name)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-700"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-2 hover:bg-red-50 rounded-xl transition-all text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-300 text-sm font-bold uppercase tracking-widest">
                    No Units Assigned
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-xl uppercase tracking-tighter">
                {modalMode === "add" ? "New Unit" : "Edit Unit"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Unit Name
                </label>
                <input
                  type="text"
                  placeholder="Type unit name…"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nameEn: e.target.value,
                      nameAm: "",
                    })
                  }
                  onBlur={handleEnBlur}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={saving || translating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                {saving || translating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;