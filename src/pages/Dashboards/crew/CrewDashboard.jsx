// import { useState } from "react";
// import CrewSidebar from "./components/CrewSidebar";
// import CrewHeader from "./components/CrewHeader";
// import CrewMainContent from "./components/CrewMainContent";

// const CrewDashboard = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [active, setActive] = useState("dashboard");

//   return (
//     <div className="flex h-screen bg-gray-100 overflow-hidden">
//       {/* Sidebar */}
//       <CrewSidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         active={active}
//         setActive={setActive}
//       />

//       {/* Main Section */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <div className="flex-shrink-0">
//           <CrewHeader
//             sidebarOpen={sidebarOpen}
//             setSidebarOpen={setSidebarOpen}
//             active={active}
//           />
//         </div>

//         {/* Scrollable Content */}
//         <div className="flex-1 overflow-auto bg-slate-50 p-6">
//           <CrewMainContent active={active} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CrewDashboard;
