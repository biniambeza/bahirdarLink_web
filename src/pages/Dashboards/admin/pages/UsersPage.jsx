import { useState, useEffect, useMemo } from "react";
import axios from "axios";

// Hardcoded directly to production backend service environment
const BASE_URL = "https://bahirlink-backend-1.onrender.com";

const injectStyles = () => {
  if (document.getElementById("users-styles")) return;
  const s = document.createElement("style");
  s.id = "users-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    .users-root { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes rowIn {
      from { opacity: 0; transform: translateX(-4px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes shimmerSweep {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .fade-up   { animation: fadeUp 0.4s cubic-bezier(.16,1,.3,1) both; }
    .fade-up-1 { animation-delay: 0.04s; }
    .fade-up-2 { animation-delay: 0.08s; }
    .row-in { animation: rowIn 0.2s cubic-bezier(.16,1,.3,1) both; }
    
    .search-wrap input { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
    .search-wrap input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
      outline: none;
    }
    .table-row { transition: background-color 0.12s ease; }
    .table-row:hover { background-color: #f1f5f9 !important; }
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 4px;
      font-size: 11px; font-weight: 600;
      letter-spacing: 0.02em;
    }
    .skeleton {
      background: linear-gradient(90deg,#f8fafc 25%,#e2e8f0 50%,#f8fafc 75%);
      background-size: 200% auto;
      animation: shimmerSweep 1.5s linear infinite;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(s);
};

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const Avatar = ({ name }) => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="w-9 h-9 rounded bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0 border border-blue-100">
      {initials}
    </div>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    <td className="p-4"><div className="skeleton h-4 w-5" /></td>
    <td className="p-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-9 h-9 rounded" />
        <div className="space-y-2">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton h-2.5 w-20" />
        </div>
      </div>
    </td>
    <td className="p-4"><div className="skeleton h-3 w-40" /></td>
    <td className="p-4"><div className="skeleton h-5 w-14 rounded" /></td>
    <td className="p-4"><div className="skeleton h-5 w-20 rounded" /></td>
  </tr>
);

const UsersPage = () => {
  useEffect(() => { injectStyles(); }, []);

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not logged in");
        const { data } = await axios.get(`${BASE_URL}/api/users/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setUsers(data.users || []);
        } else {
          throw new Error(data.error || "Failed to fetch users");
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [searchQuery, users]
  );

  const subtitleText = searchQuery
    ? `${filteredUsers.length} matching profile${filteredUsers.length !== 1 ? "s" : ""} found`
    : `Displaying all authorized platform system users`;

  return (
    <div className="users-root min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div className="max-w-7xl mx-auto px-8 py-12">

        {/* PAGE HEADER */}
        <div className="fade-up mb-10 border-b border-slate-200 pb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1.5">
            Administration Console
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            User Directory Management
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Audit master accounts, adjust access parameters, and manage active platform credentials across local and cloud configurations.
          </p>
        </div>

        {/* METRICS & SEARCH INTERACTION ROW */}
        <div className="fade-up fade-up-1 flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white rounded border border-slate-200 shadow-sm px-5 py-3.5 min-w-[150px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Accounts</p>
              <p className="text-2xl font-bold text-slate-950 mt-1 leading-none">{users.length}</p>
            </div>
            <div className="bg-white rounded border border-slate-200 shadow-sm px-5 py-3.5 min-w-[150px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified State</p>
              <p className="text-2xl font-bold text-blue-600 mt-1 leading-none">
                {users.filter(u => u.isEmailVerified).length}
              </p>
            </div>
            <div className="bg-white rounded border border-slate-200 shadow-sm px-5 py-3.5 min-w-[150px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Action</p>
              <p className="text-2xl font-bold text-slate-600 mt-1 leading-none">
                {users.filter(u => !u.isEmailVerified).length}
              </p>
            </div>
          </div>

          <div className="search-wrap relative w-full lg:w-80">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search directory parameters..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm"
            />
          </div>
        </div>

        {/* CENTRAL TABLE DATA COMPLEX */}
        <div className="fade-up fade-up-2 bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Registry Database</h2>
              <p className="text-xs text-slate-500 mt-0.5">{subtitleText}</p>
            </div>
            <span className="text-xs font-bold tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded">
              {filteredUsers.length} Active Records
            </span>
          </div>

          {error ? (
            <div className="p-16 text-center max-w-sm mx-auto">
              <p className="text-sm font-bold text-red-600">Sync Execution Interrupted</p>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[11px] font-bold tracking-wider uppercase">
                    <th className="px-6 py-3.5 w-16">No.</th>
                    <th className="px-6 py-3.5">User Details</th>
                    <th className="px-6 py-3.5">Network Address (Email)</th>
                    <th className="px-6 py-3.5">Privilege Scope</th>
                    <th className="px-6 py-3.5">System Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} />)
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <p className="text-sm font-medium text-slate-400">Zero database matches correspond to query inputs.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr
                        key={user.id || user._id}
                        className="table-row row-in bg-white"
                        style={{ animationDelay: `${index * 0.02}s` }}
                      >
                        <td className="px-6 py-4 text-slate-400 text-xs font-mono font-bold">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.fullName} />
                            <div>
                              <p className="font-bold text-slate-900 text-sm leading-tight">{user.fullName}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">Verified Profile Account</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm font-medium font-mono">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="badge bg-blue-50 text-blue-700 border border-blue-100 uppercase text-[10px]">
                            {user.role || "User"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${
                            user.isEmailVerified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                              : "bg-amber-50 text-amber-700 border border-amber-150"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isEmailVerified ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {user.isEmailVerified ? "Verified Identity" : "Awaiting Verification"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SYSTEM FOOTER */}
        <p className="text-center text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-16">
          BahirLink Corporate Systems &bull; Unified Registry Module
        </p>
      </div>
    </div>
  );
};

export default UsersPage;