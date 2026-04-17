import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all"); // all | registered | guest
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all service emergencies (admin)
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
          throw new Error(data.error || "Failed to fetch reports");
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filter reports (service-based system)
  const filteredReports = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return reports
      .filter((report) => {
        if (filter === "registered") return report.reporterType === "user";
        if (filter === "guest") return report.reporterType === "guest";
        return true;
      })
      .filter((report) =>
        [
          report.serviceType?.name,
          report.serviceCategory?.name,
          report.kebele,
          report.subdivision,
          report.street,
          report.description,
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query)),
      );
  }, [reports, filter, searchQuery]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0052CC]">Service Reports</h1>
        <p className="text-sm text-slate-500">
          Monitor all service-based emergency reports
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "registered", "guest"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              filter === type
                ? "bg-[#0052CC] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <input
          type="text"
          placeholder="Search service, category, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white shadow-sm rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0052CC]"
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
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#0052CC] to-blue-600 text-white">
                <tr>
                  <th className="p-4 text-left">#</th>
                  <th className="p-4 text-left">Service Type</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Location</th>
                  <th className="p-4 text-left">Reporter</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredReports.map((report, index) => {
                  const status = report.status?.toLowerCase();

                  const statusStyle =
                    status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700";

                  return (
                    <tr key={report.id} className="hover:bg-blue-50 transition">
                      <td className="p-4 text-slate-600">{index + 1}</td>

                      <td className="p-4 text-slate-500">
                        {report.serviceType?.name || "-"}
                      </td>

                      <td className="p-4 text-slate-500">
                        {report.serviceCategory?.name || "-"}
                      </td>

                      <td className="p-4 text-slate-500">
                        {[report.kebele, report.subdivision, report.street]
                          .filter(Boolean)
                          .join(", ")}
                      </td>

                      <td className="p-4 font-bold text-slate-600">
                        {report.reporterName || "Unknown"}
                      </td>

                      <td className="p-4 text-slate-500">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle}`}
                        >
                          {report.status || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
