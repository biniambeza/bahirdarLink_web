import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const panelVariants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
};

// Image Viewer
const ImageViewer = ({ src, onClose }) => (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
    onClick={onClose}
  >
    <img
      src={src}
      alt="enlarged"
      className="max-h-[90%] max-w-[90%] object-contain rounded-lg shadow-lg"
    />
  </div>
);

// Reusable Detail Item
const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-gray-800 font-medium">{value}</p>
  </div>
);

const IncidentDetails = ({ incident, onClose, categories }) => {
  const [reporter, setReporter] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const navigate = useNavigate();

  // Fetch reporter if registered user
  useEffect(() => {
    const fetchReporter = async () => {
      try {
        if (!incident?.citizenId) return;

        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:5000/api/users/${incident.citizenId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setReporter(res.data.user);
      } catch (error) {
        console.error("Failed to fetch reporter:", error);
      }
    };

    fetchReporter();
  }, [incident]);

  if (!incident) return null;

  // Reporter logic
  const isRegisteredUser = Boolean(incident.citizenId);
  const isGuest = Boolean(incident.guestId);

  // Location
  const locationStr =
    [incident.kebele, incident.subdivision, incident.street]
      .filter(Boolean)
      .join(", ") || "N/A";

  // Media
  const mediaSrc = incident.mediaUrl
    ? `http://localhost:5000${incident.mediaUrl}`
    : null;

  // Status style
  const getStatusStyle = (status) => {
    switch (status) {
      case "reported":
        return "bg-red-100 text-red-700";
      case "assigned":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <motion.div
        className="fixed top-0 right-0 h-full w-1/2 bg-white shadow-2xl z-50 overflow-y-auto rounded-l-3xl flex flex-col"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Incident Details</h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 text-3xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-4 bg-gray-50 p-5 rounded-xl shadow-sm">
              <DetailItem
                label="Emergency Type"
                value={incident.emergencyType?.name || "Unknown"}
              />

              <DetailItem
                label="Category"
                value={categories[incident.categoryId] || "Unknown"}
              />

              <DetailItem
                label="Status"
                value={
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                      incident.status,
                    )}`}
                  >
                    {incident.status.replace("_", " ")}
                  </span>
                }
              />

              <DetailItem label="Time" value={incident.time || "N/A"} />

              {/* Reported By */}
              <div>
                <p className="text-gray-500 text-sm">Reported By</p>

                <div className="flex items-center gap-3">
                  {/* Reporter Name */}
                  <p className="text-gray-800 font-medium">
                    {isGuest
                      ? "Guest"
                      : reporter
                        ? `${reporter.fullName} (${reporter.email})`
                        : "Registered User"}
                  </p>

                  {/* View Profile Link */}
                  {isRegisteredUser && reporter && (
                    <span
                      onClick={() => navigate(`/users/${reporter._id}`)}
                      className="text-blue-600 text-sm hover:underline cursor-pointer"
                    >
                      View Profile
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4 bg-gray-50 p-5 rounded-xl shadow-sm">
              <DetailItem label="Location" value={locationStr} />

              {incident.location?.latitude && incident.location?.longitude && (
                <p className="text-gray-500 text-xs">
                  Lat: {incident.location.latitude} , Lng:{" "}
                  {incident.location.longitude}
                </p>
              )}

              <DetailItem
                label="Created At"
                value={new Date(incident.createdAt).toLocaleString()}
              />

              <DetailItem
                label="Updated At"
                value={new Date(incident.updatedAt).toLocaleString()}
              />
            </div>
          </div>

          {/* Media Section */}
          {mediaSrc && (
            <div>
              <p className="text-gray-500 text-sm mb-2">Media</p>

              {incident.mediaType === "photo" ? (
                <img
                  src={mediaSrc}
                  alt="media"
                  onClick={() => setShowImage(true)}
                  className="w-full max-h-80 object-cover rounded-xl shadow-lg border cursor-pointer hover:scale-105 transition"
                />
              ) : (
                <video
                  src={mediaSrc}
                  controls
                  className="w-full max-h-80 object-cover rounded-xl shadow-lg border"
                />
              )}
            </div>
          )}
        </div>

        {/* Image Viewer */}
        {showImage && (
          <ImageViewer src={mediaSrc} onClose={() => setShowImage(false)} />
        )}
      </motion.div>
    </>
  );
};

export default IncidentDetails;
