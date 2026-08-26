import { api } from "./api";

type AuthInput = {
  email: string;
  password: string;
};

export async function auth(input: AuthInput, endpoint: string): Promise<void> {
  await api<void>(`/auth/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCurrentUser(): Promise<boolean> {
  return await api<void>("/auth/me", {
    method: "GET",
  });
}
