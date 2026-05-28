// import React, { useState, useEffect, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   MapPin,
//   User,
//   MessageSquare,
//   RefreshCcw,
//   AlertCircle,
//   Clock,
//   Calendar,
//   Phone,
//   Ruler,
//   AlertTriangle,
//   CheckCircle2,
//   XCircle,
//   Hourglass,
//   ShieldCheck,
//   Eye,
// } from "lucide-react";
// import axios from "axios";

// const BASE_URL = "https://bahirlink-backend-1.onrender.com";

// const API_ENDPOINTS = {
//   caseDetail: (id) => `${BASE_URL}/api/cases/${id}`,
//   caseStatus: (id) => `${BASE_URL}/api/cases/${id}/status`,
//   sightings: (id) => `${BASE_URL}/api/caseReports/case/${id}?lang=en`,
// };

// const STATUS_OPTIONS = ["pending", "approved", "rejected", "resolved"];

// const STATUS_META = {
//   resolved: {
//     accent: "#059669",
//     light: "#ecfdf5",
//     mid: "#a7f3d0",
//     text: "#065f46",
//     label: "Resolved",
//   },
//   approved: {
//     accent: "#2563eb",
//     light: "#eff6ff",
//     mid: "#bfdbfe",
//     text: "#1e3a8a",
//     label: "Approved",
//   },
//   rejected: {
//     accent: "#dc2626",
//     light: "#fef2f2",
//     mid: "#fecaca",
//     text: "#7f1d1d",
//     label: "Rejected",
//   },
//   pending: {
//     accent: "#d97706",
//     light: "#fffbeb",
//     mid: "#fde68a",
//     text: "#78350f",
//     label: "Pending",
//   },
// };

// const SIGHTING_META = {
//   verified: {
//     accent: "#059669",
//     bg: "#ecfdf5",
//     icon: CheckCircle2,
//     label: "Verified",
//   },
//   rejected: {
//     accent: "#dc2626",
//     bg: "#fef2f2",
//     icon: XCircle,
//     label: "Rejected",
//   },
//   pending: {
//     accent: "#9ca3af",
//     bg: "#f9fafb",
//     icon: Hourglass,
//     label: "Pending",
//   },
// };

// const cleanStr = (v, lang = "en") => {
//   if (v == null) return "";

//   if (typeof v === "string") {
//     const t = v.trim();
//     if (t.startsWith("{")) {
//       try {
//         return cleanStr(JSON.parse(t), lang);
//       } catch (_) {}
//     }
//     return t;
//   }

//   if (typeof v === "object") {
//     if (v.name !== undefined) return cleanStr(v.name, lang);
//     if (v[lang]) return String(v[lang]).trim();
//     if (v.en) return String(v.en).trim();
//     if (v.am) return String(v.am).trim();
//     const first = Object.values(v).find(
//       (x) => typeof x === "string" && x.trim(),
//     );
//     return first ? first.trim() : "";
//   }

//   return String(v).trim();
// };

// const fmt = (iso) =>
//   iso
//     ? new Date(iso).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       })
//     : "—";

// const Tag = ({ children, color = "#2563eb", bg = "#eff6ff" }) => (
//   <span
//     style={{
//       display: "inline-flex",
//       alignItems: "center",
//       padding: "4px 12px",
//       borderRadius: 99,
//       background: bg,
//       color,
//       fontSize: 11,
//       fontWeight: 700,
//       letterSpacing: "0.04em",
//       fontFamily: "system-ui, sans-serif",
//     }}
//   >
//     {children}
//   </span>
// );

// const Label = ({ children }) => (
//   <p
//     style={{
//       fontSize: 10,
//       fontWeight: 700,
//       letterSpacing: "0.12em",
//       textTransform: "uppercase",
//       color: "#9ca3af",
//       marginBottom: 4,
//       fontFamily: "system-ui, sans-serif",
//     }}
//   >
//     {children}
//   </p>
// );

// const Value = ({ children, large }) => (
//   <p
//     style={{
//       fontSize: large ? 15 : 14,
//       fontWeight: 600,
//       color: "#111827",
//       lineHeight: 1.5,
//       fontFamily: "system-ui, sans-serif",
//     }}
//   >
//     {children || "—"}
//   </p>
// );

// const Divider = () => (
//   <div style={{ height: 1, background: "#f3f4f6", margin: "0 -24px" }} />
// );

// const Card = ({ children, style = {} }) => (
//   <div
//     style={{
//       background: "#fff",
//       borderRadius: 16,
//       border: "1px solid #f3f4f6",
//       boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
//       overflow: "hidden",
//       ...style,
//     }}
//   >
//     {children}
//   </div>
// );

// const CardSection = ({ children, style = {} }) => (
//   <div style={{ padding: "20px 24px", ...style }}>{children}</div>
// );

// const MetricBox = ({ label, value, accent }) => (
//   <div
//     style={{
//       padding: "16px 18px",
//       background: "#fafafa",
//       borderRadius: 12,
//       border: "1px solid #f3f4f6",
//     }}
//   >
//     <Label>{label}</Label>
//     <p
//       style={{
//         fontSize: 20,
//         fontWeight: 800,
//         color: accent || "#111827",
//         fontFamily: "system-ui, sans-serif",
//         lineHeight: 1.2,
//       }}
//     >
//       {value || "—"}
//     </p>
//   </div>
// );

