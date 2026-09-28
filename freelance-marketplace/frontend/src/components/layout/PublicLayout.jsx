/**
 * PublicLayout — navbar + footer shell for public pages.
 *
 * Behavior:
 *   - ≥ 768px (md): full middle nav visible.
 *   - < 768px:     middle nav hidden; hamburger toggles it below the
 *                  header. The logo + wordmark are always visible.
 *
 * Accessibility:
 *   - Skip-to-content link.
 *   - aria-expanded / aria-controls on the hamburger.
 *   - Safe-area padding for notched devices.
 */

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";

import Logo from "../brand/Logo";
import LogoMark from "../brand/LogoMark";
import ThemeToggle from "../ui/ThemeToggle";
import NotificationsBell from "../notifications/NotificationsBell";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/jobs", label: "Find Jobs" },
  { to: "/freelancers", label: "Find Freelancers" },
];

const footerColumns = [
  {
    title: "Product",
    links: [
      { to: "/jobs", label: "Browse jobs" },
      { to: "/freelancers", label: "Browse freelancers" },
      { to: "/register", label: "Create an account" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/terms", label: "Terms of Service" },
      { to: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate("/");
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-950/85 backdrop-blur border-b border-slate-200 dark:border-slate-800 pt-safe">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-3">
          <Logo size={32} compact />

          <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Main">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-1.5 rounded-md transition-colors",
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {user ? <NotificationsBell /> : null}
            <ThemeToggle />

            {user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex h-10 px-3 items-center rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex h-10 px-3 items-center rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700"
                >
                  Sign up
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 focus-ring shrink-0"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div
            id="mobile-nav"
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 animate-fade-in"
          >
            <nav className="max-w-6xl mx-auto px-3 py-3 space-y-0.5" aria-label="Mobile">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      "block px-3 py-2.5 rounded-lg text-sm",
                      isActive
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {!user ? (
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              ) : (
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="block px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Log out
                  </button>
                </div>
              )}
            </nav>
          </div>
        ) : null}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 sm:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2">
                <LogoMark size={32} />
                <span className="font-semibold">Marketplace</span>
              </Link>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Find great work. Hire great people.
              </p>
            </div>

            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold mb-3">{col.title}</h3>
                <ul className="space-y-2">
                  {col.cols ? null : null}
                  {col.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
            <p>© {new Date().getFullYear()} Freelance Marketplace</p>
            <p className="text-center sm:text-right">
              Built for freelancers and employers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = (user.first_name?.[0] || user.username?.[0] || "U").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-10 pl-1 pr-1.5 sm:pr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus-ring"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {user.profile_picture ? (
          <img
            src={user.profile_picture}
            alt=""
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold">
            {initial}
          </span>
        )}
        <ChevronDown size={14} className="text-slate-500 hidden sm:inline" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden animate-fade-in"
        >
          <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium truncate">{user.username}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.role}
            </p>
          </div>
          <MenuLink to="/dashboard" icon={LayoutDashboard} onClick={() => setOpen(false)}>
            Dashboard
          </MenuLink>
          <MenuLink to="/dashboard/settings" icon={User} onClick={() => setOpen(false)}>
            Settings
          </MenuLink>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({ to, icon: Icon, children, onClick }) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <Icon size={14} />
      {children}
    </Link>
  );
}