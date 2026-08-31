import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth, getCurrentUser, logout, updateProfile } from "../";

const { apiMock, clearUserMock, setCategoriesMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  clearUserMock: vi.fn(),
  setCategoriesMock: vi.fn(),
}));

vi.mock("../../api", () => ({
  api: apiMock,
}));

vi.mock("../../../store", () => ({
  useAuthStore: {
    getState: () => ({
      clearUser: clearUserMock,
    }),
  },

  useCategoriesStore: {
    getState: () => ({
      setCategories: setCategoriesMock,
    }),
  },
}));

describe("auth services", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("auth", () => {
    it("should call the authentication endpoint with POST", async () => {
      apiMock.mockResolvedValue(undefined);

      const input = {
        email: "john@example.com",
        password: "password123",
      };

      await auth(input, "login");

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
    });

    it("should use the provided endpoint", async () => {
      apiMock.mockResolvedValue(undefined);

      const input = {
        email: "john@example.com",
        password: "password123",
      };

      await auth(input, "signup");

      expect(apiMock).toHaveBeenCalledWith("/auth/signup", {
        method: "POST",
        body: JSON.stringify(input),
      });
    });

    it("should propagate API errors", async () => {
      const error = new Error("Invalid credentials");

      apiMock.mockRejectedValue(error);

      await expect(
        auth(
          {
            email: "john@example.com",
            password: "wrong",
          },
          "login"
        )
      ).rejects.toBe(error);
    });
  });

  describe("getCurrentUser", () => {
    it("should request the current user", async () => {
      const user = {
        id: "user-123",
        email: "john@example.com",
      };

      apiMock.mockResolvedValue(user);

      const result = await getCurrentUser();

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(user);
    });

    it("should propagate API errors", async () => {
      const error = new Error("Unauthorized");

      apiMock.mockRejectedValue(error);

      await expect(getCurrentUser()).rejects.toBe(error);
    });
  });

  describe("logout", () => {
    it("should call the logout endpoint with POST", async () => {
      apiMock.mockResolvedValue(undefined);

      await logout();

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/auth/logout", {
        method: "POST",
      });
    });

    it("should clear the authenticated user after logout", async () => {
      apiMock.mockResolvedValue(undefined);

      await logout();

      expect(clearUserMock).toHaveBeenCalledTimes(1);
    });

    it("should clear categories after logout", async () => {
      apiMock.mockResolvedValue(undefined);

      await logout();

      expect(setCategoriesMock).toHaveBeenCalledTimes(1);
      expect(setCategoriesMock).toHaveBeenCalledWith([]);
    });

    it("should clear both stores after a successful logout", async () => {
      apiMock.mockResolvedValue(undefined);

      await logout();

      expect(clearUserMock).toHaveBeenCalledTimes(1);
      expect(setCategoriesMock).toHaveBeenCalledTimes(1);
      expect(setCategoriesMock).toHaveBeenCalledWith([]);
    });

    it("should not clear stores when the logout API fails", async () => {
      const error = new Error("Unable to logout");

      apiMock.mockRejectedValue(error);

      await expect(logout()).rejects.toBe(error);

      expect(clearUserMock).not.toHaveBeenCalled();
      expect(setCategoriesMock).not.toHaveBeenCalled();
    });
  });

  describe("updateProfile", () => {
    it("should update the email using PATCH", async () => {
      apiMock.mockResolvedValue(undefined);

      const data = {
        email: "new@example.com",
      };

      await updateProfile(data);

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    });

    it("should update the password using PATCH", async () => {
      apiMock.mockResolvedValue(undefined);

      const data = {
        password: "new-password",
      };

      await updateProfile(data);

      expect(apiMock).toHaveBeenCalledWith("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    });

    it("should pass the complete profile update payload unchanged", async () => {
      apiMock.mockResolvedValue(undefined);

      const data = {
        email: "new@example.com",
        password: "new-password",
      };

      await updateProfile(data);

      expect(apiMock).toHaveBeenCalledWith("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    });

    it("should propagate API errors", async () => {
      const error = new Error("Unable to update profile");

      apiMock.mockRejectedValue(error);

      await expect(
        updateProfile({
          email: "new@example.com",
        })
      ).rejects.toBe(error);
    });
  });
});
