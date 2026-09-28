/**
 * Map a notification to a route.
 *
 * We only have `related_object_type` and `related_object_id` on the
 * notification. Some of these can be turned into direct links; others
 * fall back to a general page.
 *
 * Returns:
 *   { to: string }                      — a route to navigate to
 *   { to: string, query: {...} }        — a route with query params
 *   null                                — no destination
 */

export function notificationTarget(notification, user) {
  if (!notification) return null;

  const { related_object_type, related_object_id } = notification;
  const isEmployer = user?.role === "EMPLOYER";
  const isFreelancer = user?.role === "FREELANCER";

  switch (related_object_type) {
    case "conversation":
      if (related_object_id) {
        return {
          to: "/dashboard/messages",
          query: { c: related_object_id },
        };
      }
      return { to: "/dashboard/messages" };

    case "application":
      // Applications page. Same URL for both roles; content differs.
      return { to: "/dashboard/applications" };

    case "review":
      // No job slug available on the notification — send to profile, where
      // the user can see their rating and reviews list.
      if (isFreelancer || isEmployer) {
        return { to: "/dashboard/profile" };
      }
      return null;

    case "job":
      // We'd love /jobs/<slug> but we don't have the slug, only the id.
      // Send to the dashboard's job list.
      return { to: "/dashboard/jobs" };

    default:
      // System notifications: no obvious target.
      return null;
  }
}