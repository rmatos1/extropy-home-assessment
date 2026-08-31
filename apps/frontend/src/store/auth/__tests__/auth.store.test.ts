import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "../";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      userEmail: "",
    });

    localStorage.clear();
  });

  it("should initialize with an empty user email", () => {
    const { userEmail } = useAuthStore.getState();

    expect(userEmail).toBe("");
  });

  it("should set the user email", () => {
    useAuthStore.getState().setUserEmail("john@example.com");

    expect(useAuthStore.getState().userEmail).toBe("john@example.com");
  });

  it("should replace the existing user email", () => {
    useAuthStore.getState().setUserEmail("old@example.com");

    useAuthStore.getState().setUserEmail("new@example.com");

    expect(useAuthStore.getState().userEmail).toBe("new@example.com");
  });

  it("should clear the user email", () => {
    useAuthStore.getState().setUserEmail("john@example.com");

    useAuthStore.getState().clearUser();

    expect(useAuthStore.getState().userEmail).toBe("");
  });

  it("should persist the user email", async () => {
    useAuthStore.getState().setUserEmail("john@example.com");

    await new Promise((resolve) => setTimeout(resolve, 0));

    const stored = localStorage.getItem("auth-storage");

    expect(stored).not.toBeNull();

    expect(JSON.parse(stored!)).toEqual(
      expect.objectContaining({
        state: {
          userEmail: "john@example.com",
        },
      })
    );
  });

  it("should persist the cleared user email", async () => {
    useAuthStore.getState().setUserEmail("john@example.com");
    useAuthStore.getState().clearUser();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const stored = localStorage.getItem("auth-storage");

    expect(stored).not.toBeNull();

    expect(JSON.parse(stored!)).toEqual(
      expect.objectContaining({
        state: {
          userEmail: "",
        },
      })
    );
  });
});
