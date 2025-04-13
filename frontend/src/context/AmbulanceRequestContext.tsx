// src/context/AmbulanceRequestContext.tsx
import React, { createContext, useContext, useState } from "react";

interface AmbulanceRequest {
  id: string;
  userId: string;
  address: string;
  status: string;
}

interface AmbulanceRequestContextType {
  ambulanceRequests: AmbulanceRequest[];
  setAmbulanceRequests: React.Dispatch<
    React.SetStateAction<AmbulanceRequest[]>
  >;
}

const AmbulanceRequestContext = createContext<AmbulanceRequestContextType>({
  ambulanceRequests: [],
  setAmbulanceRequests: () => {},
});

export const AmbulanceRequestProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [ambulanceRequests, setAmbulanceRequests] = useState<
    AmbulanceRequest[]
  >([]);

  return (
    <AmbulanceRequestContext.Provider
      value={{ ambulanceRequests, setAmbulanceRequests }}
    >
      {children}
    </AmbulanceRequestContext.Provider>
  );
};

export const useAmbulanceRequestContext = () =>
  useContext(AmbulanceRequestContext);
