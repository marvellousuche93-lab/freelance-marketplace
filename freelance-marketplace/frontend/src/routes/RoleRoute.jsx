/**
 * RoleRoute — require a specific user role.
 *
 * Usage:
 *   <Route element={<RoleRoute role="FREELANCER" />}> ... </Route>
 *   <Route element={<RoleRoute role="EMPLOYER" />}> ... </Route>
 *
 * Assumes it's nested under ProtectedRoute (user is guaranteed non-null).
 */

import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}