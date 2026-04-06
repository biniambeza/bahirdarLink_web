import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all"); // all | registered | guest
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not logged in");

        const { data } = await axios.get(
          "http://localhost:5000/api/emergencies/admin/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (data.success) {
          setReports(data.data || []);
        } else {
          throw new Error(data.error || "Failed to fetch emergencies");
        }
      } catch (err) {
        console.error("Fetch emergencies error:", err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filtered by type (registered vs guest) + search query
  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        if (filter === "registered") return report.reporterType === "user";
        if (filter === "guest") return report.reporterType === "guest";
        return true;
      })
      .filter(
        (report) =>
          report.emergencyType?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          report.kebele?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.subdivision
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          report.street?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
  }, [filter, searchQuery, reports]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0052CC] mb-2">Reports</h1>
        <p className="text-sm text-slate-500">
          View all reported emergencies (Registered & Guest users)
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["all", "registered", "guest"].map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              filter === type
                ? "bg-[#0052CC] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            onClick={() => setFilter(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <input
          type="text"
          placeholder="Search by type or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white shadow-sm rounded-full px-4 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-[#0052CC]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500">Loading reports...</p>
        ) : error ? (
          <p className="p-6 text-red-500">{error}</p>
        ) : filteredReports.length === 0 ? (
          <p className="p-6 text-slate-500">No reports found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#0052CC] to-blue-600 text-white">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold">#</th>
                  <th className="p-4 text-left text-sm font-semibold">Type</th>
                  <th className="p-4 text-left text-sm font-semibold">
                    Category
                  </th>
                  <th className="p-4 text-left text-sm font-semibold">
                    Address
                  </th>
                  <th className="p-4 text-left text-sm font-semibold">Date</th>
                  <th className="p-4 text-left text-sm font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report, index) => (
                  <tr
                    key={report.id}
                    className="hover:bg-blue-50 transition duration-200"
                  >
                    <td className="p-4 text-slate-600">{index + 1}</td>
                    <td className="p-4 text-slate-500">
                      {report.emergencyType?.name}
                    </td>
                    <td className="p-4 text-slate-500">{report.categoryId}</td>
                    <td className="p-4 text-slate-500">
                      {report.kebele}, {report.subdivision}, {report.street}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          report.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {report.status}
                      </span>
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

export default ReportsPage;
