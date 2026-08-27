import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";

import type { User } from "@extropy/shared";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@extropy/shared";

import {
  createSessionCookie,
  generateToken,
  getAuthenticatedUserId,
  getJwtSecret,
  getTokenFromCookie,
  validateEmail,
  validatePassword,
} from "../auth.helpers";
import { SESSION_COOKIE_NAME } from "../auth.constants";
import { mockedUser } from "./mocks";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured for tests");
}

describe("auth.helpers", () => {
  const { id, email, password } = mockedUser;

  describe("getJwtSecret", () => {
    it("should return the configured JWT secret", () => {
      expect(getJwtSecret()).toBe(jwtSecret);
    });
  });

  describe("validateEmail", () => {
    it("should accept a valid email", () => {
      expect(() => validateEmail("john@example.com")).not.toThrow();
    });

    it("should reject an invalid email", () => {
      expect(() => validateEmail("invalid-email")).toThrow("INVALID_EMAIL");
    });
  });

  describe("validatePassword", () => {
    it("should accept a password within the allowed length", () => {
      const validPassword = "a".repeat(MIN_PASSWORD_LENGTH);

      expect(() => validatePassword(validPassword)).not.toThrow();
    });

    it("should reject a password shorter than the minimum length", () => {
      const shortPassword = "a".repeat(MIN_PASSWORD_LENGTH - 1);

      expect(() => validatePassword(shortPassword)).toThrow("INVALID_PASSWORD");
    });

    it("should reject a password longer than the maximum length", () => {
      const longPassword = "a".repeat(MAX_PASSWORD_LENGTH + 1);

      expect(() => validatePassword(longPassword)).toThrow("INVALID_PASSWORD");
    });

    it("should accept a password with the maximum allowed length", () => {
      const validPassword = "a".repeat(MAX_PASSWORD_LENGTH);

      expect(() => validatePassword(validPassword)).not.toThrow();
    });
  });

  describe("generateToken", () => {
    it("should generate a JWT with the user data", () => {
      const user: User = {
        ...mockedUser,
      };

      const token = generateToken(user);

      const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

      expect(payload.sub).toBe(id);
      expect(payload.email).toBe(email);
    });
  });

  describe("createSessionCookie", () => {
    it("should create a session cookie", () => {
      const token = "test-token";

      const result = createSessionCookie(token);

      expect(result).toBe(
        `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/`
      );
    });

    it("should create an expired session cookie", () => {
      const result = createSessionCookie("", 0);

      expect(result).toBe(
        `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
      );
    });

    it("should include the provided max age", () => {
      const result = createSessionCookie("test-token", 3600);

      expect(result).toBe(
        `${SESSION_COOKIE_NAME}=test-token; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`
      );
    });
  });

  describe("getTokenFromCookie", () => {
    it("should return the token from the session cookie", () => {
      const token = "test-token";

      const result = getTokenFromCookie(`${SESSION_COOKIE_NAME}=${token}`);

      expect(result).toBe(token);
    });

    it("should return the token when other cookies are present", () => {
      const token = "test-token";

      const result = getTokenFromCookie(
        `theme=dark; ${SESSION_COOKIE_NAME}=${token}; language=en`
      );

      expect(result).toBe(token);
    });

    it("should reject a missing cookie header", () => {
      expect(() => getTokenFromCookie(undefined)).toThrow("UNAUTHORIZED");
    });

    it("should reject a cookie header without a session cookie", () => {
      expect(() => getTokenFromCookie("theme=dark; language=en")).toThrow(
        "UNAUTHORIZED"
      );
    });
  });

  describe("getAuthenticatedUserId", () => {
    it("should return the user id from a valid session cookie", () => {
      const token = jwt.sign(
        {
          sub: id,
          email,
        },
        jwtSecret
      );

      const result = getAuthenticatedUserId(`${SESSION_COOKIE_NAME}=${token}`);

      expect(result).toBe(id);
    });

    it("should reject an invalid JWT", () => {
      expect(() =>
        getAuthenticatedUserId(`${SESSION_COOKIE_NAME}=invalid-token`)
      ).toThrow();
    });

    it("should reject a JWT without a user id", () => {
      const token = jwt.sign(
        {
          email,
        },
        jwtSecret
      );

      expect(() =>
        getAuthenticatedUserId(`${SESSION_COOKIE_NAME}=${token}`)
      ).toThrow("UNAUTHORIZED");
    });

    it("should reject a JWT signed with another secret", () => {
      const token = jwt.sign(
        {
          sub: id,
        },
        "another-secret"
      );

      expect(() =>
        getAuthenticatedUserId(`${SESSION_COOKIE_NAME}=${token}`)
      ).toThrow();
    });
  });
});
