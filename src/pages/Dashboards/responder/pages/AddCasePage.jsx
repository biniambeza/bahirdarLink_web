import React, { useState, useEffect } from "react";
import { X, Loader2, Upload, User, MapPin, Trash2, AlertTriangle, Coins, Scale, Ruler, Phone, MessageSquare } from "lucide-react";
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
        const token = localStorage.getItem("token");
        if (!storedUser || !token) {
          setError("Authentication required.");
          setFetchingData(false);
          return;
        }
        const user = JSON.parse(storedUser);
        const [caseTypeRes, kebeleRes] = await Promise.all([
          axios.get("http://localhost:5000/api/caseType", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/kebele", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        
        setCaseTypes(caseTypeRes.data.caseTypes || caseTypeRes.data || []);
        setKebeles(kebeleRes.data.kebeles || kebeleRes.data || []);
        
        // Auto-assign from current logged-in user
        setNewCase((prev) => ({
          ...prev,
          responderTeamId: user.responderTeamId || null,
          agencyId: user.agencyId || null,
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
    const { name, value, type, checked } = e.target;
    setNewCase((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddCase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      // Clean logic: Only send values that exist
      Object.keys(newCase).forEach((key) => {
        const val = newCase[key];
        
        if (key === "isDangerous") {
          data.append(key, val); // Boolean handled by Controller
        } else if (val !== "" && val !== null && val !== undefined) {
          data.append(key, val);
        }
      });

      if (imageFile) data.append("media", imageFile);

      const res = await axios.post("http://localhost:5000/api/cases", data, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      if (onSaved) onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish case.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-md">
      <div className="h-full w-full md:w-[550px] bg-[#FBFBFE] shadow-2xl overflow-y-auto border-l border-slate-200">
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">New Case Deployment</h2>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-[0.15em]">Registry Unit • BahirLink</p>
          </div>
          <button onClick={onClose} className="hover:bg-slate-100 p-2 rounded-xl text-slate-500 transition-all"><X size={24} /></button>
        </div>

        <div className="p-6">
          {error && <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-bold flex items-center gap-3 rounded-r-xl"><AlertTriangle size={18} /> {error}</div>}
          
          <form onSubmit={handleAddCase} className="space-y-8 pb-32">
            {/* Image Section */}
            <div className="group border-2 border-dashed border-slate-200 bg-white rounded-3xl p-2 transition-all hover:border-indigo-400">
              {imagePreview ? (
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-3 right-3 bg-rose-500 text-white p-2 rounded-xl"><Trash2 size={18} /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 cursor-pointer rounded-2xl hover:bg-slate-50">
                  <Upload className="text-indigo-600 mb-2" size={20} />
                  <span className="text-xs font-bold text-slate-500">Upload Subject Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); } }} />
                </label>
              )}
            </div>

            {/* Basic Identity */}
            <div className="space-y-4">
               <div className="flex items-center gap-2"><User size={14} className="text-indigo-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Identity</span></div>
               <input required name="fullName" placeholder="Full Name" value={newCase.fullName} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-semibold outline-none shadow-sm" />
               <div className="grid grid-cols-2 gap-4">
                 <input type="number" name="age" placeholder="Age" value={newCase.age} onChange={handleChange} className="bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none" />
                 <select required name="gender" value={newCase.gender} onChange={handleChange} className="bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none">
                   <option value="">Gender</option>
                   <option value="male">Male</option>
                   <option value="female">Female</option>
                 </select>
               </div>
            </div>

            {/* Physical Attributes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2"><Scale size={14} className="text-indigo-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physical Attributes</span></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Ruler className="absolute left-4 top-4 text-slate-300" size={16} />
                  <input type="number" step="0.1" name="height" placeholder="Height (cm)" value={newCase.height} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl p-4 pl-12 text-sm outline-none shadow-sm" />
                </div>
                <div className="relative">
                  <Scale className="absolute left-4 top-4 text-slate-300" size={16} />
                  <input type="number" step="0.1" name="weight" placeholder="Weight (kg)" value={newCase.weight} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl p-4 pl-12 text-sm outline-none shadow-sm" />
                </div>
              </div>
              <textarea name="distinctiveFeatures" placeholder="Distinctive features (scars, tattoos...)" value={newCase.distinctiveFeatures} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none h-24 resize-none" />
            </div>

            {/* Enforcement Settings */}
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] space-y-5">
              <div className="flex items-center gap-2"><Coins size={16} className="text-yellow-400" /><span className="text-[10px] font-black uppercase tracking-widest">Enforcement Settings</span></div>
              <input type="number" name="reward" placeholder="Bounty Amount (ETB)" value={newCase.reward} onChange={handleChange} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold focus:bg-white focus:text-slate-900 outline-none transition-all" />
              <div className="grid grid-cols-2 gap-4">
                <select name="priority" value={newCase.priority} onChange={handleChange} className="w-full p-4 bg-white/10 border border-white/10 rounded-2xl text-xs font-bold outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <button type="button" onClick={() => setNewCase(p => ({ ...p, isDangerous: !p.isDangerous }))} className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${newCase.isDangerous ? "bg-rose-500 text-white" : "bg-white/10 text-white/40"}`}>
                  {newCase.isDangerous ? "Dangerous" : "Safe"}
                </button>
              </div>
            </div>

            {/* Contact & Leads */}
            <div className="space-y-4">
              <div className="flex items-center gap-2"><Phone size={14} className="text-indigo-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leads & Contact</span></div>
              <input name="contactInfo" placeholder="Contact number or person for leads" value={newCase.contactInfo} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none" />
            </div>

            {/* Incident Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2"><MapPin size={14} className="text-indigo-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Details</span></div>
              <div className="grid grid-cols-2 gap-4">
                <select required name="caseTypeId" value={newCase.caseTypeId} onChange={handleChange} className="bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none">
                  <option value="">Case Type</option>
                  {caseTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select required name="lastSeenLocationId" value={newCase.lastSeenLocationId} onChange={handleChange} className="bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none">
                  <option value="">Kebele</option>
                  {kebeles.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
              <input type="date" name="lastSeenDate" value={newCase.lastSeenDate} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none" />
              <textarea required name="description" placeholder="Incident report..." value={newCase.description} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm outline-none h-32 resize-none shadow-sm" />
            </div>

            <div className="fixed bottom-0 right-0 w-full md:w-[550px] p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-50">
              <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:bg-slate-300">
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Publish Case to Registry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCasePage;