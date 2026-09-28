/**
 * SettingsPage — account, notifications, appearance, and account actions.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  LogOut,
  Mail,
  Palette,
  Shield,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Toggle from "../../components/ui/Toggle";
import PageHeader from "../../components/dashboard/PageHeader";
import ChangeEmailModal from "../../components/auth/ChangeEmailModal";
import ChangePasswordModal from "../../components/auth/ChangePasswordModal";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import useLocalStorage from "../../hooks/useLocalStorage";
import { cn } from "../../utils/cn";

const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [notifs, setNotifs] = useLocalStorage("fm_notifications", {
    newApplication: true,
    applicationAccepted: true,
    applicationRejected: true,
    newMessage: true,
    newReview: true,
  });

  function updateNotif(key) {
    return (value) => {
      setNotifs((prev) => ({ ...prev, [key]: value }));
      toast.success(value ? "Enabled" : "Disabled");
    };
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences."
      />

      {/* Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={18} className="text-brand-600" />
            <h2 className="font-semibold">Account</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <Row label="Username" value={user?.username} />
          <Row label="Email" value={user?.email} />
          <Row label="Role" value={user?.role} />

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/dashboard/profile/edit"
              className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline"
            >
              <User size={14} /> Edit profile, avatar, and bio
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Change email</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                We'll send a confirmation link to the new address. Your email
                doesn't change until you click it.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmailModalOpen(true)}
              >
                <Mail size={14} /> Change email
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Change password</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                You'll need your current password. We'll email you a
                confirmation once it's changed.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPasswordModalOpen(true)}
              >
                <Shield size={14} /> Change password
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-brand-600" />
            <h2 className="font-semibold">Notifications</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose which events create an in-app notification.
          </p>
        </CardHeader>
        <CardBody className="pt-0 divide-y divide-slate-100 dark:divide-slate-800">
          <Toggle
            id="notif-new-application"
            label="New application"
            description="When a freelancer applies to one of your jobs."
            checked={notifs.newApplication}
            onChange={updateNotif("newApplication")}
          />
          <Toggle
            id="notif-app-accepted"
            label="Application accepted"
            description="When your application is accepted."
            checked={notifs.applicationAccepted}
            onChange={updateNotif("applicationAccepted")}
          />
          <Toggle
            id="notif-app-rejected"
            label="Application rejected"
            description="When your application is not selected."
            checked={notifs.applicationRejected}
            onChange={updateNotif("applicationRejected")}
          />
          <Toggle
            id="notif-new-message"
            label="New message"
            description="When someone sends you a direct message."
            checked={notifs.newMessage}
            onChange={updateNotif("newMessage")}
          />
          <Toggle
            id="notif-new-review"
            label="New review"
            description="When you receive a review after a completed job."
            checked={notifs.newReview}
            onChange={updateNotif("newReview")}
          />
        </CardBody>
        <div className="px-5 pb-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Note: preferences are saved on this device only. Server-side
            notification preferences are coming in a future release.
          </p>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-brand-600" />
            <h2 className="font-semibold">Appearance</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose your theme. System follows your device setting.
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {THEMES.map((t) => {
              const active = theme === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setTheme(t.value);
                    toast.success(`Theme: ${t.label}`);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "h-11 rounded-lg border text-sm font-medium transition-colors focus-ring",
                    active
                      ? "bg-brand-600 text-white border-brand-600"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Account actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className="font-semibold">Account actions</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Log out</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Sign out of the current session on this device.
            </p>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut size={14} /> Log out
            </Button>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium mb-1 text-red-700 dark:text-red-400">
              Delete account
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Permanently remove your account and all your data. This action
              cannot be undone. Account deletion is coming in a future release.
            </p>
            <Button
              variant="danger"
              size="sm"
              disabled
              title="Coming in a future release"
            >
              <AlertTriangle size={14} /> Delete account
            </Button>
          </div>
        </CardBody>
      </Card>

      <ChangeEmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />
      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium text-right min-w-0 break-anywhere">
        {value || "—"}
      </span>
    </div>
  );
}