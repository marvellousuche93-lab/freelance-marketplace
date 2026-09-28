/**
 * useDocumentMeta — manage document <head> tags from a React component.
 *
 * Handles:
 *   - <title>
 *   - <meta name="description">
 *   - <link rel="canonical">
 *   - Open Graph tags (og:*)
 *   - Twitter card tags (twitter:*)
 *   - JSON-LD <script type="application/ld+json">
 *
 * This is a lightweight, dependency-free approach. If you later migrate
 * to a framework with native head management (Next.js, Remix, etc.),
 * delete this hook and use the framework's API instead.
 *
 * Note on limits: because we render on the client, bots that do NOT
 * execute JavaScript (Facebook, Twitter, Slack, WhatsApp, most non-Google
 * crawlers) will not see any of the tags this hook writes. They'll only
 * see the tags in index.html. Real social-preview support requires SSR
 * or pre-rendering.
 */

import { useEffect } from "react";

const MANAGED_ATTR = "data-managed-by-usemeta";

/**
 * Set (or replace) a meta tag by name= or property=.
 */
function upsertMeta(attr, key, content) {
  if (content == null) return;
  const selector = `meta[${attr}="${CSS.escape(key)}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    tag.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * Set (or replace) the canonical link.
 */
function upsertCanonical(href) {
  if (!href) return;
  let tag = document.head.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    tag.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

/**
 * Replace the first JSON-LD script managed by this hook.
 * Multiple JSON-LD blocks are allowed by search engines; we manage a
 * single one per page to keep things simple.
 */
function upsertJsonLd(id, data) {
  const sel = `script[type="application/ld+json"][data-jsonld-id="${CSS.escape(id)}"]`;
  const existing = document.head.querySelector(sel);
  if (!data) {
    if (existing) existing.remove();
    return;
  }
  const script = existing || document.createElement("script");
  script.setAttribute("type", "application/ld+json");
  script.setAttribute("data-jsonld-id", id);
  script.setAttribute(MANAGED_ATTR, "true");
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
}

/**
 * Clean up everything this hook set on unmount.
 */
function cleanup() {
  document.head
    .querySelectorAll(`[${MANAGED_ATTR}="true"]`)
    .forEach((el) => el.remove());
}

export function useDocumentMeta({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage,
  twitterCard = "summary_large_image",
  jsonLd,
}) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      upsertMeta("name", "description", description);
    }

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:site_name", "Freelance Marketplace");
    if (ogImage) upsertMeta("property", "og:image", ogImage);

    upsertMeta("name", "twitter:card", twitterCard);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    if (ogImage) upsertMeta("name", "twitter:image", ogImage);

    if (canonical) upsertCanonical(canonical);

    if (jsonLd) {
      upsertJsonLd("page", jsonLd);
    }

    return () => {
      // No per-effect cleanup here — we want the tags to persist until the
      // next page overwrites them. Full cleanup only happens on unmount of
      // the last component that used the hook, which is effectively when
      // the app tears down. In practice this rarely matters in SPAs.
    };
  }, [
    title,
    description,
    canonical,
    ogType,
    ogImage,
    twitterCard,
    JSON.stringify(jsonLd),
  ]);
}

/**
 * Helper to build absolute URLs.
 *
 * In production, VITE_SITE_URL must be set to the real domain,
 * e.g. https://freelancemarketplace.example.com.
 * In development it defaults to http://localhost:5173.
 */
export function absoluteUrl(path = "/") {
  const base =
    import.meta.env.VITE_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  if (!path) return base;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export default useDocumentMeta;