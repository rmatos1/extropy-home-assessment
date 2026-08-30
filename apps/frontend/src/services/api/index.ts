const API_URL = import.meta.env.VITE_API_URL;

export async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();

    let message = "An unexpected error occurred.";

    if (text) {
      try {
        const error = JSON.parse(text);
        message = error?.message ?? message;
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text);
}
