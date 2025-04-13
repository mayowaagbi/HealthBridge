import { Navigate, Outlet } from "react-router-dom";
import { useGlobalState } from "../context/GlobalState";

interface RouteGuardProps {
  allowedRoles: string[];
}

export default function RouteGuard({ allowedRoles }: RouteGuardProps) {
  const { user } = useGlobalState(); // Assuming user data is stored in GlobalState

  // Check if the user's role is allowed
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />; // Redirect to login if not authorized
  }

  return <Outlet />; // Render the child routes if authorized
}
