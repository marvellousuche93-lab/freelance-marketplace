/**
 * Build a FormData object from a plain object.
 *
 * Rules:
 *   - Arrays are appended one value per key (DRF M2M needs this).
 *   - `null` / `undefined` values are skipped.
 *   - `File` / `Blob` values are appended as-is.
 *   - Everything else is stringified.
 *
 * Usage:
 *   const fd = toFormData({ title: "Hi", skills: [1,2], cover: someFile });
 */

export function toFormData(obj) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v === null || v === undefined) return;
        fd.append(key, v instanceof Blob ? v : String(v));
      });
    } else if (value instanceof Blob) {
      fd.append(key, value);
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
}