import { useState } from "react";
import ResponderSidebar from "./components/Sidebar";
import ResponderHeader from "./components/Header";
import ResponderMainContent from "./components/MainContent";

const ResponderDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <ResponderSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active={active}
        setActive={setActive}
      />

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0">
          <ResponderHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            active={active}
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
          <ResponderMainContent active={active} />
        </div>
      </div>
    </div>
  );
};

export default ResponderDashboard;
