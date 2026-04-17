const MainContent = ({ activities }) => {
  return (
    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Left Side - Activities */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black text-[#0052CC] uppercase tracking-wider mb-4">
            System Activities
          </h2>

          {activities.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-lg"
            >
              <div className="flex items-center gap-6">
                <div
                  className={`w-16 h-16 ${item.bg} rounded-3xl flex items-center justify-center ${item.color}`}
                >
                  {item.icon}
                </div>

                <div>
                  <h4 className="font-black text-slate-800 text-lg">
                    {item.title}
                  </h4>
                  <p className="text-slate-400 text-xs">
                    {item.description} | {item.time}
                  </p>
                  <p className="text-[10px] font-bold">
                    By: {item.actor}
                  </p>
                </div>
              </div>

              <button className="px-6 py-3 bg-[#0052CC] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                Manage
              </button>
            </div>
          ))}
        </div>

        {/* Right Side - Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">
              System Overview
            </h3>

            <p className="text-slate-800 text-sm">
              Placeholder for users, teams, agencies stats
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;