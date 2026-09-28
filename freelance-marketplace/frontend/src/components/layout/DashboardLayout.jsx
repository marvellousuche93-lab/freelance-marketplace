/**
 * DashboardLayout — sidebar + topbar shell for authenticated pages.
 *
 * Behavior:
 *   - ≥ 1024px (lg):  full sidebar w-60 (240px)
 *   - 768–1023px (md): sidebar w-56 (224px)
 *   - < 768px:        sidebar becomes a slide-in drawer
 *
 * The sidebar starts with a "Home" link back to the public site.
 */

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Briefcase,
  FileText,
  Heart,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  Settings,
  User,
  X,
} from "lucide-react";

import LogoMark from "../brand/LogoMark";
import ThemeToggle from "../ui/ThemeToggle";
import NotificationsBell from "../notifications/NotificationsBell";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";

const SHARED_ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const FREELANCER_ITEMS = [
  { to: "/dashboard/applications", label: "My Applications", icon: FileText },
  { to: "/dashboard/portfolio", label: "My Portfolio", icon: LayoutGrid },
  { to: "/dashboard/saved-jobs", label: "Saved Jobs", icon: Heart },
];

const EMPLOYER_ITEMS = [
  { to: "/dashboard/jobs", label: "My Jobs", icon: Briefcase },
  { to: "/dashboard/jobs/new", label: "Post a Job", icon: PlusCircle },
  { to: "/dashboard/applications", label: "Applications", icon: FileText },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useFocusTrap(drawerRef, drawerOpen);

  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const roleItems =
    user?.role === "FREELANCER"
      ? FREELANCER_ITEMS
      : user?.role === "EMPLOYER"
      ? EMPLOYER_ITEMS
      : [];

  function handleLogout() {
    logout();
    navigate("/");
  }

  const initial = (user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase();

  return (
    <div className="min-h-dvh flex">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 lg:w-60 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <SidebarHeader />
        <SidebarNav roleItems={roleItems} userRole={user?.role} />
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="relative h-dvh w-72 max-w-[85vw] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col pt-safe pb-safe animate-[slide-in_0.2s_ease-out]"
          >
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <Link to="/" className="inline-flex items-center gap-2">
                <LogoMark size={28} />
                <span className="font-semibold">Marketplace</span>
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarNav roleItems={roleItems} userRole={user?.role} />
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur px-3 sm:px-4 sticky top-0 z-20 pt-safe">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              aria-expanded={drawerOpen}
              aria-controls="dashboard-drawer"
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 shrink-0"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="shrink-0">
                <LogoMark size={28} />
              </div>
              <span className="font-semibold tracking-tight text-[13px] sm:text-sm truncate">
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden sm:inline">
                  {user?.role === "FREELANCER" ? "Freelancer" : "Employer"} Dashboard
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <NotificationsBell />
            <ThemeToggle />
            <Link
              to="/dashboard/settings"
              className="inline-flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-brand-500 text-white text-xs font-bold shrink-0"
              title={user?.username}
              aria-label="Account settings"
            >
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                initial
              )}
            </Link>
          </div>
        </header>

        <main
          id="main"
          className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 contain-x"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SidebarHeader() {
  return (
    <div className="h-14 flex items-center gap-2 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
      <Link to="/" className="inline-flex items-center gap-2">
        <LogoMark size={32} />
        <span className="font-semibold">Marketplace</span>
      </Link>
    </div>
  );
}

function SidebarNav({ roleItems, userRole }) {
  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Dashboard">
      <SectionLabel>General</SectionLabel>
      {SHARED_ITEMS.map((item) => (
        <SidebarLink key={item.to} {...item} />
      ))}

      {roleItems.length > 0 ? (
        <>
          <SectionLabel className="mt-4">
            {userRole === "FREELANCER" ? "Freelancing" : "Hiring"}
          </SectionLabel>
          {roleItems.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </>
      ) : null}
    </nav>
  );
}

function SectionLabel({ children, className = "" }) {
  return (
    <p
      className={cn(
        "px-3 pt-3 pb-1 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500",
        className
      )}
    >
      {children}
    </p>
  );
}

function SidebarLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-3 py-2.5 md:py-2 rounded-lg text-sm transition-colors",
          isActive
            ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        )
      }
    >
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  );
}