import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Upload,
  User,
  MapPin,
  ClipboardList,
  Trash2,
  AlertTriangle,
  Coins,
  Calendar,
  Scale,
  Ruler,
  Info,
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
    const fetchMetadataAndAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setError("Session expired. Please log in again.");
          return;
        }

        const user = JSON.parse(storedUser);
        const [caseTypeRes, kebeleRes] = await Promise.all([
          axios.get("http://localhost:5000/api/caseType"),
          axios.get("http://localhost:5000/api/kebele"),
        ]);

        setCaseTypes(caseTypeRes.data);
        setKebeles(kebeleRes.data);

        setNewCase((prev) => ({
          ...prev,
          responderTeamId: user.responderTeamId || user.id,
          agencyId: user.agencyId,
        }));
      } catch (err) {
        setError("Failed to sync system categories.");
      } finally {
        setFetchingData(false);
      }
    };
    fetchMetadataAndAuth();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCase((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();

      // Append all fields to FormData
      Object.keys(newCase).forEach((key) => {
        data.append(key, newCase[key]);
      });

      if (imageFile) {
        data.append("media", imageFile);
      }

      const res = await axios.post("http://localhost:5000/api/cases", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record case.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-md">
      <div className="h-full w-full md:w-[550px] bg-[#FBFBFE] shadow-2xl overflow-y-auto border-l border-slate-200">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              New Case Deployment
            </h2>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-[0.15em]">
              Registry Unit • Auth Active
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-slate-100 p-2 rounded-xl transition-all"
          >
            <X />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-bold flex items-center gap-3 rounded-r-xl">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {fetchingData ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : (
            <form onSubmit={handleAddCase} className="space-y-8 pb-32">
              {/* Media Upload */}
              <div className="group border-2 border-dashed border-slate-200 bg-white rounded-3xl p-4 transition-all hover:border-indigo-400">
                {imagePreview ? (
                  <div className="relative h-60 rounded-2xl overflow-hidden">
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
                      className="absolute top-3 right-3 bg-rose-500 text-white p-2 rounded-xl"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
                    <Upload className="text-indigo-600 mb-2" />
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Upload Subject Photo
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

              {/* SECTION: Personal Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Personal Identification
                  </span>
                </div>
                <input
                  required
                  name="fullName"
                  placeholder="Subject Full Name"
                  value={newCase.fullName}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={newCase.age}
                    onChange={handleChange}
                    className="bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none"
                  />
                  <select
                    required
                    name="gender"
                    value={newCase.gender}
                    onChange={handleChange}
                    className="bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none"
                  >
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* SECTION: Physical Traits (NEW) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Physical Attributes
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Ruler
                      className="absolute left-4 top-4 text-slate-300"
                      size={16}
                    />
                    <input
                      name="height"
                      placeholder="Height (e.g. 175cm)"
                      value={newCase.height}
                      onChange={handleChange}
                      className="w-full pl-12 bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Scale
                      className="absolute left-4 top-4 text-slate-300"
                      size={16}
                    />
                    <input
                      name="weight"
                      placeholder="Weight (e.g. 70kg)"
                      value={newCase.weight}
                      onChange={handleChange}
                      className="w-full pl-12 bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none"
                    />
                  </div>
                </div>
                <textarea
                  name="distinctiveFeatures"
                  placeholder="Distinctive Features (Tattoos, Scars, Glasses...)"
                  value={newCase.distinctiveFeatures}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none h-24 resize-none"
                />
              </div>

              {/* SECTION: Enforcement & Bounty */}
              <div className="bg-indigo-900 text-white p-6 rounded-[2.5rem] space-y-5 shadow-xl shadow-indigo-100">
                <div className="flex items-center gap-2">
                  <Coins size={16} className="text-yellow-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Enforcement Strategy
                  </span>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase opacity-60 ml-1">
                    Bounty Reward (ETB)
                  </label>
                  <input
                    type="number"
                    name="reward"
                    placeholder="0.00"
                    value={newCase.reward}
                    onChange={handleChange}
                    className="w-full p-4 bg-white/10 border border-white/10 rounded-2xl text-sm font-bold focus:bg-white focus:text-slate-900 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase opacity-60 ml-1">
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      value={newCase.priority}
                      onChange={handleChange}
                      className="w-full p-4 bg-white/10 border border-white/10 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:text-slate-900"
                    >
                      <option value="low" className="text-slate-900">
                        Low
                      </option>
                      <option value="medium" className="text-slate-900">
                        Medium
                      </option>
                      <option value="high" className="text-slate-900">
                        High
                      </option>
                      <option value="critical" className="text-slate-900">
                        Critical
                      </option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase opacity-60 ml-1">
                      Safety Warning
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setNewCase((prev) => ({
                          ...prev,
                          isDangerous: !prev.isDangerous,
                        }))
                      }
                      className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${newCase.isDangerous ? "bg-rose-500 text-white" : "bg-white/10 text-white/40"}`}
                    >
                      {newCase.isDangerous
                        ? "Dangerous / Armed"
                        : "No Danger Reported"}
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION: Incident Context */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Incident Context
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    required
                    name="caseTypeId"
                    value={newCase.caseTypeId}
                    onChange={handleChange}
                    className="bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none"
                  >
                    <option value="">Case Type</option>
                    {caseTypes.map((t) => (
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
                    className="bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none"
                  >
                    <option value="">Last Seen Kebele</option>
                    {kebeles.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-4 text-slate-300"
                    size={16}
                  />
                  <input
                    type="date"
                    name="lastSeenDate"
                    value={newCase.lastSeenDate}
                    onChange={handleChange}
                    className="w-full pl-12 bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none"
                  />
                </div>
                <div className="relative">
                  <Info
                    className="absolute left-4 top-4 text-slate-300"
                    size={16}
                  />
                  <input
                    name="contactInfo"
                    placeholder="Reporting Party Contact (Phone/Email)"
                    value={newCase.contactInfo}
                    onChange={handleChange}
                    className="w-full pl-12 bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none"
                  />
                </div>
                <div className="relative">
                  <ClipboardList
                    className="absolute top-4 left-4 text-slate-300"
                    size={16}
                  />
                  <textarea
                    required
                    name="description"
                    placeholder="Full incident description..."
                    value={newCase.description}
                    onChange={handleChange}
                    className="w-full pl-12 bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none h-32 resize-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="fixed bottom-0 right-0 w-full md:w-[550px] p-6 bg-white/90 backdrop-blur-md border-t border-slate-100 z-30">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl disabled:bg-slate-300"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    "Publish Case to Registry"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCasePage;