// const SightingCard = React.memo(({ report, index }) => {
//   const status = report.status || "pending";
//   const meta = SIGHTING_META[status] ?? SIGHTING_META.pending;
//   const Icon = meta.icon;

//   return (
//     <div
//       style={{
//         padding: "16px",
//         background: "#fff",
//         borderRadius: 12,
//         border: "1px solid #f3f4f6",
//         borderLeft: `3px solid ${meta.accent}`,
//         marginBottom: 8,
//         animation: `fadeUp 0.25s ease forwards`,
//         animationDelay: `${index * 0.04}s`,
//         opacity: 0,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 8,
//         }}
//       >
//         <span
//           style={{
//             fontSize: 11,
//             fontWeight: 600,
//             color: "#6b7280",
//             fontFamily: "system-ui, sans-serif",
//           }}
//         >
//           {fmt(report.spottedAt)}
//         </span>
//         <span
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 4,
//             fontSize: 10,
//             fontWeight: 700,
//             letterSpacing: "0.05em",
//             color: meta.accent,
//             background: meta.bg,
//             padding: "2px 8px",
//             borderRadius: 99,
//             fontFamily: "system-ui, sans-serif",
//           }}
//         >
//           <Icon size={9} />
//           {meta.label}
//         </span>
//       </div>
//       <p
//         style={{
//           fontSize: 13,
//           color: "#374151",
//           lineHeight: 1.6,
//           marginBottom: 8,
//           fontFamily: "system-ui, sans-serif",
//         }}
//       >
//         {cleanStr(report.description) || "No description provided."}
//       </p>
//       <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
//         <MapPin size={10} color="#d1d5db" />
//         <span
//           style={{
//             fontSize: 11,
//             color: "#9ca3af",
//             fontFamily: "system-ui, sans-serif",
//           }}
//         >
//           {cleanStr(report.kebele) || "Location unknown"}
//         </span>
//       </div>
//     </div>
//   );
// });
// SightingCard.displayName = "SightingCard";

