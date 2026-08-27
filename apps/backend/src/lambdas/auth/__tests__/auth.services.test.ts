import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@extropy/shared";

import { getCurrentUser, login, signup } from "../auth.services";
import { BCRYPT_SALT_ROUNDS } from "../auth.constants";
import { mockedUser } from "./mocks";

const { createUserMock, getUserByEmailMock, getUserByIdMock } = vi.hoisted(
  () => ({
    createUserMock: vi.fn(),
    getUserByEmailMock: vi.fn(),
    getUserByIdMock: vi.fn(),
  })
);

const {
  generateTokenMock,
  getAuthenticatedUserIdMock,
  validateEmailMock,
  validatePasswordMock,
} = vi.hoisted(() => ({
  generateTokenMock: vi.fn(),
  getAuthenticatedUserIdMock: vi.fn(),
  validateEmailMock: vi.fn(),
  validatePasswordMock: vi.fn(),
}));

vi.mock("../auth.repository", () => ({
  createUser: createUserMock,
  getUserByEmail: getUserByEmailMock,
  getUserById: getUserByIdMock,
}));

vi.mock("../auth.helpers", () => ({
  generateToken: generateTokenMock,
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
  validateEmail: validateEmailMock,
  validatePassword: validatePasswordMock,
}));

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured for tests");
}

describe("auth.service", () => {
  const { id, email, password } = mockedUser;

  beforeEach(() => {
    createUserMock.mockReset();
    getUserByEmailMock.mockReset();
    getUserByIdMock.mockReset();

    generateTokenMock.mockReset();
    getAuthenticatedUserIdMock.mockReset();
    validateEmailMock.mockReset();
    validatePasswordMock.mockReset();
  });

  describe("signup", () => {
    it("should create a user and return the generated token", async () => {
      const token = "generated-token";

      getUserByEmailMock.mockResolvedValueOnce(undefined);
      createUserMock.mockResolvedValueOnce(undefined);
      generateTokenMock.mockReturnValueOnce(token);

      const result = await signup({
        email: " John@Example.com ",
        password,
      });

      expect(result).toBe(token);

      expect(validateEmailMock).toHaveBeenCalledWith(email);
      expect(validatePasswordMock).toHaveBeenCalledWith(password);

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

      expect(generateTokenMock).toHaveBeenCalledWith(createdUser);
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
      expect(generateTokenMock).not.toHaveBeenCalled();
    });

    it("should not access the repository when email validation fails", async () => {
      validateEmailMock.mockImplementationOnce(() => {
        throw new Error("INVALID_EMAIL");
      });

      await expect(
        signup({
          email: "invalid-email",
          password,
        })
      ).rejects.toThrow("INVALID_EMAIL");

      expect(validateEmailMock).toHaveBeenCalledWith("invalid-email");
      expect(validatePasswordMock).not.toHaveBeenCalled();
      expect(getUserByEmailMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
    });

    it("should not access the repository when password validation fails", async () => {
      validatePasswordMock.mockImplementationOnce(() => {
        throw new Error("INVALID_PASSWORD");
      });

      await expect(
        signup({
          email,
          password: "short",
        })
      ).rejects.toThrow("INVALID_PASSWORD");

      expect(getUserByEmailMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should return the generated token for valid credentials", async () => {
      const token = "generated-token";

      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      getUserByEmailMock.mockResolvedValueOnce({
        ...mockedUser,
        passwordHash,
      });

      generateTokenMock.mockReturnValueOnce(token);

      const result = await login({
        email: " JOHN@EXAMPLE.COM ",
        password,
      });

      expect(result).toBe(token);

      expect(validateEmailMock).toHaveBeenCalledWith(email);
      expect(getUserByEmailMock).toHaveBeenCalledWith(email);

      expect(generateTokenMock).toHaveBeenCalledWith({
        ...mockedUser,
        passwordHash,
      });
    });

    it("should reject an unknown user", async () => {
      getUserByEmailMock.mockResolvedValueOnce(undefined);

      await expect(
        login({
          email,
          password,
        })
      ).rejects.toThrow("INVALID_CREDENTIALS");

      expect(generateTokenMock).not.toHaveBeenCalled();
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

      expect(generateTokenMock).not.toHaveBeenCalled();
    });

    it("should reject an invalid email", async () => {
      validateEmailMock.mockImplementationOnce(() => {
        throw new Error("INVALID_EMAIL");
      });

      await expect(
        login({
          email: "invalid-email",
          password,
        })
      ).rejects.toThrow("INVALID_EMAIL");

      expect(getUserByEmailMock).not.toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("should return the authenticated user", async () => {
      const cookieHeader = "session=valid-token";

      getAuthenticatedUserIdMock.mockReturnValueOnce(id);
      getUserByIdMock.mockResolvedValueOnce(mockedUser);

      const result = await getCurrentUser(cookieHeader);

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith(cookieHeader);

      expect(getUserByIdMock).toHaveBeenCalledWith(id);

      expect(result).toEqual({
        id,
        email,
      });
    });

    it("should reject when the authenticated user does not exist", async () => {
      const cookieHeader = "session=valid-token";

      getAuthenticatedUserIdMock.mockReturnValueOnce(id);
      getUserByIdMock.mockResolvedValueOnce(undefined);

      await expect(getCurrentUser(cookieHeader)).rejects.toThrow(
        "UNAUTHORIZED"
      );

      expect(getUserByIdMock).toHaveBeenCalledWith(id);
    });

    it("should propagate authentication errors", async () => {
      getAuthenticatedUserIdMock.mockImplementationOnce(() => {
        throw new Error("UNAUTHORIZED");
      });

      await expect(getCurrentUser("session=invalid-token")).rejects.toThrow(
        "UNAUTHORIZED"
      );

      expect(getUserByIdMock).not.toHaveBeenCalled();
    });
  });
});
