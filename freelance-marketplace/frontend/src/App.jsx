/**
 * App — mounts the router, top progress bar, route announcer, and toast.
 */

import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AppRoutes from "./routes/AppRoutes";
import RouteProgress from "./components/loaders/RouteProgress";
import RouteAnnouncer from "./components/a11y/RouteAnnouncer";

export default function App() {
  return (
    <BrowserRouter>
      <RouteProgress />
      <RouteAnnouncer />
      <AppRoutes />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "rgb(15 23 42)",
            color: "rgb(226 232 240)",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#ffffff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#ffffff" } },
        }}
      />
    </BrowserRouter>
  );
}