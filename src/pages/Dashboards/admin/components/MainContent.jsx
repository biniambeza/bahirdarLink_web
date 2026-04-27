const MainContent = ({ filteredIncidents }) => {
  return (
    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black text-[#0052CC] uppercase tracking-wider mb-4">
            Priority Alerts
          </h2>
          {filteredIncidents.map((em) => (
            <div
              key={em.id}
              className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-lg"
            >
              <div className="flex items-center gap-6">
                <div
                  className={`w-16 h-16 ${em.bg} rounded-3xl flex items-center justify-center ${em.color}`}
                >
                  {em.icon}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg">
                    {em.title}
                  </h4>
                  <p className="text-slate-400 text-xs">
                    {em.location} | {em.time}
                  </p>
                  <p className="text-[10px] font-bold">
                    Reporter: {em.reporter}
                  </p>
                </div>
              </div>
              <button className="px-6 py-3 bg-[#0052CC] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                Assign
              </button>
            </div>
          ))}
        </div>
        {/* Quick Stats or Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">
              Real-time Stats
            </h3>
            <p className="text-slate-800 text-sm">
              Placeholder for charts/stats
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;