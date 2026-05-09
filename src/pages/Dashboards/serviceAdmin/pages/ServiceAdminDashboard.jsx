import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

// Pages
import DashboardPage from "./DashboardPage";
import UsersPage from "./UsersPage";
import ReportsPage from "./ReportsPage";
import AgentsPage from "./AgentsPage";
import SettingsPage from "./SettingsPage";
import KebelePage from "./KebelePage";
import CategoryPage from "./CategoryPage";
import ServiceRequestsPage from "./RequestsPage";

const ServiceAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPage, setSelectedPage] = useState("dashboard");

  const renderContent = () => {
    switch (selectedPage) {
      case "dashboard":
        return <DashboardPage />;

      case "users":
        return <UsersPage />;

      case "requests":
        return <ServiceRequestsPage />;

      case "agents":
        return <AgentsPage />;

      case "kebele":
        return <KebelePage />;

      case "category":
        return <CategoryPage />;

      case "settings":
        return <SettingsPage />;

      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#F0F5FF]">
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

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default ServiceAdminDashboard;