// const StatusPanel = React.memo(
//   ({ currentStatus, updating, onStatusChange }) => (
//     <Card>
//       <CardSection>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 8,
//             marginBottom: 16,
//           }}
//         >
//           <RefreshCcw
//             size={13}
//             color="#9ca3af"
//             style={{ animation: updating ? "spin 1s linear infinite" : "none" }}
//           />
//           <Label>Update Case Status</Label>
//         </div>
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(4, 1fr)",
//             gap: 8,
//           }}
//         >
//           {STATUS_OPTIONS.map((s) => {
//             const meta = STATUS_META[s] ?? STATUS_META.pending;
//             const isActive = currentStatus === s;
//             return (
//               <button
//                 key={s}
//                 disabled={updating || isActive}
//                 onClick={() => onStatusChange(s)}
//                 style={{
//                   padding: "10px 8px",
//                   borderRadius: 10,
//                   border: `1.5px solid ${isActive ? meta.accent : "#e5e7eb"}`,
//                   background: isActive ? meta.light : "#fff",
//                   color: isActive ? meta.accent : "#6b7280",
//                   fontSize: 11,
//                   fontWeight: 700,
//                   letterSpacing: "0.04em",
//                   cursor: isActive || updating ? "not-allowed" : "pointer",
//                   transition: "all 0.15s ease",
//                   fontFamily: "system-ui, sans-serif",
//                 }}
//                 onMouseEnter={(e) => {
//                   if (!isActive && !updating) {
//                     e.currentTarget.style.borderColor = meta.accent;
//                     e.currentTarget.style.color = meta.accent;
//                     e.currentTarget.style.background = meta.light;
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   if (!isActive) {
//                     e.currentTarget.style.borderColor = "#e5e7eb";
//                     e.currentTarget.style.color = "#6b7280";
//                     e.currentTarget.style.background = "#fff";
//                   }
//                 }}
//               >
//                 {meta.label}
//               </button>
//             );
//           })}
//         </div>
//       </CardSection>
//     </Card>
//   ),
// );
// StatusPanel.displayName = "StatusPanel";

// const LoadingScreen = () => (
//   <div
//     style={{
//       minHeight: "100vh",
//       background: "#f9fafb",
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: 20,
//     }}
//   >
//     <div style={{ position: "relative", width: 52, height: 52 }}>
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           borderRadius: "50%",
//           border: "2.5px solid #e5e7eb",
//           borderTop: "2.5px solid #2563eb",
//           animation: "spin 0.9s linear infinite",
//         }}
//       />
//       <Eye
//         size={16}
//         color="#2563eb"
//         style={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           transform: "translate(-50%,-50%)",
//         }}
//       />
//     </div>
//     <p
//       style={{
//         fontSize: 11,
//         fontWeight: 700,
//         letterSpacing: "0.15em",
//         color: "#9ca3af",
//         textTransform: "uppercase",
//         fontFamily: "system-ui, sans-serif",
//       }}
//     >
//       Loading case file…
//     </p>
//   </div>
// );

// const CaseDetailPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [caseData, setCaseData] = useState(null);
//   const [sightings, setSightings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sightingsLoading, setSightingsLoading] = useState(true);
//   const [updating, setUpdating] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchCaseDetail = useCallback(
//     async (signal) => {
//       try {
//         const res = await axios.get(API_ENDPOINTS.caseDetail(id), { signal });
//         setCaseData(res.data?.data ?? res.data);
//       } catch (err) {
//         if (axios.isCancel(err)) return;
//         setError("Failed to load case details.");
//       }
//     },
//     [id],
//   );

//   const fetchSightings = useCallback(
//     async (signal) => {
//       setSightingsLoading(true);
//       try {
//         const res = await axios.get(API_ENDPOINTS.sightings(id), { signal });
//         const payload = res.data?.data ?? res.data;
//         setSightings(Array.isArray(payload) ? payload : []);
//       } catch (err) {
//         if (axios.isCancel(err)) return;
//         setSightings([]);
//       } finally {
//         setSightingsLoading(false);
//       }
//     },
//     [id],
//   );

//   useEffect(() => {
//     const ctrl = new AbortController();
//     const load = async () => {
//       setLoading(true);
//       setError(null);
//       await Promise.all([
//         fetchCaseDetail(ctrl.signal),
//         fetchSightings(ctrl.signal),
//       ]);
//       setLoading(false);
//     };
//     load();
//     return () => ctrl.abort();
//   }, [fetchCaseDetail, fetchSightings]);

//   const handleStatusChange = async (newStatus) => {
//     if (newStatus === caseData?.status) return;
//     setUpdating(true);
//     try {
//       await axios.put(API_ENDPOINTS.caseStatus(id), { status: newStatus });
//       await fetchCaseDetail();
//     } catch {
//       alert("Status update failed. Please try again.");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   if (loading) return <LoadingScreen />;

//   if (error || !caseData) {
//     return (
//       <div
//         style={{
//           minHeight: "100vh",
//           background: "#f9fafb",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: 12,
//         }}
//       >
//         <div
//           style={{
//             width: 56,
//             height: 56,
//             borderRadius: "50%",
//             background: "#fef2f2",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <AlertCircle size={24} color="#dc2626" />
//         </div>
//         <p
//           style={{
//             fontSize: 15,
//             fontWeight: 700,
//             color: "#111827",
//             fontFamily: "system-ui, sans-serif",
//           }}
//         >
//           {error || "Case not found"}
//         </p>
//         <button
//           onClick={() => navigate(-1)}
//           style={{
//             marginTop: 8,
//             fontSize: 13,
//             fontWeight: 600,
//             color: "#2563eb",
//             background: "none",
//             border: "none",
//             cursor: "pointer",
//             fontFamily: "system-ui, sans-serif",
//           }}
//         >
//           ← Go back
//         </button>
//       </div>
//     );
//   }

//   const sm = STATUS_META[caseData.status] ?? STATUS_META.pending;
//   const fullName = cleanStr(caseData.fullName) || "Unknown Subject";
//   const desc = cleanStr(caseData.description);
//   const features = cleanStr(caseData.distinctiveFeatures);
//   const location = cleanStr(caseData.lastSeenLocation || caseData.location);
//   const contact = cleanStr(caseData.contactInfo);
//   const imageUrl = caseData.mediaUrl
//     ? caseData.mediaUrl.startsWith("http")
//       ? caseData.mediaUrl
//       : `${BASE_URL}${caseData.mediaUrl}`
//     : null;

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#f3f4f6",
//         fontFamily: "system-ui, sans-serif",
//       }}
//     >
//       <style>{`
//         @keyframes spin    { to { transform: rotate(360deg); } }
//         @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
//         @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         ::-webkit-scrollbar { width: 4px; }
//         ::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
//       `}</style>

//       {/* Status color bar */}
//       <div style={{ height: 3, background: sm.accent }} />

//       {/* Nav */}
//       <nav
//         style={{
//           position: "sticky",
//           top: 0,
//           zIndex: 100,
//           background: "rgba(255,255,255,0.92)",
//           backdropFilter: "blur(12px)",
//           borderBottom: "1px solid #e5e7eb",
//           padding: "0 32px",
//           display: "flex",
//           alignItems: "center",
//           height: 56,
//           gap: 16,
//         }}
//       >
//         <button
//           onClick={() => navigate(-1)}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 6,
//             background: "none",
//             border: "none",
//             cursor: "pointer",
//             fontSize: 13,
//             fontWeight: 600,
//             color: "#6b7280",
//             padding: "6px 10px",
//             borderRadius: 8,
//             transition: "all 0.15s",
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.background = "#f3f4f6";
//             e.currentTarget.style.color = "#111827";
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.background = "none";
//             e.currentTarget.style.color = "#6b7280";
//           }}
//         >
//           <ArrowLeft size={14} />
//           Back
//         </button>

//         <span style={{ color: "#e5e7eb" }}>|</span>

//         <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>
//           Case #{id}
//         </span>

//         <div
//           style={{
//             marginLeft: "auto",
//             display: "flex",
//             alignItems: "center",
//             gap: 10,
//           }}
//         >
//           {caseData.isDangerous && (
//             <Tag color="#dc2626" bg="#fef2f2">
//               <AlertTriangle size={10} style={{ marginRight: 4 }} />
//               High Risk
//             </Tag>
//           )}
//           <Tag color={sm.text} bg={sm.light}>
//             {sm.label}
//           </Tag>
//         </div>
//       </nav>

//       <main
//         style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 24px 80px" }}
//       >
//         {/* Page title */}
//         <div style={{ marginBottom: 28, animation: "fadeIn 0.3s ease" }}>
//           <p
//             style={{
//               fontSize: 11,
//               fontWeight: 600,
//               letterSpacing: "0.1em",
//               color: "#9ca3af",
//               textTransform: "uppercase",
//               marginBottom: 8,
//             }}
//           >
//             Missing Persons · Active Case
//           </p>
//           <h1
//             style={{
//               fontSize: "clamp(2rem, 5vw, 3.75rem)",
//               fontWeight: 800,
//               letterSpacing: "-0.025em",
//               color: "#111827",
//               lineHeight: 1,
//             }}
//           >
//             {fullName}
//           </h1>
//           <div
//             style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}
//           >
//             <Tag color={sm.text} bg={sm.light}>
//               {sm.label}
//             </Tag>
//             {caseData.priority && (
//               <Tag color="#374151" bg="#f9fafb">
//                 Priority {caseData.priority}
//               </Tag>
//             )}
//           </div>
//         </div>

//         {/* Grid */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "300px 1fr",
//             gap: 20,
//             alignItems: "start",
//           }}
//         >
//           {/* ── Left ── */}
//           <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//             {/* Photo */}
//             <Card>
//               <div
//                 style={{
//                   aspectRatio: "3/4",
//                   position: "relative",
//                   background: "#f9fafb",
//                   overflow: "hidden",
//                 }}
//               >
//                 {imageUrl ? (
//                   <img
//                     src={imageUrl}
//                     alt={fullName}
//                     loading="lazy"
//                     style={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                     }}
//                   />
//                 ) : (
//                   <div
//                     style={{
//                       width: "100%",
//                       height: "100%",
//                       display: "flex",
//                       flexDirection: "column",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       gap: 10,
//                     }}
//                   >
//                     <div
//                       style={{
//                         width: 72,
//                         height: 72,
//                         borderRadius: "50%",
//                         background: "#e5e7eb",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       <User size={32} color="#9ca3af" strokeWidth={1.5} />
//                     </div>
//                     <span
//                       style={{
//                         fontSize: 11,
//                         fontWeight: 600,
//                         color: "#9ca3af",
//                       }}
//                     >
//                       No photo on file
//                     </span>
//                   </div>
//                 )}

//                 {caseData.status === "resolved" && (
//                   <div
//                     style={{
//                       position: "absolute",
//                       inset: 0,
//                       background: "rgba(5,150,105,0.08)",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 8,
//                         background: "#059669",
//                         color: "#fff",
//                         padding: "8px 16px",
//                         borderRadius: 99,
//                         fontSize: 12,
//                         fontWeight: 700,
//                       }}
//                     >
//                       <ShieldCheck size={14} />
//                       Resolved
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </Card>

//             {/* Biometrics */}
//             <Card>
//               <CardSection style={{ paddingBottom: 16 }}>
//                 <Label>Biometrics</Label>
//               </CardSection>
//               <Divider />
//               <CardSection>
//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "1fr 1fr",
//                     gap: 10,
//                   }}
//                 >
//                   {[
//                     { label: "Age", value: caseData.age },
//                     { label: "Gender", value: caseData.gender },
//                     { label: "Height", value: caseData.height },
//                     { label: "Weight", value: caseData.weight },
//                   ].map(({ label, value }) => (
//                     <MetricBox
//                       key={label}
//                       label={label}
//                       value={value}
//                       accent={sm.accent}
//                     />
//                   ))}
//                 </div>
//               </CardSection>
//             </Card>

//             {/* Sightings */}
//             <Card>
//               <CardSection style={{ paddingBottom: 16 }}>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <div
//                     style={{ display: "flex", alignItems: "center", gap: 8 }}
//                   >
//                     <MessageSquare size={13} color={sm.accent} />
//                     <Label>Sighting Reports</Label>
//                   </div>
//                   <Tag color={sm.text} bg={sm.light}>
//                     {sightings.length}
//                   </Tag>
//                 </div>
//               </CardSection>
//               <Divider />
//               <CardSection>
//                 {sightingsLoading ? (
//                   <div
//                     style={{ display: "flex", flexDirection: "column", gap: 8 }}
//                   >
//                     {[1, 2, 3].map((i) => (
//                       <div
//                         key={i}
//                         style={{
//                           height: 84,
//                           borderRadius: 12,
//                           background:
//                             "linear-gradient(90deg, #f9fafb 25%, #f3f4f6 50%, #f9fafb 75%)",
//                           backgroundSize: "200% 100%",
//                           animation: "shimmer 1.4s infinite",
//                         }}
//                       />
//                     ))}
//                   </div>
//                 ) : sightings.length > 0 ? (
//                   <div
//                     style={{
//                       maxHeight: 460,
//                       overflowY: "auto",
//                       paddingRight: 4,
//                     }}
//                   >
//                     {sightings.map((r, i) => (
//                       <SightingCard key={r.id || r._id} report={r} index={i} />
//                     ))}
//                   </div>
//                 ) : (
//                   <div
//                     style={{
//                       padding: "28px 0",
//                       textAlign: "center",
//                       border: "1.5px dashed #e5e7eb",
//                       borderRadius: 12,
//                     }}
//                   >
//                     <AlertCircle
//                       size={22}
//                       color="#e5e7eb"
//                       style={{ margin: "0 auto 8px" }}
//                     />
//                     <p
//                       style={{
//                         fontSize: 12,
//                         fontWeight: 600,
//                         color: "#d1d5db",
//                       }}
//                     >
//                       No sightings on file
//                     </p>
//                   </div>
//                 )}
//               </CardSection>
//             </Card>
//           </div>

//           {/* ── Right ── */}
//           <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//             <StatusPanel
//               currentStatus={caseData.status}
//               updating={updating}
//               onStatusChange={handleStatusChange}
//             />

//             {/* Intel grid */}
//             <Card>
//               <CardSection style={{ paddingBottom: 16 }}>
//                 <Label>Case Intelligence</Label>
//               </CardSection>
//               <Divider />
//               <CardSection>
//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "1fr 1fr",
//                     gap: "20px 32px",
//                   }}
//                 >
//                   {[
//                     {
//                       icon: MapPin,
//                       label: "Last Known Location",
//                       value: location,
//                     },
//                     {
//                       icon: Calendar,
//                       label: "Last Seen Date",
//                       value: fmt(caseData.lastSeenDate),
//                     },
//                     {
//                       icon: Phone,
//                       label: "Contact Information",
//                       value: contact,
//                     },
//                     {
//                       icon: Clock,
//                       label: "Report Date",
//                       value: fmt(caseData.createdAt),
//                     },
//                   ].map(({ icon: Icon, label, value }) => (
//                     <div key={label}>
//                       <div
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 6,
//                           marginBottom: 4,
//                         }}
//                       >
//                         <Icon size={11} color="#9ca3af" />
//                         <Label>{label}</Label>
//                       </div>
//                       <Value>{value}</Value>
//                     </div>
//                   ))}
//                 </div>
//               </CardSection>
//             </Card>

//             {/* Distinctive features */}
//             {features && (
//               <Card style={{ borderLeft: `3px solid ${sm.accent}` }}>
//                 <CardSection>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 8,
//                       marginBottom: 10,
//                     }}
//                   >
//                     <Ruler size={13} color={sm.accent} />
//                     <Label>Distinctive Features</Label>
//                   </div>
//                   <p
//                     style={{
//                       fontSize: 14,
//                       fontWeight: 500,
//                       color: "#374151",
//                       lineHeight: 1.7,
//                     }}
//                   >
//                     {features}
//                   </p>
//                 </CardSection>
//               </Card>
//             )}

//             {/* Narrative */}
//             {desc && (
//               <Card>
//                 <CardSection>
//                   <Label>Case Narrative</Label>
//                   <blockquote
//                     style={{
//                       marginTop: 12,
//                       paddingLeft: 16,
//                       borderLeft: `3px solid ${sm.mid}`,
//                     }}
//                   >
//                     <p
//                       style={{
//                         fontSize: 15,
//                         color: "#4b5563",
//                         lineHeight: 1.8,
//                         fontStyle: "italic",
//                         fontWeight: 400,
//                       }}
//                     >
//                       {desc}
//                     </p>
//                   </blockquote>
//                 </CardSection>
//               </Card>
//             )}

//             {/* Footer strip */}
//             <div
//               style={{
//                 padding: "14px 20px",
//                 background: "#fff",
//                 borderRadius: 12,
//                 border: "1px solid #f3f4f6",
//                 display: "flex",
//                 flexWrap: "wrap",
//                 gap: "8px 28px",
//                 alignItems: "center",
//               }}
//             >
//               {[
//                 {
//                   label: "File ID",
//                   value: `CAS-${String(id).padStart(6, "0")}`,
//                 },
//                 { label: "Unit", value: "Missing Persons Bureau" },
//                 { label: "Clearance", value: "Authorized Personnel" },
//               ].map(({ label, value }) => (
//                 <div key={label} style={{ display: "flex", gap: 6 }}>
//                   <span
//                     style={{ fontSize: 10, fontWeight: 600, color: "#d1d5db" }}
//                   >
//                     {label}:
//                   </span>
//                   <span
//                     style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}
//                   >
//                     {value}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default CaseDetailPage;

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User,
  MessageSquare,
  RefreshCcw,
  AlertCircle,
  Clock,
  Calendar,
  Phone,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Hourglass,
  ShieldCheck,
  Eye,
} from "lucide-react";
import axios from "axios";

const BASE_URL = "https://bahirlink-backend-1.onrender.com";

const API_ENDPOINTS = {
  caseDetail: (id) => `${BASE_URL}/api/cases/${id}`,
  caseStatus: (id) => `${BASE_URL}/api/cases/${id}/status`,
  sightings: (id) => `${BASE_URL}/api/caseReports/case/${id}?lang=en`,
};

const STATUS_OPTIONS = ["pending", "approved", "rejected", "resolved"];

const STATUS_META = {
  resolved: {
    accent: "#059669",
    light: "#ecfdf5",
    mid: "#a7f3d0",
    text: "#065f46",
    label: "Resolved",
  },
  approved: {
    accent: "#2563eb",
    light: "#eff6ff",
    mid: "#bfdbfe",
    text: "#1e3a8a",
    label: "Approved",
  },
  rejected: {
    accent: "#dc2626",
    light: "#fef2f2",
    mid: "#fecaca",
    text: "#7f1d1d",
    label: "Rejected",
  },
  pending: {
    accent: "#d97706",
    light: "#fffbeb",
    mid: "#fde68a",
    text: "#78350f",
    label: "Pending",
  },
};

const SIGHTING_META = {
  verified: {
    accent: "#059669",
    bg: "#ecfdf5",
    icon: CheckCircle2,
    label: "Verified",
  },
  rejected: {
    accent: "#dc2626",
    bg: "#fef2f2",
    icon: XCircle,
    label: "Rejected",
  },
  pending: {
    accent: "#9ca3af",
    bg: "#f9fafb",
    icon: Hourglass,
    label: "Pending",
  },
};

