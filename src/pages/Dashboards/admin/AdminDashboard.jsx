import { useState } from "react";
import Sidebar from "./components/Sidebar"; // Sidebar component
import Header from "./components/Header"; // Header component

// Pages
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import AgentsPage from "./pages/AgentsPage";
import SettingsPage from "./pages/SettingsPage";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPage, setSelectedPage] = useState("dashboard");

  const renderContent = () => {
    switch (selectedPage) {
      case "dashboard":
        return <DashboardPage />;
      case "users":
        return <UsersPage />;
      case "reports":
        return <ReportsPage />;
      case "agents":
        return <AgentsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedCategory={selectedPage}
        setSelectedCategory={setSelectedPage}
      />

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0">
          <Header
            selectedPage={selectedPage}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-[#F0F5FF]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
