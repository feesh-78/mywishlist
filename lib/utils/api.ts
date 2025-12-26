/**
 * Get the base URL for API calls
 * - In production (Capacitor app): uses NEXT_PUBLIC_API_URL
 * - In development: uses relative URLs
 */
export function getApiUrl(path: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${apiUrl}${cleanPath}`;
}

/**
 * Fetch wrapper that automatically uses the correct API URL
 */
export async function apiFetch(path: string, init?: RequestInit) {
  const url = getApiUrl(path);
  return fetch(url, init);
}