const cleanStr = (v, lang = "en") => {
  if (v == null) return "";

  if (typeof v === "string") {
    const t = v.trim();
    if (t.startsWith("{")) {
      try {
        return cleanStr(JSON.parse(t), lang);
      } catch (_) {}
    }
    return t;
  }

  if (typeof v === "object") {
    if (v.name !== undefined) return cleanStr(v.name, lang);
    if (v[lang]) return String(v[lang]).trim();
    if (v.en) return String(v.en).trim();
    if (v.am) return String(v.am).trim();
    const first = Object.values(v).find(
      (x) => typeof x === "string" && x.trim(),
    );
    return first ? first.trim() : "";
  }

  return String(v).trim();
};

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const Tag = ({ children, color = "#2563eb", bg = "#eff6ff" }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 12px",
      borderRadius: 99,
      background: bg,
      color,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
      fontFamily: "system-ui, sans-serif",
    }}
  >
    {children}
  </span>
);

const Label = ({ children }) => (
  <p
    style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#9ca3af",
      marginBottom: 4,
      fontFamily: "system-ui, sans-serif",
    }}
  >
    {children}
  </p>
);

const Value = ({ children, large }) => (
  <p
    style={{
      fontSize: large ? 15 : 14,
      fontWeight: 600,
      color: "#111827",
      lineHeight: 1.5,
      fontFamily: "system-ui, sans-serif",
    }}
  >
    {children || "—"}
  </p>
);

