# SEO Strategy

## What we do well

- Per-page `<title>` and `<meta name="description">` (rendered by JS; Google picks these up during its headless render pass).
- Canonical URLs on every page.
- Structured data (`JobPosting` on job pages, `Person` on freelancer pages, `WebSite` on home).
- Semantic HTML in all main content.
- `robots.txt` and a static `sitemap.xml` for evergreen pages.
- `noindex` on the authenticated dashboard (via `robots.txt` `Disallow`).

## What we do NOT do well

Because this is a client-side SPA:

1. **Social previews are broken.** Facebook, Twitter/X, LinkedIn, Slack, WhatsApp, Discord, Telegram — none of them execute JavaScript. They read only the initial `index.html`, which contains generic OG tags. To fix this, we'd need SSR (Next.js) or a pre-render service.

2. **Google indexing is delayed.** Google executes JS, but it queues pages for the render pass. New job pages may take days or weeks to be indexed. Critical pages (like `/jobs`) tend to be indexed faster because they're crawled more often.

3. **No crawl of dynamic pages.** Because content isn't in the initial HTML, we can't rely on server-side crawling for the sitemap. That's why we keep the sitemap static for now.

## Options to fix this

### Option A — Next.js for public pages (recommended for serious SEO)

- Move `/`, `/jobs`, `/jobs/:slug`, `/freelancers`, `/freelancers/:username`, `/about`, `/contact`, `/faq`, `/terms`, `/privacy` into a Next.js app.
- Keep the dashboard as a React SPA (or use Next.js client components).
- Migrate the API client, Tailwind config, and UI primitives.
- Effort: significant. Result: first-class SEO on all public pages.

### Option B — Django templates for public pages

- Render public pages with Django templates.
- Use React only for the dashboard.
- All the metadata is in the server response.
- Effort: moderate. Result: first-class SEO, but a less-smooth UX for public pages.

### Option C — Pre-rendering (prerender.io or similar)

- Proxy requests through a service that renders your SPA for bots and serves the static HTML.
- Simplest to bolt on; less clean than SSR.
- Effort: low. Result: good-enough SEO for many sites.

We currently do none of these. This document exists so you know exactly what you're getting and what you're giving up.