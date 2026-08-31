import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import { api } from "../";

describe("api", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it("should make a GET request using the API URL", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "user-123",
          name: "John",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    const result = await api("/users/me");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/users/me"),
      expect.objectContaining({
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    expect(result).toEqual({
      id: "user-123",
      name: "John",
    });
  });

  it("should include credentials in every request", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
      })
    );

    await api("/test");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        credentials: "include",
      })
    );
  });

  it("should set the JSON content type by default", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
      })
    );

    await api("/test");

    const [, options] = fetchMock.mock.calls[0];

    expect(options.headers).toEqual({
      "Content-Type": "application/json",
    });
  });

  it("should preserve custom headers", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
      })
    );

    await api("/test", {
      headers: {
        Authorization: "Bearer token",
        "X-Custom-Header": "custom-value",
      },
    });

    const [, options] = fetchMock.mock.calls[0];

    expect(options.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer token",
      "X-Custom-Header": "custom-value",
    });
  });

  it("should allow overriding the default Content-Type header", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
      })
    );

    await api("/test", {
      headers: {
        "Content-Type": "text/plain",
      },
    });

    const [, options] = fetchMock.mock.calls[0];

    expect(options.headers).toEqual({
      "Content-Type": "text/plain",
    });
  });

  it("should pass the provided request options to fetch", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
      })
    );

    await api("/users", {
      method: "POST",
      body: JSON.stringify({
        name: "John",
      }),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "John",
        }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });

  it("should parse and return JSON response", async () => {
    const responseData = {
      id: "expense-123",
      amount: 100,
      description: "Lunch",
    };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(responseData), {
        status: 200,
      })
    );

    const result = await api<typeof responseData>("/expenses/123");

    expect(result).toEqual(responseData);
  });

  it("should return undefined when the response body is empty", async () => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 204,
      })
    );

    const result = await api<void>("/logout");

    expect(result).toBeUndefined();
  });

  it("should throw the message returned by a JSON error response", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Invalid credentials",
        }),
        {
          status: 401,
        }
      )
    );

    await expect(api("/login")).rejects.toThrow("Invalid credentials");
  });

  it("should use the default error message when JSON error has no message", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "INVALID_REQUEST",
        }),
        {
          status: 400,
        }
      )
    );

    await expect(api("/test")).rejects.toThrow("An unexpected error occurred.");
  });

  it("should use the default error message when the error body is empty", async () => {
    fetchMock.mockResolvedValue(
      new Response("", {
        status: 500,
      })
    );

    await expect(api("/test")).rejects.toThrow("An unexpected error occurred.");
  });

  it("should use plain text when the error response is not valid JSON", async () => {
    fetchMock.mockResolvedValue(
      new Response("Database unavailable", {
        status: 503,
      })
    );

    await expect(api("/test")).rejects.toThrow("Database unavailable");
  });

  it("should use the fallback message when JSON parsing returns nullish message", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: null,
        }),
        {
          status: 400,
        }
      )
    );

    await expect(api("/test")).rejects.toThrow("An unexpected error occurred.");
  });

  it("should throw when fetch itself rejects", async () => {
    const networkError = new Error("Network error");

    fetchMock.mockRejectedValue(networkError);

    await expect(api("/test")).rejects.toBe(networkError);
  });

  it("should accept a custom response status in the success range", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ created: true }), {
        status: 201,
      })
    );

    const result = await api("/users", {
      method: "POST",
    });

    expect(result).toEqual({
      created: true,
    });
  });

  it("should treat a 204 response with no body as undefined", async () => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 204,
      })
    );

    const result = await api<void>("/logout", {
      method: "POST",
    });

    expect(result).toBeUndefined();
  });

  it("should not throw for other successful status codes", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 299,
      })
    );

    const result = await api("/test");

    expect(result).toEqual({
      ok: true,
    });
  });
});
