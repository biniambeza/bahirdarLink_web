import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Search, MapPin, User, Calendar, AlertCircle, FileText } from "lucide-react";

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
        if (data.success) setReports(data.data || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Safe string converter helper to prevent crashes
  const safeString = (val) => {
    if (!val) return "";
    // If it's a populated object (common in Mongoose), get the name or en field
    if (typeof val === "object") return val.name || val.en || "";
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
        const type = safeString(r.emergencyType).toLowerCase();
        const category = safeString(r.category).toLowerCase();
        const reporter = safeString(r.reporterName).toLowerCase();
        const address = `${r.kebele} ${r.subdivision} ${r.street}`.toLowerCase();

        return (
          type.includes(query) ||
          category.includes(query) ||
          reporter.includes(query) ||
          address.includes(query)
        );
      });
  }, [filter, searchQuery, reports]);

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Emergency Reports</h1>
        <p className="text-slate-500 mt-2">Monitor and manage all incident reports from the field.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          {["all", "registered", "guest"].map((btn) => (
            <button
              key={btn}
              onClick={() => setFilter(btn)}
              className={`px-6 py-2 rounded-md text-sm font-bold capitalize transition-all ${
                filter === btn ? "bg-[#0052CC] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {btn}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0052CC] outline-none transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Loading Report Data...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500 flex flex-col items-center gap-2">
            <AlertCircle size={32} />
            <p>{error}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
            <FileText size={32} />
            <p>No reports found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Incident</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Reporter</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors cursor-default">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 capitalize">{safeString(report.emergencyType)}</div>
                      <div className="text-xs text-[#0052CC] font-medium">{safeString(report.category)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1.5 text-slate-600 text-sm">
                        <MapPin size={14} className="mt-0.5 text-slate-400 flex-shrink-0" />
                        <span>{[report.kebele, report.subdivision, report.street].filter(Boolean).join(", ") || "No address provided"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{report.reporterName || "Anonymous"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusChip status={report.status} />
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
  const theme = {
    resolved: "bg-green-100 text-green-700",
    in_progress: "bg-blue-100 text-blue-700",
    escalated: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
  }[s] || "bg-slate-100 text-slate-700";

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${theme}`}>
      {status || "Pending"}
    </span>
  );
};

export default ReportsPage;