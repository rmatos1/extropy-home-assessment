import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@extropy/shared";

import { getAuthenticatedUserId, login, signup } from "../auth.helper";
import { BCRYPT_SALT_ROUNDS } from "../auth.constants";
import { mockedUser } from "./mocks";

const { createUserMock, getUserByEmailMock } = vi.hoisted(() => ({
  createUserMock: vi.fn(),
  getUserByEmailMock: vi.fn(),
}));

vi.mock("../auth.repository", () => ({
  createUser: createUserMock,
  getUserByEmail: getUserByEmailMock,
}));

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured for tests");
}

describe("auth.helpers", () => {
  const { id, email, password } = mockedUser;

  beforeEach(() => {
    createUserMock.mockReset();
    getUserByEmailMock.mockReset();
  });

  describe("signup", () => {
    it("should create a user and return a JWT", async () => {
      getUserByEmailMock.mockResolvedValueOnce(undefined);
      createUserMock.mockResolvedValueOnce(undefined);

      const result = await signup({
        email: " John@Example.com ",
        password,
      });

      expect(getUserByEmailMock).toHaveBeenCalledWith(email);
      expect(createUserMock).toHaveBeenCalledTimes(1);

      const createdUser = createUserMock.mock.calls[0][0] as User;

      expect(createdUser).toMatchObject({
        email,
      });

      expect(createdUser.id).toEqual(expect.any(String));
      expect(createdUser.passwordHash).not.toBe(password);

      expect(await bcrypt.compare(password, createdUser.passwordHash)).toBe(
        true
      );

      expect(createdUser.createdAt).toEqual(expect.any(String));
      expect(createdUser.updatedAt).toEqual(expect.any(String));

      const decoded = jwt.verify(result.token, jwtSecret) as jwt.JwtPayload;

      expect(decoded.sub).toBe(createdUser.id);
      expect(decoded.email).toBe(email);
    });

    it("should reject an invalid email", async () => {
      await expect(
        signup({
          email: "invalid-email",
          password,
        })
      ).rejects.toThrow("INVALID_EMAIL");

      expect(getUserByEmailMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
    });

    it("should reject a password shorter than the minimum length", async () => {
      await expect(
        signup({
          email,
          password: "short",
        })
      ).rejects.toThrow("INVALID_PASSWORD");

      expect(getUserByEmailMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
    });

    it("should reject a password longer than the maximum length", async () => {
      await expect(
        signup({
          email,
          password: "a".repeat(16),
        })
      ).rejects.toThrow("INVALID_PASSWORD");

      expect(getUserByEmailMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
    });

    it("should reject an email that is already registered", async () => {
      getUserByEmailMock.mockResolvedValueOnce(mockedUser);

      await expect(
        signup({
          email,
          password,
        })
      ).rejects.toThrow("USER_EMAIL_ALREADY_EXISTS");

      expect(createUserMock).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should return a JWT for valid credentials", async () => {
      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      getUserByEmailMock.mockResolvedValueOnce({
        ...mockedUser,
        passwordHash,
      });

      const result = await login({
        email: " JOHN@EXAMPLE.COM ",
        password,
      });

      expect(getUserByEmailMock).toHaveBeenCalledWith(email);

      const decoded = jwt.verify(result.token, jwtSecret) as jwt.JwtPayload;

      expect(decoded.sub).toBe(id);
      expect(decoded.email).toBe(email);
    });

    it("should reject an unknown user", async () => {
      getUserByEmailMock.mockResolvedValueOnce(undefined);

      await expect(
        login({
          email: "unknown@example.com",
          password,
        })
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("should reject an incorrect password", async () => {
      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      getUserByEmailMock.mockResolvedValueOnce({
        ...mockedUser,
        passwordHash,
      });

      await expect(
        login({
          email,
          password: "wrong-password",
        })
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("should reject an invalid email", async () => {
      await expect(
        login({
          email: "invalid-email",
          password,
        })
      ).rejects.toThrow("INVALID_EMAIL");

      expect(getUserByEmailMock).not.toHaveBeenCalled();
    });
  });

  describe("getAuthenticatedUserId", () => {
    it("should return the user id from a valid JWT", () => {
      const token = jwt.sign(
        {
          sub: id,
          email,
        },
        jwtSecret
      );

      const result = getAuthenticatedUserId(`Bearer ${token}`);

      expect(result).toBe(id);
    });

    it("should reject a missing authorization header", () => {
      expect(() => getAuthenticatedUserId(undefined)).toThrow("UNAUTHORIZED");
    });

    it("should reject an authorization header without Bearer", () => {
      expect(() => getAuthenticatedUserId("Basic some-token")).toThrow(
        "UNAUTHORIZED"
      );
    });

    it("should reject an invalid JWT", () => {
      expect(() => getAuthenticatedUserId("Bearer invalid-token")).toThrow();
    });

    it("should reject a JWT without a user id", () => {
      const token = jwt.sign(
        {
          email,
        },
        jwtSecret
      );

      expect(() => getAuthenticatedUserId(`Bearer ${token}`)).toThrow(
        "UNAUTHORIZED"
      );
    });

    it("should reject a JWT signed with another secret", () => {
      const token = jwt.sign(
        {
          sub: id,
        },
        "another-secret"
      );

      expect(() => getAuthenticatedUserId(`Bearer ${token}`)).toThrow();
    });
  });
});
