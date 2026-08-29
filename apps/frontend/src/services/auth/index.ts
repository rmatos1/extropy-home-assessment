import { api } from "../api";
import { useAuthStore } from "../../store";

type AuthInput = {
  email: string;
  password: string;
};

type CurrentUser = {
  id: string;
  email: string;
};

export async function auth(input: AuthInput, endpoint: string): Promise<void> {
  await api<void>(`/auth/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return api<CurrentUser>("/auth/me");
}

export async function logout(): Promise<void> {
  await api<void>("/auth/logout", {
    method: "POST",
  });

  useAuthStore.getState().setUserEmail("");
}
