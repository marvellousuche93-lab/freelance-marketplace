/**
 * ThemeToggle — cycles theme through light -> dark -> system.
 */

import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";

const order = ["light", "dark", "system"];

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const labels = {
  light: "Light theme",
  dark: "Dark theme",
  system: "System theme",
};

export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const Icon = icons[theme] || Monitor;

  function cycle() {
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length];
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Switch theme (currently ${labels[theme]})`}
      title={labels[theme]}
      className={cn(
        "inline-flex items-center justify-center h-9 w-9 rounded-lg",
        "text-slate-700 hover:bg-slate-100",
        "dark:text-slate-200 dark:hover:bg-slate-800",
        "focus-ring transition-colors",
        className
      )}
    >
      <Icon size={18} />
    </button>
  );
}