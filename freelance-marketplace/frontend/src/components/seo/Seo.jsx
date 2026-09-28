/**
 * Seo — declarative wrapper around useDocumentMeta.
 *
 * Usage:
 *   <Seo
 *     title="Browse Jobs | Freelance Marketplace"
 *     description="Find your next project among hundreds of open jobs."
 *     path="/jobs"
 *     jsonLd={...}
 *   />
 *
 * Set `path` and we'll canonicalize it to an absolute URL.
 */

import useDocumentMeta, { absoluteUrl } from "../../hooks/useDocumentMeta";

export default function Seo({
  title,
  description,
  path,
  ogType,
  ogImage,
  jsonLd,
}) {
  useDocumentMeta({
    title,
    description,
    canonical: path ? absoluteUrl(path) : absoluteUrl(window.location.pathname),
    ogType,
    ogImage,
    jsonLd,
  });
  return null;
}