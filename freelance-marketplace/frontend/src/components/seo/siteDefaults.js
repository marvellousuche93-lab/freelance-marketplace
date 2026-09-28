/**
 * Site-wide SEO defaults.
 *
 * Change these in one place to update titles, descriptions, and the
 * default Open Graph image used across the site.
 */

export const SITE_NAME = "Freelance Marketplace";
export const SITE_TAGLINE = "Find great work. Hire great people.";
export const SITE_DESCRIPTION =
  "A freelance and job marketplace where freelancers publish portfolios and apply to jobs, and employers post work and hire talent.";

// A 1200x630 default OG image is ideal. Put it in frontend/public/.
// We use a static file so social crawlers don't need JS to see it.
// (This is one of the few OG tags that works without SSR, because it's
// referenced from index.html — see Step 12.)
export const DEFAULT_OG_IMAGE = "/og-image.png";