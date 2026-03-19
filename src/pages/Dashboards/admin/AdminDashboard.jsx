import { useState } from "react";
import Sidebar from "./components/Sidebar"; // Your Sidebar
import Header from "./components/Header"; // Your existing Header component

import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import AgentsPage from "./pages/AgentsPage";
import SettingsPage from "./pages/SettingsPage";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPage, setSelectedPage] = useState("dashboard"); // default page

  // Render the main content based on selected page
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
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedCategory={selectedPage}
        setSelectedCategory={setSelectedPage}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          selectedPage={selectedPage} // pass page info to Header if needed
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 bg-[#F0F5FF] overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
