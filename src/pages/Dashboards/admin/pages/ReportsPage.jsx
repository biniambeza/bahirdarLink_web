// import React, { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import { Search, MapPin, User, Calendar, AlertCircle, FileText } from "lucide-react";

// const ReportsPage = () => {
//   const [reports, setReports] = useState([]);
//   const [filter, setFilter] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const API_URL = "http://localhost:5000/api/emergencies/admin/all";

//   useEffect(() => {
//     const fetchReports = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem("token");
//         const { data } = await axios.get(API_URL, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (data.success) setReports(data.data || []);
//       } catch (err) {
//         setError(err.response?.data?.error || err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchReports();
//   }, []);

//   // Safe string converter helper to prevent crashes
//   const safeString = (val) => {
//     if (!val) return "";
//     // If it's a populated object (common in Mongoose), get the name or en field
//     if (typeof val === "object") return val.name || val.en || "";
//     return String(val);
//   };

//   const filteredReports = useMemo(() => {
//     const query = searchQuery.toLowerCase().trim();

//     return reports
//       .filter((r) => {
//         if (filter === "registered") return r.reporterType === "user";
//         if (filter === "guest") return r.reporterType === "guest";
//         return true;
//       })
//       .filter((r) => {
//         const type = safeString(r.emergencyType).toLowerCase();
//         const category = safeString(r.category).toLowerCase();
//         const reporter = safeString(r.reporterName).toLowerCase();
//         const address = `${r.kebele} ${r.subdivision} ${r.street}`.toLowerCase();

//         return (
//           type.includes(query) ||
//           category.includes(query) ||
//           reporter.includes(query) ||
//           address.includes(query)
//         );
//       });
//   }, [filter, searchQuery, reports]);

//   return (
//     <div className="p-8 bg-[#F8FAFC] min-h-screen">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-slate-900">Emergency Reports</h1>
//         <p className="text-slate-500 mt-2">Monitor and manage all incident reports from the field.</p>
//       </div>

//       {/* Toolbar */}
//       <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
//         <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
//           {["all", "registered", "guest"].map((btn) => (
//             <button
//               key={btn}
//               onClick={() => setFilter(btn)}
//               className={`px-6 py-2 rounded-md text-sm font-bold capitalize transition-all ${
//                 filter === btn ? "bg-[#0052CC] text-white" : "text-slate-500 hover:bg-slate-50"
//               }`}
//             >
//               {btn}
//             </button>
//           ))}
//         </div>

//         <div className="relative w-full max-w-md">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//           <input
//             type="text"
//             placeholder="Search reports..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0052CC] outline-none transition-all"
//           />
//         </div>
//       </div>

//       {/* Table Section */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//         {loading ? (
//           <div className="py-20 text-center animate-pulse text-slate-400">Loading Report Data...</div>
//         ) : error ? (
//           <div className="py-20 text-center text-red-500 flex flex-col items-center gap-2">
//             <AlertCircle size={32} />
//             <p>{error}</p>
//           </div>
//         ) : filteredReports.length === 0 ? (
//           <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
//             <FileText size={32} />
//             <p>No reports found matching your criteria.</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left">
//               <thead className="bg-slate-50 border-b border-slate-200">
//                 <tr>
//                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Incident</th>
//                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Address</th>
//                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Reporter</th>
//                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
//                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {filteredReports.map((report) => (
//                   <tr key={report.id} className="hover:bg-slate-50/80 transition-colors cursor-default">
//                     <td className="px-6 py-4">
//                       <div className="font-bold text-slate-900 capitalize">{safeString(report.emergencyType)}</div>
//                       <div className="text-xs text-[#0052CC] font-medium">{safeString(report.category)}</div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-start gap-1.5 text-slate-600 text-sm">
//                         <MapPin size={14} className="mt-0.5 text-slate-400 flex-shrink-0" />
//                         <span>{[report.kebele, report.subdivision, report.street].filter(Boolean).join(", ") || "No address provided"}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
//                           <User size={14} />
//                         </div>
//                         <span className="text-sm font-medium text-slate-700">{report.reporterName || "Anonymous"}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-slate-500">
//                       <div className="flex items-center gap-1.5">
//                         <Calendar size={14} />
//                         {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "-"}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <StatusChip status={report.status} />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const StatusChip = ({ status }) => {
//   const s = String(status || "pending").toLowerCase();
//   const theme = {
//     resolved: "bg-green-100 text-green-700",
//     in_progress: "bg-blue-100 text-blue-700",
//     escalated: "bg-red-100 text-red-700",
//     pending: "bg-amber-100 text-amber-700",
//   }[s] || "bg-slate-100 text-slate-700";

//   return (
//     <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${theme}`}>
//       {status || "Pending"}
//     </span>
//   );
// };

