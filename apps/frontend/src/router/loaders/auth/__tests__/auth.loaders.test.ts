import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser } from "../../../../services";
import { redirectAuthenticatedLoader, requireAuthLoader } from "../";

vi.mock("../../../../services", () => ({
  getCurrentUser: vi.fn(),
}));

const getCurrentUserMock = vi.mocked(getCurrentUser);

describe("auth loaders", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("requireAuthLoader", () => {
    it("should return the current user when authenticated", async () => {
      const user = {
        id: "user-123",
        email: "john@example.com",
      };

      getCurrentUserMock.mockResolvedValue(user);

      const result = await requireAuthLoader();

      expect(getCurrentUserMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(user);
    });

    it("should redirect to login when authentication fails", async () => {
      getCurrentUserMock.mockRejectedValue(new Error("UNAUTHORIZED"));

      await expect(requireAuthLoader()).rejects.toMatchObject({
        status: 302,
        headers: expect.objectContaining({
          get: expect.any(Function),
        }),
      });

      try {
        await requireAuthLoader();
      } catch (error) {
        expect(error).toBeInstanceOf(Response);
        expect((error as Response).status).toBe(302);
        expect((error as Response).headers.get("Location")).toBe("/login");
      }
    });

    it("should redirect to login for any getCurrentUser error", async () => {
      getCurrentUserMock.mockRejectedValue(new Error("Something unexpected"));

      try {
        await requireAuthLoader();
      } catch (error) {
        expect(error).toBeInstanceOf(Response);
        expect((error as Response).headers.get("Location")).toBe("/login");
      }

      expect(getCurrentUserMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("redirectAuthenticatedLoader", () => {
    it("should redirect to overview when the user is authenticated", async () => {
      getCurrentUserMock.mockResolvedValue({
        id: "user-123",
        email: "john@example.com",
      });

      try {
        await redirectAuthenticatedLoader();
      } catch (error) {
        expect(error).toBeInstanceOf(Response);
        expect((error as Response).status).toBe(302);
        expect((error as Response).headers.get("Location")).toBe("/overview");
      }

      expect(getCurrentUserMock).toHaveBeenCalledTimes(1);
    });

    it("should return null when the user is not authenticated", async () => {
      getCurrentUserMock.mockRejectedValue(new Error("UNAUTHORIZED"));

      const result = await redirectAuthenticatedLoader();

      expect(result).toBeNull();
      expect(getCurrentUserMock).toHaveBeenCalledTimes(1);
    });

    it("should preserve a Response error instead of returning null", async () => {
      const redirectResponse = new Response(null, {
        status: 302,
        headers: {
          Location: "/somewhere",
        },
      });

      getCurrentUserMock.mockImplementation(async () => {
        throw redirectResponse;
      });

      try {
        await redirectAuthenticatedLoader();
      } catch (error) {
        expect(error).toBe(redirectResponse);
      }
    });

    it("should not redirect when authentication fails with a non-Response error", async () => {
      getCurrentUserMock.mockRejectedValue(new Error("Network error"));

      const result = await redirectAuthenticatedLoader();

      expect(result).toBeNull();
    });
  });
});
