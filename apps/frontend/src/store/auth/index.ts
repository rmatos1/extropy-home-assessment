import { create } from "zustand";

type AuthState = {
  userEmail: string;
  setUserEmail: (value) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userEmail: "",

  setUserEmail: (value) => set({ userEmail: value }),
}));
