import { Lock, User } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-blue-200 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-900 tracking-wide">
            BahirLink
          </h2>
          <p className="text-sm text-blue-600 mt-1">
            Emergency Response Command Center
          </p>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-blue-900 mb-1">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-blue-900 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 h-5 w-5" />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Login Button */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
          Login
        </button>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-blue-700">
          Authorized personnel only
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
