import DashboardPage from "../pages/DashboardPage";
import IncidentsPage from "../pages/IncidentsPage";
import UnitsPage from "../pages/UnitsPage";
import KebelePage from "../../admin/pages/KebelePage";
import CategoryPage from "../../admin/pages/CategoryPage"; // <-- import new page

const MainContent = ({ active }) => {
  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <DashboardPage />;
      case "incidents":
        return <IncidentsPage />;
      case "units":
        return <UnitsPage />;

      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
      {renderContent()}
    </div>
  );
};

export default MainContent;
