import React, { useContext, createContext } from "react";
import { AmbulanceRequestContext } from "../context/AmbulanceRequestContext";

// Define the type for an ambulance request
interface AmbulanceRequest {
  id: string;
  userId: string;
  address: string;
  status: string;
}

interface AmbulanceRequestContextType {
  ambulanceRequests: AmbulanceRequest[];
}

// export const LocalAmbulanceRequestContext = createContext<AmbulanceRequestContextType | undefined>(undefined);
export const LocalAmbulanceRequestContext =
  createContext<AmbulanceRequestContextType>({
    ambulanceRequests: [],
  });

export default function HealthcareProviderDashboard() {
  // Use the context to get ambulance requests
  const { ambulanceRequests } = useContext(LocalAmbulanceRequestContext);

  return (
    <div>
      <h1>Healthcare Provider Dashboard</h1>
      <h2>Ambulance Requests</h2>
      <ul>
        {ambulanceRequests.map((request: AmbulanceRequest) => (
          <li key={request.id}>
            <strong>Student ID:</strong> {request.userId} |{" "}
            <strong>Location:</strong> {request.address}
          </li>
        ))}
      </ul>
    </div>
  );
}
