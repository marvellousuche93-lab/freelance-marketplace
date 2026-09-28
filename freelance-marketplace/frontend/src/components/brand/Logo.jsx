/**
 * Logo — the mark plus wordmark.
 *
 * Renders a link to "/" by default so it can be dropped into navbars
 * and footers without wrapping. Pass `as="span"` to render as a plain
 * span (useful inside other links or in the loading screen).
 *
 * The wordmark is always visible, but its font size steps down on
 * small screens so it doesn't crowd the header at 320px.
 */

import { Link } from "react-router-dom";

import LogoMark from "./LogoMark";
import { cn } from "../../utils/cn";

export default function Logo({
  size = 32,
  compact = false,
  as = "link",
  to = "/",
  className = "",
}) {
  const fullText = "Freelance Marketplace";
  const shortText = "Marketplace";

  const content = (
    <span className={cn("inline-flex items-center gap-2 shrink-0 min-w-0", className)}>
      <LogoMark size={size} />
      <span
        className={cn(
          "font-semibold tracking-tight text-slate-900 dark:text-slate-100",
          "text-[13px] sm:text-sm md:text-base",
          "truncate"
        )}
      >
        {compact ? (
          <>
            <span className="sm:hidden">{shortText}</span>
            <span className="hidden sm:inline">{fullText}</span>
          </>
        ) : (
          fullText
        )}
      </span>
    </span>
  );

  if (as === "span") return content;
  if (as === "a") {
    return (
      <a href={to} className="inline-flex items-center min-w-0">
        {content}
      </a>
    );
  }
  return (
    <Link to={to} className="inline-flex items-center min-w-0">
      {content}
    </Link>
  );
}