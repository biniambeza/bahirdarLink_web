import { useState, useEffect, useMemo } from "react";
import { 
  LogOut, Bell, Menu, Clock, Map, Users, 
  Settings, Search, PlusCircle, Flame, Droplets, Skull, 
  Ambulance, Eye, RefreshCw, Home, ShieldAlert, Radio, 
  Activity, ChevronRight, User, ShieldCheck, X, Navigation,
  UserCheck, UserMinus, Signal, Zap, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  // --- STATE ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [notifications, setNotifications] = useState(3);
  
  // --- LOGOUT STATE ---
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // --- MOCK DATA (Synced with App screenshot) ---
  const [emergencies, setEmergencies] = useState([
    { id: "FIR-021", category: "fire", title: "Residential Fire", location: "Kebele 11, Abay Mado", severity: "critical", status: "pending", time: "1m ago", reporter: "Guest_4421", icon: <Flame size={20}/>, color: "text-red-500", bg: "bg-red-50" },
    { id: "CRM-109", category: "crime", title: "Street Robbery", location: "Grand Resort Area", severity: "high", status: "responding", time: "5m ago", reporter: "Dawit M. (Verified)", icon: <Skull size={20}/>, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "MED-332", category: "medical", title: "Emergency Childbirth", location: "Kebele 14", severity: "critical", status: "on-route", time: "8m ago", reporter: "Guest_1102", icon: <Ambulance size={20}/>, color: "text-pink-500", bg: "bg-pink-50" },
    { id: "FLD-004", category: "flood", title: "Lake Overrun", location: "Tana Shore", severity: "moderate", status: "pending", time: "15m ago", reporter: "Kidus H. (Verified)", icon: <Droplets size={20}/>, color: "text-blue-500", bg: "bg-blue-50" },
  ]);

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    // 1. Clear session/local storage
    localStorage.removeItem("token"); 
    sessionStorage.clear();
    
    // 2. Redirect to Login (Hard reload or use useNavigate from react-router-dom)
    window.location.href = "/login"; 
  };

  const filteredIncidents = useMemo(() => {
    return emergencies.filter(incident => {
      const matchesCat = selectedCategory === "all" || incident.category === selectedCategory;
      const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            incident.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery, emergencies]);

  return (
    <div className="min-h-screen bg-[#F0F5FF] flex font-sans text-slate-900 overflow-hidden">
      
      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Logout</h3>
              <p className="text-slate-500 text-sm mb-8">Are you sure you want to end your current session at BahirLink HQ?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR (Updated to Dark Blue) --- */}
      <motion.aside 
        animate={{ width: sidebarOpen ? 280 : 90 }}
        className="bg-[#0052CC] h-screen flex flex-col z-30 shadow-2xl shadow-blue-900/40"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="min-w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shadow-lg">
             <Zap className="text-[#0052CC] fill-[#0052CC]" size={24} />
          </div>
          {sidebarOpen && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-black text-white text-2xl tracking-tighter">
              Bahir<span className="font-light">Link</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          <SidebarLink active={selectedCategory === "all"} icon={<Home size={22}/>} label="Dashboard" open={sidebarOpen} onClick={() => setSelectedCategory("all")} />
          <SidebarLink active={selectedCategory === "fire"} icon={<Flame size={22}/>} label="Fire Dept" open={sidebarOpen} onClick={() => setSelectedCategory("fire")} />
          <SidebarLink active={selectedCategory === "crime"} icon={<Skull size={22}/>} label="Crime Unit" open={sidebarOpen} onClick={() => setSelectedCategory("crime")} />
          <SidebarLink active={selectedCategory === "medical"} icon={<Ambulance size={22}/>} label="Medical" open={sidebarOpen} onClick={() => setSelectedCategory("medical")} />
          <SidebarLink active={selectedCategory === "flood"} icon={<Droplets size={22}/>} label="Flood" open={sidebarOpen} onClick={() => setSelectedCategory("flood")} />
        </nav>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-4 text-blue-100 hover:text-white transition-colors px-4 py-2 w-full"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-bold text-sm uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER (App-style Gradient) */}
        <header className="h-28 bg-gradient-to-r from-[#0052CC] to-[#1E90FF] px-10 flex items-center justify-between shadow-lg relative z-20">
          <div className="flex items-center gap-8">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:scale-110 transition-transform">
               <Menu size={28} />
             </button>
             <div>
               <h1 className="text-white text-2xl font-black tracking-tight">Welcome, Admin!</h1>
               <p className="text-blue-100 text-sm font-medium">Bahir Dar Emergency Monitoring System</p>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <input type="text" placeholder="Quick Search..." className="bg-white/10 border border-white/20 rounded-full pl-12 pr-6 py-2.5 text-white placeholder:text-white/50 text-sm outline-none w-64 focus:w-80 transition-all focus:bg-white/20" />
            </div>

            <button className="relative p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 border-2 border-[#1E90FF] rounded-full text-[10px] flex items-center justify-center font-bold">3</span>
            </button>

            {/* CIRCULAR PROFILE WITH STATUS INDICATOR */}
            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="relative group">
                <div className="w-14 h-14 rounded-full border-4 border-white/30 p-1 group-hover:border-white transition-all">
                  <img src="https://ui-avatars.com/api/?name=Admin&background=ffffff&color=0052cc" className="w-full h-full rounded-full object-cover shadow-xl" alt="profile" />
                </div>
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-[#1E90FF] rounded-full shadow-lg" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl p-4 z-50 overflow-hidden">
                    <div className="flex items-center gap-3 p-2 mb-2">
                       <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">AD</div>
                       <div>
                         <p className="font-black text-slate-800 text-sm leading-none">Super Admin</p>
                         <p className="text-[10px] text-slate-500 font-bold mt-1">Verified Access</p>
                       </div>
                    </div>
                    <ProfileOption icon={<User size={16}/>} label="Account Info" />
                    <ProfileOption icon={<Settings size={16}/>} label="System Config" />
                    <button 
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl transition-all text-red-500 font-bold text-xs uppercase"
                    >
                      <LogOut size={16}/> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* INCIDENT QUEUE */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-[#0052CC] uppercase tracking-wider">Priority Alerts</h2>
                <div className="flex gap-2">
                   <FilterBadge label="Guest Mode" count="5" active />
                   <FilterBadge label="Registered" count="2" />
                </div>
              </div>
              <AnimatePresence mode="popLayout">
                {filteredIncidents.map((em, idx) => (
                  <IncidentCard key={em.id} em={em} index={idx} />
                ))}
              </AnimatePresence>
            </div>

            {/* QUICK ACTIONS & STATS */}
            <div className="space-y-6">
               <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-6">Real-time Stats</h3>
                  <div className="space-y-6">
                    <ProgressStat label="Fire Response Efficiency" val={82} color="bg-red-500" />
                    <ProgressStat label="Medical Unit Availability" val={45} color="bg-pink-500" />
                    <ProgressStat label="Police Coverage" val={91} color="bg-[#0052CC]" />
                  </div>
               </div>

               <div className="bg-[#0052CC] rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/30">
                  <h4 className="font-black text-xs uppercase tracking-widest text-blue-200 mb-6">Coordination Tools</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <ActionBtn icon={<PlusCircle/>} label="New Report" />
                     <ActionBtn icon={<Map/>} label="Map View" />
                     <ActionBtn icon={<Radio/>} label="Dispatch" />
                     <ActionBtn icon={<Users/>} label="Officers" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const SidebarLink = ({ active, icon, label, open, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-white/20 text-white shadow-inner' : 'text-blue-100 hover:bg-white/10'}`}>
    <span className={active ? "scale-110" : "opacity-70"}>{icon}</span>
    {open && <span className="text-sm font-bold uppercase tracking-widest">{label}</span>}
  </button>
);

const ProfileOption = ({ icon, label }) => (
  <button className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-all text-slate-600 hover:text-[#0052CC] font-bold text-xs uppercase">
    {icon} {label}
  </button>
);

const IncidentCard = ({ em, index }) => (
  <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-blue-300 transition-all flex items-center justify-between group shadow-sm hover:shadow-xl">
    <div className="flex items-center gap-6">
      <div className={`w-16 h-16 ${em.bg} rounded-3xl flex items-center justify-center ${em.color} shadow-sm group-hover:rotate-12 transition-transform`}>
        {em.icon}
      </div>
      <div>
        <h4 className="font-black text-slate-800 text-lg leading-none mb-2">{em.title}</h4>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase"><Map size={12}/> {em.location}</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">{em.time}</span>
        </div>
        <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-tighter">Reporter: <span className="text-slate-600">{em.reporter}</span></p>
      </div>
    </div>
    <div className="flex items-center gap-4">
       <div className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${em.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-slate-100'}`}>
         {em.severity}
       </div>
       <button className="px-6 py-3 bg-[#0052CC] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20">
         Assign
       </button>
    </div>
  </motion.div>
);

const FilterBadge = ({ label, count, active }) => (
  <button className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border transition-all ${active ? 'bg-[#0052CC] text-white border-[#0052CC]' : 'bg-white text-slate-400 border-slate-200'}`}>
    {label} <span className={`px-1.5 rounded-md ${active ? 'bg-white/20' : 'bg-slate-100'}`}>{count}</span>
  </button>
);

const ProgressStat = ({ label, val, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
      <span>{label}</span>
      <span className="text-slate-800">{val}%</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className={`h-full ${color}`} />
    </div>
  </div>
);

const ActionBtn = ({ icon, label }) => (
  <button className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all border border-white/5 group">
    <span className="text-white mb-2 group-hover:scale-125 transition-transform">{icon}</span>
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default AdminDashboard;