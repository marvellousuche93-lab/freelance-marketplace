/**
 * ProtectedRoute — require an authenticated user.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import BrandedLoader from "../components/loaders/BrandedLoader";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <BrandedLoader
        label="Checking your session"
        sublabel="This will only take a moment."
      />
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
}