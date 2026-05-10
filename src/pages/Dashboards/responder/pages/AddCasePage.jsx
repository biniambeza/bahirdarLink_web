import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Upload,
  User,
  Trash2,
  AlertTriangle,
  Coins,
  Scale,
  Ruler,
  Phone,
} from "lucide-react";
import axios from "axios";

const AddCasePage = ({ onClose, onSaved }) => {
  const [newCase, setNewCase] = useState({
    fullName: "",
    age: "",
    gender: "",
    description: "",
    lastSeenLocationId: "",
    caseTypeId: "",
    agencyId: null,
    responderTeamId: null,
    reward: "",
    priority: "medium",
    lastSeenDate: "",
    height: "",
    weight: "",
    distinctiveFeatures: "",
    contactInfo: "",
    isDangerous: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caseTypes, setCaseTypes] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
          setError("Session expired. Authentication required.");
          return;
        }

        const user = JSON.parse(storedUser);
        const [caseTypeRes, kebeleRes] = await Promise.all([
          axios.get("http://localhost:5000/api/caseType", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/kebele", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // FIXED: Explicitly target the .data array from your API response structure
        const caseTypeData =
          caseTypeRes.data.data ||
          caseTypeRes.data.caseTypes ||
          (Array.isArray(caseTypeRes.data) ? caseTypeRes.data : []);
        const kebeleData =
          kebeleRes.data.data ||
          kebeleRes.data.kebeles ||
          (Array.isArray(kebeleRes.data) ? kebeleRes.data : []);

        setCaseTypes(caseTypeData);
        setKebeles(kebeleData);

        setNewCase((prev) => ({
          ...prev,
          responderTeamId: user.responderTeamId || null,
          agencyId: user.agencyId || null,
        }));
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Telemetry Sync Failed: Check server connection.");
      } finally {
        setFetchingData(false);
      }
    };
    initializeSystem();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCase((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIntegerChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setNewCase((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    const intVal = Math.floor(Math.abs(Number(value)));
    setNewCase((prev) => ({ ...prev, [name]: String(intVal) }));
  };

  const handleAddCase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      const integerFields = [
        "age",
        "height",
        "weight",
        "reward",
        "caseTypeId",
        "lastSeenLocationId",
        "responderTeamId",
      ];

      Object.keys(newCase).forEach((key) => {
        const value = newCase[key];
        if (value === null || value === undefined) return;

        if (integerFields.includes(key)) {
          if (value !== "") {
            data.append(key, Math.floor(Number(value)));
          }
        } else if (typeof value === "boolean") {
          data.append(key, value);
        } else if (value !== "") {
          data.append(key, value);
        }
      });

      if (imageFile) data.append("media", imageFile);

      const res = await axios.post("http://localhost:5000/api/cases", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (onSaved) onSaved(res.data);
      onClose();
    } catch (err) {
      console.error("Transmission Error:", err);
      setError(
        err.response?.data?.message ||
          "Critical Error: Could not publish record.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-md">
      <div className="h-full w-full md:w-[600px] bg-white shadow-2xl overflow-y-auto flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">
              Case Deployment
            </h2>
            <p className="text-[10px] text-indigo-600 font-bold tracking-[0.3em] uppercase">
              Bahir Dar Unit • Registry v2.4
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-slate-100 p-2 rounded-xl text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-12 pb-44">
          {error && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-[11px] font-bold flex items-center gap-3 rounded-r-xl">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleAddCase} className="space-y-12">
            {/* 01: Visual Record */}
            <section className="space-y-4">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">
                01 Visual Record
              </span>
              <div className="group border-2 border-dashed border-slate-200 rounded-[2.5rem] p-3 transition-all hover:border-indigo-400 bg-slate-50/50">
                {imagePreview ? (
                  <div className="relative h-64 rounded-[2rem] overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-4 right-4 bg-rose-500 text-white p-2.5 rounded-xl shadow-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-52 cursor-pointer">
                    <div className="bg-white p-4 rounded-2xl mb-4 text-indigo-600 shadow-sm">
                      <Upload size={24} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Upload Subject Intelligence Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </section>

            {/* 02: Biometrics */}
            <section className="space-y-5">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">
                02 Biometrics
              </span>
              <div className="space-y-4">
                <div className="relative">
                  <User
                    className="absolute left-4 top-4 text-slate-300"
                    size={18}
                  />
                  <input
                    required
                    name="fullName"
                    placeholder="Subject Full Legal Name"
                    value={newCase.fullName}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:ring-4 ring-indigo-500/5 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={newCase.age}
                    onChange={handleIntegerChange}
                    className="border border-slate-200 rounded-2xl p-4 text-sm outline-none"
                  />
                  <select
                    required
                    name="gender"
                    value={newCase.gender}
                    onChange={handleChange}
                    className="border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-600 outline-none appearance-none"
                  >
                    <option value="">Sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Ruler
                      className="absolute left-4 top-4 text-slate-300"
                      size={16}
                    />
                    <input
                      type="number"
                      name="height"
                      placeholder="Height (cm)"
                      value={newCase.height}
                      onChange={handleIntegerChange}
                      className="w-full border border-slate-200 rounded-2xl p-4 pl-12 text-sm outline-none bg-white focus:border-indigo-400"
                    />
                  </div>
                  <div className="relative">
                    <Scale
                      className="absolute left-4 top-4 text-slate-300"
                      size={16}
                    />
                    <input
                      type="number"
                      name="weight"
                      placeholder="Weight (kg)"
                      value={newCase.weight}
                      onChange={handleIntegerChange}
                      className="w-full border border-slate-200 rounded-2xl p-4 pl-12 text-sm outline-none bg-white focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 03: Response Configuration */}
            <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] space-y-6 shadow-xl">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Response Configuration
                </span>
              </div>
              <input
                type="number"
                name="reward"
                placeholder="0"
                value={newCase.reward}
                onChange={handleIntegerChange}
                className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-2xl font-black text-yellow-400 focus:bg-white focus:text-slate-900 outline-none transition-all"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  name="priority"
                  value={newCase.priority}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase outline-none"
                >
                  <option value="low">Priority: Low</option>
                  <option value="medium">Priority: Medium</option>
                  <option value="high">Priority: High</option>
                  <option value="critical">Priority: Critical</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setNewCase((p) => ({ ...p, isDangerous: !p.isDangerous }))
                  }
                  className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all border ${newCase.isDangerous ? "bg-rose-600 border-rose-400 text-white" : "bg-white/5 border-white/10 text-slate-500"}`}
                >
                  <AlertTriangle size={14} />
                  {newCase.isDangerous ? "High Threat" : "Standard"}
                </button>
              </div>
            </section>

            {/* 04: Geospatial Intel */}
            <section className="space-y-5 pb-12">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">
                03 Geospatial Intel
              </span>
              <div className="grid grid-cols-2 gap-4">
                <select
                  required
                  name="caseTypeId"
                  value={newCase.caseTypeId}
                  onChange={handleChange}
                  className="border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none"
                >
                  <option value="">Type</option>
                  {/* SAFE MAP: Optional chaining and array check */}
                  {Array.isArray(caseTypes) &&
                    caseTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
                <select
                  required
                  name="lastSeenLocationId"
                  value={newCase.lastSeenLocationId}
                  onChange={handleChange}
                  className="border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none"
                >
                  <option value="">Kebele</option>
                  {/* SAFE MAP: Optional chaining and array check */}
                  {Array.isArray(kebeles) &&
                    kebeles.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                </select>
              </div>
              <input
                type="date"
                name="lastSeenDate"
                value={newCase.lastSeenDate}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-500 outline-none"
              />
              <textarea
                required
                name="description"
                placeholder="Comprehensive Narrative..."
                value={newCase.description}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none h-36 resize-none shadow-inner"
              />
            </section>

            {/* Submit */}
            <div className="fixed bottom-0 right-0 w-full md:w-[600px] p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl transition-all hover:bg-indigo-700 disabled:bg-slate-300"
              >
                {loading ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : (
                  "Authorize & Deploy"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCasePage;
