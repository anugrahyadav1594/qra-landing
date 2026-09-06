/** Server-side data access for public pages (§6.1).
 *
 * Data-driven pages read from the FastAPI backend (`/api/v1/*`) with a
 * 300 s revalidation window (§6.2 ISR). If the backend is unreachable
 * (e.g. `next build` without the API running) the bundled fallback seed
 * content is used so the site still renders.
 */

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`upstream ${response.status}`);
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}
