import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Upload,
  User,
  MapPin,
  ClipboardList,
  Trash2,
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
    agencyId: null, // Initialized as null to ensure we wait for sync
    responderTeamId: null,
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
        // 1. Get Logged-in Team Details from Storage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setError("Session expired. Please log in again.");
          return;
        }

        const user = JSON.parse(storedUser);

        // Use the normalized keys we set up in the LoginPage
        const teamId = user.responderTeamId || user.id;
        const agencyId = user.agencyId;

        if (!teamId || !agencyId) {
          setError("Critical Error: Team/Agency ID missing from session.");
        }

        // 2. Fetch Dropdown Data
        const [caseTypeRes, kebeleRes] = await Promise.all([
          axios.get("http://localhost:5000/api/caseType"),
          axios.get("http://localhost:5000/api/kebele"),
        ]);

        setCaseTypes(caseTypeRes.data);
        setKebeles(kebeleRes.data);

        // 3. Auto-populate IDs into the form state
        setNewCase((prev) => ({
          ...prev,
          responderTeamId: teamId,
          agencyId: agencyId,
        }));
      } catch (err) {
        console.error("SYNC ERROR:", err);
        setError("Failed to sync system categories.");
      } finally {
        setFetchingData(false);
      }
    };
    fetchMetadataAndAuth();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();

      // Basic Info
      data.append("fullName", newCase.fullName);
      data.append("description", newCase.description);
      data.append("gender", newCase.gender);
      data.append("age", parseInt(newCase.age) || 0);

      // Automated IDs from logged-in session
      data.append("caseTypeId", Number(newCase.caseTypeId));
      data.append("lastSeenLocationId", Number(newCase.lastSeenLocationId));
      data.append("agencyId", Number(newCase.agencyId));
      data.append("responderTeamId", Number(newCase.responderTeamId));

      if (imageFile) {
        data.append("media", imageFile);
        data.append("mediaType", "photo");
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
      const errMsg =
        err.response?.data?.message ||
        "Failed to record case. Verify all fields.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full md:w-[450px] bg-slate-50 shadow-2xl overflow-y-auto border-l border-slate-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              New Incident Report
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${newCase.agencyId ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
              ></span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {newCase.agencyId
                  ? `Agency Linked (ID: ${newCase.agencyId})`
                  : "Syncing Auth..."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl text-sm font-medium">
              {error}
            </div>
          )}

          {fetchingData ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-2" />
              <p className="text-sm">Verifying Team Authorization...</p>
            </div>
          ) : (
            <form onSubmit={handleAddCase} className="space-y-6 pb-28">
              {/* Image Uploader */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Evidence Photo
                </label>
                <div className="relative border-2 border-dashed border-slate-200 bg-white rounded-2xl p-2 transition-all hover:border-blue-400">
                  {imagePreview ? (
                    <div className="relative h-48 rounded-xl overflow-hidden shadow-inner">
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
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:scale-110 transition-transform"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                      <Upload className="text-blue-500 mb-2" size={24} />
                      <span className="text-xs font-bold text-slate-400">
                        Click to upload photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Subject Information */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    Subject Info
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Subject Full Name"
                  value={newCase.fullName}
                  onChange={(e) =>
                    setNewCase({ ...newCase, fullName: e.target.value })
                  }
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Age"
                    value={newCase.age}
                    onChange={(e) =>
                      setNewCase({ ...newCase, age: e.target.value })
                    }
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none"
                  />
                  <select
                    required
                    value={newCase.gender}
                    onChange={(e) =>
                      setNewCase({ ...newCase, gender: e.target.value })
                    }
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none"
                  >
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Categorization */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    Categorization
                  </span>
                </div>

                <select
                  required
                  value={newCase.caseTypeId}
                  onChange={(e) =>
                    setNewCase({ ...newCase, caseTypeId: e.target.value })
                  }
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none"
                >
                  <option value="">Select Case Type</option>
                  {caseTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <select
                  required
                  value={newCase.lastSeenLocationId}
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      lastSeenLocationId: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none"
                >
                  <option value="">Select Last Seen Kebele</option>
                  {kebeles.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <ClipboardList
                    className="absolute top-4 left-4 text-slate-300"
                    size={16}
                  />
                  <textarea
                    required
                    rows="3"
                    placeholder="Incident description..."
                    value={newCase.description}
                    onChange={(e) =>
                      setNewCase({ ...newCase, description: e.target.value })
                    }
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm outline-none resize-none"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="fixed bottom-0 right-0 w-full md:w-[450px] p-6 bg-white/90 backdrop-blur-md border-t border-slate-200">
                <button
                  type="submit"
                  disabled={loading || !newCase.agencyId}
                  className="w-full py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all shadow-2xl disabled:bg-slate-300"
                >
                  {loading ? (
                    <Loader2 className="animate-spin inline mr-2" size={16} />
                  ) : (
                    "Finalize & Record Case"
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
