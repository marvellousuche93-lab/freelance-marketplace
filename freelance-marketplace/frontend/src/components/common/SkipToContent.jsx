/**
 * Keyboard-only link that appears on Tab and jumps focus to the main content.
 * Requires a target with id="main-content" (our layouts use <main id="main-content">).
 */
export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only
        focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
        focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2
        focus:text-sm focus:font-medium focus:text-white
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
      "
    >
      Skip to main content
    </a>
  );
}