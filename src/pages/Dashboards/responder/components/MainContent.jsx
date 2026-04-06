import ResponderDashboardPage from "../pages/ResponderDashboardPage";
import ResponderIncidentsPage from "../pages/ResponderIncidentsPage";
import ResponderCasesPage from "../pages/CasesPage"; // ✅ already added
import ResponderSettingsPage from "../pages/SettingsPage"; // ✅ new import

const ResponderMainContent = ({ active }) => {
  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <ResponderDashboardPage />;

      case "incidents":
        return <ResponderIncidentsPage />;

      case "cases":
        return <ResponderCasesPage />; // ✅ existing

      case "settings":
        return <ResponderSettingsPage />; // ✅ new

      default:
        return <ResponderDashboardPage />;
    }
  };

  return (
    <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
      {renderContent()}
    </div>
  );
};

export default ResponderMainContent;
