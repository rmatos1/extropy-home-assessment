import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  userEmail: string;
  setUserEmail: (value: string) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userEmail: "",

      setUserEmail: (value) =>
        set({
          userEmail: value,
        }),

      clearUser: () =>
        set({
          userEmail: "",
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
