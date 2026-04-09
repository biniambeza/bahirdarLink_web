import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MainContent from "./components/MainContent";

const AgencyDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active={active}
        setActive={setActive}
      />

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            active={active}
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          <MainContent active={active} />
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;

// import { useState } from "react";
// import { Outlet } from "react-router-dom"; // ← add this
// import Sidebar from "./components/Sidebar";
// import Header from "./components/Header";

// const AgencyDashboard = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [active, setActive] = useState("dashboard");

//   return (
//     <div className="flex h-screen overflow-hidden bg-gray-100">
//       {/* Sidebar */}
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         active={active}
//         setActive={setActive}
//       />

//       {/* Main Section */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <div className="flex-shrink-0">
//           <Header
//             sidebarOpen={sidebarOpen}
//             setSidebarOpen={setSidebarOpen}
//             active={active}
//           />
//         </div>

//         {/* Scrollable Content */}
//         <div className="flex-1 overflow-auto p-6 bg-slate-50">
//           {/* Render either the normal dashboard content or nested route */}
//           {active === "dashboard" ? (
//             <div>Main dashboard content here</div>
//           ) : (
//             <Outlet /> // ← This renders nested pages like EditResponderTeamPage
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AgencyDashboard;
