import { describe, expect, it, beforeEach, vi } from "vitest";

import { auth, updateProfile, logout } from "../../../../services";

import {
  loginAction,
  signupAction,
  updateProfileAction,
  logoutAction,
} from "../";

vi.mock("../../../../services", () => ({
  auth: vi.fn(),
  updateProfile: vi.fn(),
  logout: vi.fn(),
}));

const setUserEmailMock = vi.fn();

vi.mock("../../../../store", () => ({
  useAuthStore: {
    getState: () => ({
      setUserEmail: setUserEmailMock,
    }),
  },
}));

const authMock = vi.mocked(auth);
const updateProfileMock = vi.mocked(updateProfile);
const logoutMock = vi.mocked(logout);

describe("auth actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const createRequest = (fields: Record<string, string>) => {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      formData.set(key, value);
    });

    return new Request("http://localhost", {
      method: "POST",
      body: formData,
    });
  };

  describe("loginAction", () => {
    it("should authenticate the user and redirect to overview", async () => {
      authMock.mockResolvedValue(undefined);

      const email = "john@example.com";
      const password = "password123";

      const result = await loginAction({
        request: createRequest({
          email,
          password,
        }),
      } as never);

      expect(authMock).toHaveBeenCalledTimes(1);
      expect(authMock).toHaveBeenCalledWith(
        {
          email,
          password,
        },
        "login"
      );

      expect(setUserEmailMock).toHaveBeenCalledTimes(1);

      expect(setUserEmailMock).toHaveBeenCalledWith(email);

      expect(result).toBeInstanceOf(Response);
      expect((result as Response).status).toBe(302);
      expect((result as Response).headers.get("Location")).toBe("/overview");
    });

    it("should return the service error when authentication fails", async () => {
      authMock.mockRejectedValue(new Error("Invalid email or password."));

      const result = await loginAction({
        request: createRequest({
          email: "john@example.com",
          password: "wrong-password",
        }),
      } as never);

      expect(result).toEqual({
        error: "Invalid email or password.",
      });

      expect(setUserEmailMock).not.toHaveBeenCalled();
    });

    it("should return a fallback error for non-Error failures", async () => {
      authMock.mockRejectedValue("unexpected failure");

      const result = await loginAction({
        request: createRequest({
          email: "john@example.com",
          password: "password123",
        }),
      } as never);

      expect(result).toEqual({
        error: "An unexpected error occurred.",
      });
    });

    it("should read email and password from the request form data", async () => {
      authMock.mockResolvedValue(undefined);

      await loginAction({
        request: createRequest({
          email: "  john@example.com  ",
          password: "password123",
        }),
      } as never);

      expect(authMock).toHaveBeenCalledWith(
        {
          email: "  john@example.com  ",
          password: "password123",
        },
        "login"
      );
    });

    it("should use empty strings when email and password are missing", async () => {
      authMock.mockResolvedValue(undefined);

      await loginAction({
        request: createRequest({}),
      } as never);

      expect(authMock).toHaveBeenCalledWith(
        {
          email: "",
          password: "",
        },
        "login"
      );
    });
  });

  describe("signupAction", () => {
    it("should create the account and redirect to overview", async () => {
      authMock.mockResolvedValue(undefined);

      const email = "jane@example.com";
      const password = "password123";

      const result = await signupAction({
        request: createRequest({
          email,
          password,
        }),
      } as never);

      expect(authMock).toHaveBeenCalledTimes(1);
      expect(authMock).toHaveBeenCalledWith(
        {
          email,
          password,
        },
        "signup"
      );

      expect(setUserEmailMock).toHaveBeenCalledTimes(1);

      expect(setUserEmailMock).toHaveBeenCalledWith(email);

      expect(result).toBeInstanceOf(Response);
      expect((result as Response).status).toBe(302);
      expect((result as Response).headers.get("Location")).toBe("/overview");
    });

    it("should return the service error when signup fails", async () => {
      authMock.mockRejectedValue(
        new Error("A user with this email already exists.")
      );

      const result = await signupAction({
        request: createRequest({
          email: "jane@example.com",
          password: "password123",
        }),
      } as never);

      expect(result).toEqual({
        error: "A user with this email already exists.",
      });

      expect(setUserEmailMock).not.toHaveBeenCalled();
    });

    it("should return a fallback error for non-Error failures", async () => {
      authMock.mockRejectedValue("unexpected failure");

      const result = await signupAction({
        request: createRequest({
          email: "jane@example.com",
          password: "password123",
        }),
      } as never);

      expect(result).toEqual({
        error: "An unexpected error occurred.",
      });
    });

    it("should read email and password from the request form data", async () => {
      authMock.mockResolvedValue(undefined);

      await signupAction({
        request: createRequest({
          email: "jane@example.com",
          password: "new-password",
        }),
      } as never);

      expect(authMock).toHaveBeenCalledWith(
        {
          email: "jane@example.com",
          password: "new-password",
        },
        "signup"
      );
    });
  });

  describe("updateProfileAction", () => {
    it("should update the email", async () => {
      updateProfileMock.mockResolvedValue(["email"]);

      const result = await updateProfileAction({
        request: createRequest({
          email: "new@example.com",
        }),
      } as never);

      expect(updateProfileMock).toHaveBeenCalledTimes(1);
      expect(updateProfileMock).toHaveBeenCalledWith({
        email: "new@example.com",
      });

      expect(setUserEmailMock).toHaveBeenCalledTimes(1);

      expect(setUserEmailMock).toHaveBeenCalledWith("new@example.com");

      expect(result).toEqual({
        success: true,
        updated: "email",
      });
    });

    it("should update the password", async () => {
      updateProfileMock.mockResolvedValue(["password"]);

      const result = await updateProfileAction({
        request: createRequest({
          password: "new-password",
        }),
      } as never);

      expect(updateProfileMock).toHaveBeenCalledTimes(1);
      expect(updateProfileMock).toHaveBeenCalledWith({
        password: "new-password",
      });

      expect(setUserEmailMock).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        updated: "password",
      });
    });

    it("should use email when both email and password are submitted", async () => {
      updateProfileMock.mockResolvedValue(["email"]);

      await updateProfileAction({
        request: createRequest({
          email: "new@example.com",
          password: "new-password",
        }),
      } as never);

      expect(updateProfileMock).toHaveBeenCalledWith({
        email: "new@example.com",
      });
    });

    it("should return an error when no fields were updated", async () => {
      updateProfileMock.mockResolvedValue([]);

      const result = await updateProfileAction({
        request: createRequest({
          email: "",
          password: "",
        }),
      } as never);

      expect(result).toEqual({
        error: "No changes were made.",
      });
    });

    it("should return the service error when updating the profile fails", async () => {
      updateProfileMock.mockRejectedValue(new Error("INVALID_PASSWORD"));

      const result = await updateProfileAction({
        request: createRequest({
          password: "bad",
        }),
      } as never);

      expect(result).toEqual({
        error: "INVALID_PASSWORD",
      });

      expect(setUserEmailMock).not.toHaveBeenCalled();
    });

    it("should return a fallback error for non-Error failures", async () => {
      updateProfileMock.mockRejectedValue("unexpected failure");

      const result = await updateProfileAction({
        request: createRequest({
          password: "password123",
        }),
      } as never);

      expect(result).toEqual({
        error: "An unexpected error occurred.",
      });
    });

    it("should not update the email in the store when a password is updated", async () => {
      updateProfileMock.mockResolvedValue(["password"]);

      await updateProfileAction({
        request: createRequest({
          password: "password123",
        }),
      } as never);

      expect(setUserEmailMock).not.toHaveBeenCalled();
    });

    it("should update the store only when the returned fields include email", async () => {
      updateProfileMock.mockResolvedValue(["password", "email"]);

      await updateProfileAction({
        request: createRequest({
          email: "new@example.com",
        }),
      } as never);

      expect(setUserEmailMock).toHaveBeenCalledWith("new@example.com");
    });
  });

  describe("logoutAction", () => {
    it("should logout and redirect to login", async () => {
      logoutMock.mockResolvedValue(undefined);

      const result = await logoutAction();

      expect(logoutMock).toHaveBeenCalledTimes(1);

      expect(result).toBeInstanceOf(Response);
      expect((result as Response).status).toBe(302);
      expect((result as Response).headers.get("Location")).toBe("/login");
    });

    it("should return the service error when logout fails", async () => {
      logoutMock.mockRejectedValue(new Error("Unable to logout"));

      const result = await logoutAction();

      expect(result).toEqual({
        error: "Unable to logout",
      });
    });

    it("should return a fallback error for non-Error failures", async () => {
      logoutMock.mockRejectedValue("unexpected failure");

      const result = await logoutAction();

      expect(result).toEqual({
        error: "An unexpected error occurred.",
      });
    });
  });
});
