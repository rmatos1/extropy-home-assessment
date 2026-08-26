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
    const error = await response.json().catch(() => null);

    throw new Error(error?.message ?? "An unexpected error occurred.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