// export default ReportsPage;
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Search,
  MapPin,
  User,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api/emergencies/admin/all";

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          // Adjust key based on your specific backend response structure
          setReports(data.data || data.services || data.emergencies || []);
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  /**
   * SMART RENDERER
   * Automatically detects and parses JSON strings to extract English values
   */
  const renderEnglish = (val) => {
    if (!val) return "";

    // Handle standard JavaScript Objects { en: "..." }
    if (typeof val === "object") {
      return val.en || val.name?.en || val.label?.en || val.name || "";
    }

    // Handle "Stringified" JSON: '{"en":"poly","am":"ፖሊ"}'
    if (typeof val === "string") {
      if (val.includes('{"en":') || val.includes('{"am":')) {
        try {
          const parsed = JSON.parse(val);
          return parsed.en || "";
        } catch (e) {
          return val; // Fallback to raw string if parsing fails
        }
      }
    }

    // Handle Plain Strings: "Kebele 04"
    return String(val);
  };

  const filteredReports = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return reports
      .filter((r) => {
        if (filter === "registered") return r.reporterType === "user";
        if (filter === "guest") return r.reporterType === "guest";
        return true;
      })
      .filter((r) => {
        const type = renderEnglish(
          r.emergencyType || r.serviceType,
        ).toLowerCase();
        const category = renderEnglish(
          r.category || r.serviceCategory,
        ).toLowerCase();
        const reporter = renderEnglish(
          r.reporterName || r.fullName,
        ).toLowerCase();
        const fullAddress =
          `${renderEnglish(r.kebele)} ${renderEnglish(r.subdivision)} ${renderEnglish(r.street)}`.toLowerCase();

        return (
          type.includes(query) ||
          category.includes(query) ||
          reporter.includes(query) ||
          fullAddress.includes(query)
        );
      });
  }, [filter, searchQuery, reports]);

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans antialiased text-slate-900">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Emergency Archive
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Monitoring finalized reports and field data.
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Active Filters
          </p>
          <p className="text-xl font-black text-[#0052CC]">
            {filteredReports.length}{" "}
            <span className="text-slate-300 text-sm font-bold">Records</span>
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-center justify-between">
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 w-full lg:w-auto">
          {["all", "registered", "guest"].map((btn) => (
            <button
              key={btn}
              onClick={() => setFilter(btn)}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === btn
                  ? "bg-[#0052CC] text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              {btn}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xl">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search incident, location, or reporter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.25rem] shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-[#0052CC] outline-none transition-all font-medium"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-40 text-center font-black text-[10px] uppercase tracking-[0.4em] text-slate-400 animate-pulse">
            Syncing Records...
          </div>
        ) : error ? (
          <div className="py-24 text-center text-rose-500 flex flex-col items-center gap-4">
            <AlertCircle size={40} />
            <p className="font-black tracking-tight">{error}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-24 text-center text-slate-300 flex flex-col items-center gap-4">
            <FileText size={40} />
            <p className="font-bold text-sm">
              No matching reports found in database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Incident Details
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Geographic Address
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Reporter
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id || report._id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-800 text-lg leading-tight">
                        {renderEnglish(
                          report.emergencyType || report.serviceType,
                        )}
                      </div>
                      <div className="text-[10px] text-[#0052CC] font-black uppercase tracking-wider mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {renderEnglish(
                          report.category || report.serviceCategory,
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-2.5 text-slate-600 text-sm font-bold leading-relaxed">
                        <MapPin
                          size={16}
                          className="mt-0.5 text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0"
                        />
                        <span className="max-w-[240px]">
                          {/* Mixed Data Logic: Handles Kebele 04, {"en":"poly"}, and giorgis */}
                          {[
                            renderEnglish(report.kebele),
                            renderEnglish(report.subdivision),
                            renderEnglish(report.street),
                          ]
                            .filter((val) => val && val.trim() !== "")
                            .join(", ") || "Location Specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {renderEnglish(report.reporterName || "A")?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-700">
                            {renderEnglish(report.reporterName || "Anonymous")}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">
                            {report.reporterType || "external"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                        <Calendar size={14} className="text-slate-300" />
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString(
                              undefined,
                              { dateStyle: "medium" },
                            )
                          : "Recently"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <StatusChip status={renderEnglish(report.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusChip = ({ status }) => {
  const s = String(status || "pending").toLowerCase();

  const themes = {
    resolved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    in_progress: "bg-blue-50 text-blue-600 border-blue-100",
    ongoing: "bg-blue-50 text-blue-600 border-blue-100",
    escalated: "bg-rose-50 text-rose-600 border-rose-100",
    reported: "bg-amber-50 text-amber-600 border-amber-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
  };

  const theme = themes[s] || "bg-slate-50 text-slate-500 border-slate-200";

  return (
    <div className="flex justify-center">
      <span
        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${theme} min-w-[100px]`}
      >
        {status || "Pending"}
      </span>
    </div>
  );
};

export default ReportsPage;
