import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Users } from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not logged in");

        const { data } = await axios.get(
          "http://localhost:5000/api/users/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (data.success) {
          setUsers(data.users || []);
        } else {
          throw new Error(data.error || "Failed to fetch users");
        }
      } catch (err) {
        console.error("Fetch users error:", err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, users]);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-[#0052CC]">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage and view all registered users
        </p>
        <p className="text-sm text-blue-600 font-semibold mt-2">
          Total Users: {filteredUsers.length}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white shadow-md rounded-full px-4 py-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-[#0052CC]"
        />
        <Users
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500">Loading users...</p>
        ) : error ? (
          <p className="p-6 text-red-500">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="p-6 text-slate-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-gradient-to-r from-[#0052CC] to-blue-600 text-white">
                <tr>
                  <th className="p-4 text-left text-sm">#</th>
                  <th className="p-4 text-left text-sm">User</th>
                  <th className="p-4 text-left text-sm">Email</th>
                  <th className="p-4 text-left text-sm">Role</th>
                  <th className="p-4 text-left text-sm">Status</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredUsers.map((user, index) => {
                  const initials = user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <tr
                      key={user.id}
                      className={`transition duration-200 hover:bg-blue-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50"
                      }`}
                    >
                      <td className="p-4 text-slate-600">{index + 1}</td>

                      {/* User with Avatar */}
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0052CC] to-blue-600 text-white flex items-center justify-center font-bold">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-slate-400">
                            Registered User
                          </p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 text-slate-600">{user.email}</td>

                      {/* Role */}
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {user.role || "User"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`flex items-center gap-2 px-3 py-1 w-fit rounded-full text-xs font-semibold ${
                            user.isEmailVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {user.isEmailVerified ? "Verified" : "Pending"}
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

export default UsersPage;