const Divider = () => (
  <div style={{ height: 1, background: "#f3f4f6", margin: "0 -24px" }} />
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #f3f4f6",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const CardSection = ({ children, style = {} }) => (
  <div style={{ padding: "20px 24px", ...style }}>{children}</div>
);

const MetricBox = ({ label, value, accent }) => (
  <div
    style={{
      padding: "16px 18px",
      background: "#fafafa",
      borderRadius: 12,
      border: "1px solid #f3f4f6",
    }}
  >
    <Label>{label}</Label>
    <p
      style={{
        fontSize: 20,
        fontWeight: 800,
        color: accent || "#111827",
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.2,
      }}
    >
      {value || "—"}
    </p>
  </div>
);

const SightingCard = React.memo(({ report, index }) => {
  const rawStatus = report.status
    ? String(report.status).toLowerCase().trim()
    : "pending";
  const meta = SIGHTING_META[rawStatus] || SIGHTING_META.pending;
  const Icon = meta.icon;

  // Extract relational kebele information correctly
  const locationString =
    report.kebele?.name || report.location || "Location unknown";
  const reporterPhone = cleanStr(report.phoneNumber);

  return (
    <div
      style={{
        padding: "16px",
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #f3f4f6",
        borderLeft: `3px solid ${meta.accent}`,
        marginBottom: 8,
        animation: `fadeUp 0.25s ease forwards`,
        animationDelay: `${index * 0.04}s`,
        opacity: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#6b7280",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {fmt(report.spottedAt || report.createdAt)}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: meta.accent,
            background: meta.bg,
            padding: "2px 8px",
            borderRadius: 99,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {Icon && <Icon size={9} />}
          {meta.label}
        </span>
      </div>
      <p
        style={{
          fontSize: 13,
          color: "#374151",
          lineHeight: 1.6,
          marginBottom: 10,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {cleanStr(report.description) || "No description provided."}
      </p>

      {/* Meta Row: Location and Phone details */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          borderTop: "1px dashed #f3f4f6",
          paddingTop: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={10} color="#9ca3af" />
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#6b7280",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {cleanStr(locationString)}
          </span>
        </div>

        {/* 💡 Renders reporter's custom verification phone number link if payload attribute exists */}
        {reporterPhone && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Phone size={10} color="#9ca3af" />
            <a
              href={`tel:${reporterPhone}`}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#2563eb",
                textDecoration: "none",
                fontFamily: "system-ui, sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = "none")
              }
            >
              {reporterPhone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
});
SightingCard.displayName = "SightingCard";

const StatusPanel = React.memo(
  ({ currentStatus, updating, onStatusChange }) => (
    <Card>
      <CardSection>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <RefreshCcw
            size={13}
            color="#9ca3af"
            style={{ animation: updating ? "spin 1s linear infinite" : "none" }}
          />
          <Label>Update Case Status</Label>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
          }}
        >
          {STATUS_OPTIONS.map((s) => {
            const meta = STATUS_META[s] ?? STATUS_META.pending;
            const isActive = currentStatus === s;
            return (
              <button
                key={s}
                disabled={updating || isActive}
                onClick={() => onStatusChange(s)}
                style={{
                  padding: "10px 8px",
                  borderRadius: 10,
                  border: `1.5px solid ${isActive ? meta.accent : "#e5e7eb"}`,
                  background: isActive ? meta.light : "#fff",
                  color: isActive ? meta.accent : "#6b7280",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  cursor: isActive || updating ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "system-ui, sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !updating) {
                    e.currentTarget.style.borderColor = meta.accent;
                    e.currentTarget.style.color = meta.accent;
                    e.currentTarget.style.background = meta.light;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.color = "#6b7280";
                    e.currentTarget.style.background = "#fff";
                  }
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </CardSection>
    </Card>
  ),
);
StatusPanel.displayName = "StatusPanel";

const LoadingScreen = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "#f9fafb",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
    }}
  >
    <div style={{ position: "relative", width: 52, height: 52 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2.5px solid #e5e7eb",
          borderTop: "2.5px solid #2563eb",
          animation: "spin 0.9s linear infinite",
        }}
      />
      <Eye
        size={16}
        color="#2563eb"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
    </div>
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.15em",
        color: "#9ca3af",
        textTransform: "uppercase",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      Loading case file…
    </p>
  </div>
);

const CaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sightingsLoading, setSightingsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchCaseDetail = useCallback(
    async (signal) => {
      try {
        const res = await axios.get(API_ENDPOINTS.caseDetail(id), { signal });
        setCaseData(res.data?.data ?? res.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError("Failed to load case details.");
      }
    },
    [id],
  );

  const fetchSightings = useCallback(
    async (signal) => {
      setSightingsLoading(true);
      try {
        const res = await axios.get(API_ENDPOINTS.sightings(id), { signal });
        const payload = res.data?.data ?? res.data;
        setSightings(Array.isArray(payload) ? payload : []);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setSightings([]);
      } finally {
        setSightingsLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchCaseDetail(ctrl.signal),
        fetchSightings(ctrl.signal),
      ]);
      setLoading(false);
    };
    load();
    return () => ctrl.abort();
  }, [fetchCaseDetail, fetchSightings]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === caseData?.status) return;
    setUpdating(true);
    try {
      await axios.put(API_ENDPOINTS.caseStatus(id), { status: newStatus });
      await fetchCaseDetail();
    } catch {
      alert("Status update failed. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (error || !caseData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f9fafb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#fef2f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertCircle size={24} color="#dc2626" />
        </div>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#111827",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {error || "Case not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#2563eb",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          ← Go back
        </button>
      </div>
    );
  }

  const sm = STATUS_META[caseData.status] ?? STATUS_META.pending;
  const fullName = cleanStr(caseData.fullName) || "Unknown Subject";
  const desc = cleanStr(caseData.description);
  const features = cleanStr(caseData.distinctiveFeatures);
  const location = cleanStr(caseData.lastSeenLocation || caseData.location);
  const contact = cleanStr(caseData.contactInfo);
  const imageUrl = caseData.mediaUrl
    ? caseData.mediaUrl.startsWith("http")
      ? caseData.mediaUrl
      : `${BASE_URL}${caseData.mediaUrl}`
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>

      {/* Status color bar */}
      <div style={{ height: 3, background: sm.accent }} />

      {/* Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          height: 56,
          gap: 16,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: "#6b7280",
            padding: "6px 10px",
            borderRadius: 8,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f3f4f6";
            e.currentTarget.style.color = "#111827";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <span style={{ color: "#e5e7eb" }}>|</span>

        <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>
          Case #{id}
        </span>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {caseData.isDangerous && (
            <Tag color="#dc2626" bg="#fef2f2">
              <AlertTriangle size={10} style={{ marginRight: 4 }} />
              High Risk
            </Tag>
          )}
          <Tag color={sm.text} bg={sm.light}>
            {sm.label}
          </Tag>
        </div>
      </nav>

      <main
        style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 24px 80px" }}
      >
        {/* Page title */}
        <div style={{ marginBottom: 28, animation: "fadeIn 0.3s ease" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#9ca3af",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Missing Persons · Active Case
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#111827",
              lineHeight: 1,
            }}
          >
            {fullName}
          </h1>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}
          >
            <Tag color={sm.text} bg={sm.light}>
              {sm.label}
            </Tag>
            {caseData.priority && (
              <Tag color="#374151" bg="#f9fafb">
                Priority {caseData.priority}
              </Tag>
            )}
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* ── Left ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Photo */}
            <Card>
              <div
                style={{
                  aspectRatio: "3/4",
                  position: "relative",
                  background: "#f9fafb",
                  overflow: "hidden",
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={fullName}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <User size={32} color="#9ca3af" strokeWidth={1.5} />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#9ca3af",
                      }}
                    >
                      No photo on file
                    </span>
                  </div>
                )}

                {caseData.status === "resolved" && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(5,150,105,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#059669",
                        color: "#fff",
                        padding: "8px 16px",
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <ShieldCheck size={14} />
                      Resolved
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Biometrics */}
            <Card>
              <CardSection style={{ paddingBottom: 16 }}>
                <Label>Biometrics</Label>
              </CardSection>
              <Divider />
              <CardSection>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {[
                    { label: "Age", value: caseData.age },
                    { label: "Gender", value: caseData.gender },
                    { label: "Height", value: caseData.height },
                    { label: "Weight", value: caseData.weight },
                  ].map(({ label, value }) => (
                    <MetricBox
                      key={label}
                      label={label}
                      value={value}
                      accent={sm.accent}
                    />
                  ))}
                </div>
              </CardSection>
            </Card>

            {/* Sightings */}
            <Card>
              <CardSection style={{ paddingBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <MessageSquare size={13} color={sm.accent} />
                    <Label>Sighting Reports</Label>
                  </div>
                  <Tag color={sm.text} bg={sm.light}>
                    {sightings.length}
                  </Tag>
                </div>
              </CardSection>
              <Divider />
              <CardSection>
                {sightingsLoading ? (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          height: 84,
                          borderRadius: 12,
                          background:
                            "linear-gradient(90deg, #f9fafb 25%, #f3f4f6 50%, #f9fafb 75%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.4s infinite",
                        }}
                      />
                    ))}
                  </div>
                ) : sightings.length > 0 ? (
                  <div
                    style={{
                      maxHeight: 460,
                      overflowY: "auto",
                      paddingRight: 4,
                    }}
                  >
                    {sightings.map((r, i) => (
                      <SightingCard
                        key={r.id || `sighting-${i}`}
                        report={r}
                        index={i}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "28px 0",
                      textAlign: "center",
                      border: "1.5px dashed #e5e7eb",
                      borderRadius: 12,
                    }}
                  >
                    <AlertCircle
                      size={22}
                      color="#e5e7eb"
                      style={{ margin: "0 auto 8px" }}
                    />
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#d1d5db",
                      }}
                    >
                      No sightings on file
                    </p>
                  </div>
                )}
              </CardSection>
            </Card>
          </div>

          {/* ── Right ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StatusPanel
              currentStatus={caseData.status}
              updating={updating}
              onStatusChange={handleStatusChange}
            />

            {/* Intel grid */}
            <Card>
              <CardSection style={{ paddingBottom: 16 }}>
                <Label>Case Intelligence</Label>
              </CardSection>
              <Divider />
              <CardSection>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px 32px",
                  }}
                >
                  {[
                    {
                      icon: MapPin,
                      label: "Last Known Location",
                      value: location,
                    },
                    {
                      icon: Calendar,
                      label: "Last Seen Date",
                      value: fmt(caseData.lastSeenDate),
                    },
                    {
                      icon: Phone,
                      label: "Contact Information",
                      value: contact,
                    },
                    {
                      icon: Clock,
                      label: "Report Date",
                      value: fmt(caseData.createdAt),
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 4,
                        }}
                      >
                        <Icon size={11} color="#9ca3af" />
                        <Label>{label}</Label>
                      </div>
                      <Value>{value}</Value>
                    </div>
                  ))}
                </div>
              </CardSection>
            </Card>

            {/* Distinctive features */}
            {features && (
              <Card style={{ borderLeft: `3px solid ${sm.accent}` }}>
                <CardSection>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <Ruler size={13} color={sm.accent} />
                    <Label>Distinctive Features</Label>
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                      lineHeight: 1.7,
                    }}
                  >
                    {features}
                  </p>
                </CardSection>
              </Card>
            )}

            {/* Narrative */}
            {desc && (
              <Card>
                <CardSection>
                  <Label>Case Narrative</Label>
                  <blockquote
                    style={{
                      marginTop: 12,
                      paddingLeft: 16,
                      borderLeft: `3px solid ${sm.mid}`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 15,
                        color: "#4b5563",
                        lineHeight: 1.8,
                        fontStyle: "italic",
                        fontWeight: 400,
                      }}
                    >
                      {desc}
                    </p>
                  </blockquote>
                </CardSection>
              </Card>
            )}

            {/* Footer strip */}
            <div
              style={{
                padding: "14px 20px",
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #f3f4f6",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 28px",
                alignItems: "center",
              }}
            >
              {[
                {
                  label: "File ID",
                  value: `CAS-${String(id).padStart(6, "0")}`,
                },
                { label: "Unit", value: "Missing Persons Bureau" },
                { label: "Clearance", value: "Authorized Personnel" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", gap: 6 }}>
                  <span
                    style={{ fontSize: 10, fontWeight: 600, color: "#d1d5db" }}
                  >
                    {label}:
                  </span>
                  <span
                    style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseDetailPage;
