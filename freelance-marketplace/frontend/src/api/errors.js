/**
 * Turn a caught axios error into a user-friendly string.
 *
 * Handles:
 *   - DRF field errors ({"field": ["msg"]}) -> "field: msg"
 *   - DRF detail errors ({"detail": "msg"}) -> "msg"
 *   - Network errors (no response) -> friendly message
 *   - Everything else -> fallback
 */

export function extractErrorMessage(err, fallback = "Something went wrong.") {
  if (!err) return fallback;

  // No response (network error, DNS, CORS, server down)
  if (!err.response) {
    return err.message || "Network error. Is the server running?";
  }

  const data = err.response.data;
  if (!data) return fallback;

  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;

  if (typeof data === "object") {
    const parts = [];
    for (const [field, val] of Object.entries(data)) {
      const text = Array.isArray(val) ? val.join(" ") : String(val);
      parts.push(field === "non_field_errors" ? text : `${field}: ${text}`);
    }
    if (parts.length) return parts.join(" | ");
  }

  return fallback;
}