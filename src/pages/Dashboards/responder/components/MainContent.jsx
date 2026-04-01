import ResponderDashboardPage from "../pages/ResponderDashboardPage";
import ResponderIncidentsPage from "../pages/ResponderIncidentsPage";

const ResponderMainContent = ({ active }) => {
  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <ResponderDashboardPage />;

      case "incidents":
        return <ResponderIncidentsPage />;

      case "dispatch":
        return <ResponderDispatchPage />;

      case "profile":
        return <ResponderProfilePage />;

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
