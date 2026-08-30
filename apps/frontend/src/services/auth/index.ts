import { api } from "../api";
import { useAuthStore, useCategoriesStore } from "../../store";

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

export function getCurrentUser(): Promise<CurrentUser> {
  return api<CurrentUser>("/auth/me");
}

export async function logout(): Promise<void> {
  await api<void>("/auth/logout", {
    method: "POST",
  });

  useAuthStore.getState().clearUser();
  useCategoriesStore.getState().setCategories([]);
}

export function updateProfile(data: ProfileUpdateInput): Promise<void> {
  return api<void>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
