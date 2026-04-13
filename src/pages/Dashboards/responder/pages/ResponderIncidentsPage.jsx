import { jwtDecode } from "jwt-decode";

import React, { useEffect, useState } from "react";
import axios from "axios";

const ResponderIncidentsPage = () => {
  const [emergencies, setEmergencies] = useState([]);

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const token = localStorage.getItem("responderToken");
        if (!token) return;

        const decoded = jwtDecode(token);
        const responderTeamId = decoded.id;

        const response = await axios.get(
          `http://localhost:5000/api/emergencies/responder-team/${responderTeamId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setEmergencies(response.data.data);
      } catch (err) {
        console.error("Error fetching emergencies:", err);
      }
    };

    fetchEmergencies();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Responder Dashboard</h1>
      {emergencies.length === 0 ? (
        <p>No emergencies assigned yet.</p>
      ) : (
        <ul>
          {emergencies.map((e) => (
            <li key={e.id}>
              <strong>{e.emergencyType?.name || "Unknown Type"}</strong> -{" "}
              {e.kebele}, {e.subdivision} - Status: {e.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResponderIncidentsPage;
