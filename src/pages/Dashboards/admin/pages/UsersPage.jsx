import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { PlusCircle, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Fetch users from backend ---
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

  // --- Filter users by search query ---
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, users]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0052CC]">User Management</h1>
          <p className="text-sm text-slate-500">View all registered users.</p>
        </div>
        <button
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-white shadow-lg transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0052CC] hover:bg-blue-700"
          }`}
        >
          <PlusCircle size={18} />
          Add User
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-slate-200 rounded-full px-4 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] transition-all"
        />
        <Users
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 col-span-full">Loading users...</p>
        ) : error ? (
          <p className="text-red-500 col-span-full">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-slate-500 col-span-full">No users found.</p>
        ) : (
          <AnimatePresence>
            {filteredUsers.map((user, idx) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-lg flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">{user.fullName}</h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                    {user.role || "User"}
                  </span>
                </div>
                <p className="text-slate-500 text-sm">{user.email}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Status: {user.isEmailVerified ? "Verified" : "Pending"}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
