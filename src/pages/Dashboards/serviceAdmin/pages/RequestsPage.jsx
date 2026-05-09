import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Search,
  MapPin,
  Calendar,
  AlertCircle,
  Briefcase,
  ClipboardList,
} from "lucide-react";

const ServiceRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Targeted API for service data
  const API_URL = "http://localhost:5000/api/service/all";

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          // Mapping to the service-specific data structure
          setRequests(data.data || data.services || []);
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  /**
   * SMART RENDERER
   * Identical logic to handle your mixed backend data (JSON vs Strings)
   */
  const renderEnglish = (val) => {
    if (!val) return "";
    if (typeof val === "object") {
      return val.en || val.name?.en || val.label?.en || val.name || "";
    }
    if (typeof val === "string") {
      if (val.includes('{"en":') || val.includes('{"am":')) {
        try {
          const parsed = JSON.parse(val);
          return parsed.en || "";
        } catch (e) {
          return val;
        }
      }
    }
    return String(val);
  };

  const filteredRequests = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return requests
      .filter((r) => {
        if (filter === "pending") return r.status === "pending";
        if (filter === "completed")
          return r.status === "completed" || r.status === "resolved";
        return true;
      })
      .filter((r) => {
        const type = renderEnglish(r.serviceType).toLowerCase();
        const category = renderEnglish(
          r.category || r.serviceCategory,
        ).toLowerCase();
        const user = renderEnglish(r.userName || r.fullName).toLowerCase();
        const loc =
          `${renderEnglish(r.kebele)} ${renderEnglish(r.street)}`.toLowerCase();

        return (
          type.includes(query) ||
          category.includes(query) ||
          user.includes(query) ||
          loc.includes(query)
        );
      });
  }, [filter, searchQuery, requests]);

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans antialiased text-slate-900">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Service Registry
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Reviewing historical and active service applications.
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Records
          </p>
          <p className="text-xl font-black text-[#0052CC]">
            {filteredRequests.length}{" "}
            <span className="text-slate-300 text-sm font-bold">Entries</span>
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-center justify-between">
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 w-full lg:w-auto">
          {["all", "pending", "completed"].map((btn) => (
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
            placeholder="Search service, user, or location..."
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
            Loading Services...
          </div>
        ) : error ? (
          <div className="py-24 text-center text-rose-500 flex flex-col items-center gap-4">
            <AlertCircle size={40} />
            <p className="font-black tracking-tight">{error}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-24 text-center text-slate-300 flex flex-col items-center gap-4">
            <ClipboardList size={40} />
            <p className="font-bold text-sm">No service logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Service Info
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Location
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Applicant
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Logged Date
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id || req._id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-800 text-lg leading-tight">
                        {renderEnglish(req.serviceType)}
                      </div>
                      <div className="text-[10px] text-[#0052CC] font-black uppercase tracking-wider mt-1 flex items-center gap-1.5">
                        <Briefcase size={10} />
                        {renderEnglish(
                          req.category || req.serviceCategory || "General",
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-2.5 text-slate-600 text-sm font-bold">
                        <MapPin
                          size={16}
                          className="mt-0.5 text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0"
                        />
                        <span className="max-w-[220px]">
                          {[
                            renderEnglish(req.kebele),
                            renderEnglish(req.street),
                          ]
                            .filter(Boolean)
                            .join(", ") || "City Center"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {renderEnglish(req.userName || "U")?.charAt(0)}
                        </div>
                        <div className="text-sm font-black text-slate-700">
                          {renderEnglish(req.userName || "Unknown User")}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                        <Calendar size={14} className="text-slate-300" />
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleDateString(
                              undefined,
                              { dateStyle: "medium" },
                            )
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <StatusChip status={renderEnglish(req.status)} />
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
    approved: "bg-blue-50 text-blue-600 border-blue-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
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

export default ServiceRequestsPage;
