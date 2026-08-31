import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User, ProfileUpdateInput } from "@extropy/shared";

import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from "../auth.repository";
import { BCRYPT_SALT_ROUNDS } from "../auth.constants";
import {
  generateToken,
  getAuthenticatedUserId,
  validateEmail,
  validatePassword,
} from "../auth.helpers";
import { getCurrentUser, login, signup, updateProfile } from "../auth.services";
import type { LoginInput, SignupInput } from "../auth.types";
import { mockedUser } from "./mocks";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("../auth.repository", () => ({
  createUser: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("../auth.helpers", () => ({
  generateToken: vi.fn(),
  getAuthenticatedUserId: vi.fn(),
  validateEmail: vi.fn(),
  validatePassword: vi.fn(),
}));

const hashMock = vi.mocked(bcrypt.hash);
const compareMock = vi.mocked(bcrypt.compare);

const createUserMock = vi.mocked(createUser);
const getUserByEmailMock = vi.mocked(getUserByEmail);
const getUserByIdMock = vi.mocked(getUserById);
const updateUserMock = vi.mocked(updateUser);

const generateTokenMock = vi.mocked(generateToken);
const getAuthenticatedUserIdMock = vi.mocked(getAuthenticatedUserId);
const validateEmailMock = vi.mocked(validateEmail);
const validatePasswordMock = vi.mocked(validatePassword);

describe("auth.services", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("signup", () => {
    const input: SignupInput = {
      email: "  JOHN@EXAMPLE.COM  ",
      password: "password123",
    };

    it("should create a user and return a token", async () => {
      const passwordHash = "hashed-password";
      const token = "jwt-token";

      getUserByEmailMock.mockResolvedValue(undefined);
      hashMock.mockResolvedValue(passwordHash as never);
      createUserMock.mockResolvedValue(undefined);
      generateTokenMock.mockReturnValue(token);

      const result = await signup(input);

      expect(result).toBe(token);

      expect(validateEmailMock).toHaveBeenCalledWith("john@example.com");
      expect(validatePasswordMock).toHaveBeenCalledWith(input.password);

      expect(getUserByEmailMock).toHaveBeenCalledWith("john@example.com");

      expect(hashMock).toHaveBeenCalledWith(input.password, BCRYPT_SALT_ROUNDS);

      expect(createUserMock).toHaveBeenCalledTimes(1);

      const user = createUserMock.mock.calls[0][0];

      expect(user).toEqual({
        id: expect.any(String),
        email: "john@example.com",
        passwordHash,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(generateTokenMock).toHaveBeenCalledWith(user);
    });

    it("should reject when the email already exists", async () => {
      getUserByEmailMock.mockResolvedValue(mockedUser);

      await expect(signup(input)).rejects.toThrow("USER_EMAIL_ALREADY_EXISTS");

      expect(hashMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
      expect(generateTokenMock).not.toHaveBeenCalled();
    });

    it("should normalize the email before checking for an existing user", async () => {
      getUserByEmailMock.mockResolvedValue(undefined);
      hashMock.mockResolvedValue("hashed-password" as never);
      generateTokenMock.mockReturnValue("token");

      await signup(input);

      expect(getUserByEmailMock).toHaveBeenCalledWith("john@example.com");
    });

    it("should propagate email validation errors", async () => {
      validateEmailMock.mockImplementation(() => {
        throw new Error("INVALID_EMAIL");
      });

      await expect(signup(input)).rejects.toThrow("INVALID_EMAIL");

      expect(getUserByEmailMock).not.toHaveBeenCalled();
      expect(hashMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
    });

    it("should propagate password validation errors", async () => {
      validatePasswordMock.mockImplementation(() => {
        throw new Error("INVALID_PASSWORD");
      });

      await expect(signup(input)).rejects.toThrow("INVALID_PASSWORD");

      expect(getUserByEmailMock).not.toHaveBeenCalled();
      expect(hashMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      getUserByEmailMock.mockResolvedValue(undefined);
      hashMock.mockResolvedValue("hashed-password" as never);
      createUserMock.mockRejectedValue(new Error("DynamoDB error"));

      await expect(signup(input)).rejects.toThrow("DynamoDB error");
    });
  });

  describe("login", () => {
    const input: LoginInput = {
      email: "  JOHN@EXAMPLE.COM  ",
      password: "password123",
    };

    it("should return a token for valid credentials", async () => {
      const token = "jwt-token";

      getUserByEmailMock.mockResolvedValue(mockedUser);
      compareMock.mockResolvedValue(true as never);
      generateTokenMock.mockReturnValue(token);

      const result = await login(input);

      expect(result).toBe(token);

      expect(validateEmailMock).toHaveBeenCalledWith("john@example.com");
      expect(getUserByEmailMock).toHaveBeenCalledWith("john@example.com");

      expect(compareMock).toHaveBeenCalledWith(
        input.password,
        mockedUser.passwordHash
      );

      expect(generateTokenMock).toHaveBeenCalledWith(mockedUser);
    });

    it("should reject when the user does not exist", async () => {
      getUserByEmailMock.mockResolvedValue(undefined);

      await expect(login(input)).rejects.toThrow("INVALID_CREDENTIALS");

      expect(compareMock).not.toHaveBeenCalled();
      expect(generateTokenMock).not.toHaveBeenCalled();
    });

    it("should reject when the password does not match", async () => {
      getUserByEmailMock.mockResolvedValue(mockedUser);
      compareMock.mockResolvedValue(false as never);

      await expect(login(input)).rejects.toThrow("INVALID_CREDENTIALS");

      expect(generateTokenMock).not.toHaveBeenCalled();
    });

    it("should normalize the email before searching", async () => {
      getUserByEmailMock.mockResolvedValue(mockedUser);
      compareMock.mockResolvedValue(true as never);
      generateTokenMock.mockReturnValue("token");

      await login(input);

      expect(getUserByEmailMock).toHaveBeenCalledWith("john@example.com");
    });

    it("should propagate email validation errors", async () => {
      validateEmailMock.mockImplementation(() => {
        throw new Error("INVALID_EMAIL");
      });

      await expect(login(input)).rejects.toThrow("INVALID_EMAIL");

      expect(getUserByEmailMock).not.toHaveBeenCalled();
      expect(compareMock).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      getUserByEmailMock.mockRejectedValue(new Error("DynamoDB error"));

      await expect(login(input)).rejects.toThrow("DynamoDB error");
    });
  });

  describe("getCurrentUser", () => {
    it("should return the authenticated user's public data", async () => {
      const cookies = ["session=token"];

      getAuthenticatedUserIdMock.mockResolvedValue(mockedUser.id);
      getUserByIdMock.mockResolvedValue(mockedUser);

      const result = await getCurrentUser(cookies);

      expect(result).toEqual({
        id: mockedUser.id,
        email: mockedUser.email,
      });

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith(cookies);
      expect(getUserByIdMock).toHaveBeenCalledWith(mockedUser.id);
    });

    it("should reject when the authenticated user does not exist", async () => {
      const cookies = ["session=token"];

      getAuthenticatedUserIdMock.mockResolvedValue(mockedUser.id);
      getUserByIdMock.mockResolvedValue(undefined);

      await expect(getCurrentUser(cookies)).rejects.toThrow("UNAUTHORIZED");
    });

    it("should propagate authentication errors", async () => {
      const cookies = ["session=invalid"];

      getAuthenticatedUserIdMock.mockRejectedValue(new Error("UNAUTHORIZED"));

      await expect(getCurrentUser(cookies)).rejects.toThrow("UNAUTHORIZED");

      expect(getUserByIdMock).not.toHaveBeenCalled();
    });

    it("should not expose the password hash", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue(mockedUser.id);
      getUserByIdMock.mockResolvedValue(mockedUser);

      const result = await getCurrentUser(["session=token"]);

      expect(result).not.toHaveProperty("passwordHash");
      expect(result).toEqual({
        id: mockedUser.id,
        email: mockedUser.email,
      });
    });
  });

  describe("updateProfile", () => {
    it("should update the email when it has changed", async () => {
      const input: ProfileUpdateInput = {
        email: "  NEW@EXAMPLE.COM  ",
      };

      const currentUser: User = {
        ...mockedUser,
        email: "old@example.com",
      };

      getUserByIdMock.mockResolvedValue(currentUser);
      getUserByEmailMock.mockResolvedValue(undefined);
      updateUserMock.mockResolvedValue(undefined);

      const result = await updateProfile(currentUser.id, input);

      expect(result).toEqual(["email"]);

      expect(validateEmailMock).toHaveBeenCalledWith("new@example.com");

      expect(getUserByIdMock).toHaveBeenCalledWith(currentUser.id);
      expect(getUserByEmailMock).toHaveBeenCalledWith("new@example.com");

      expect(updateUserMock).toHaveBeenCalledWith(currentUser.id, {
        email: "new@example.com",
      });
    });

    it("should not update the email when it has not changed", async () => {
      const input: ProfileUpdateInput = {
        email: mockedUser.email,
      };

      getUserByIdMock.mockResolvedValue(mockedUser);

      const result = await updateProfile(mockedUser.id, input);

      expect(result).toEqual([]);

      expect(getUserByEmailMock).not.toHaveBeenCalled();
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it("should reject when the current user cannot be found", async () => {
      const input: ProfileUpdateInput = {
        email: "new@example.com",
      };

      getUserByIdMock.mockResolvedValue(undefined);

      await expect(updateProfile(mockedUser.id, input)).rejects.toThrow(
        "UNAUTHORIZED"
      );

      expect(getUserByEmailMock).not.toHaveBeenCalled();
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it("should reject when the new email is already in use", async () => {
      const input: ProfileUpdateInput = {
        email: "new@example.com",
      };

      getUserByIdMock.mockResolvedValue(mockedUser);
      getUserByEmailMock.mockResolvedValue({
        ...mockedUser,
        id: "another-user-id",
        email: "new@example.com",
      });

      await expect(updateProfile(mockedUser.id, input)).rejects.toThrow(
        "USER_EMAIL_ALREADY_EXISTS"
      );

      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it("should update the password", async () => {
      const input: ProfileUpdateInput = {
        password: "new-password",
      };

      const passwordHash = "new-password-hash";

      hashMock.mockResolvedValue(passwordHash as never);
      updateUserMock.mockResolvedValue(undefined);

      const result = await updateProfile(mockedUser.id, input);

      expect(result).toEqual(["password"]);

      expect(validatePasswordMock).toHaveBeenCalledWith(input.password);

      expect(hashMock).toHaveBeenCalledWith(input.password, BCRYPT_SALT_ROUNDS);

      expect(updateUserMock).toHaveBeenCalledWith(mockedUser.id, {
        passwordHash,
      });
    });

    it("should update email and password together", async () => {
      const input: ProfileUpdateInput = {
        email: "new@example.com",
        password: "new-password",
      };

      const currentUser: User = {
        ...mockedUser,
        email: "old@example.com",
      };

      getUserByIdMock.mockResolvedValue(currentUser);
      getUserByEmailMock.mockResolvedValue(undefined);
      hashMock.mockResolvedValue("new-password-hash" as never);
      updateUserMock.mockResolvedValue(undefined);

      const result = await updateProfile(currentUser.id, input);

      expect(result).toEqual(["email", "password"]);

      expect(updateUserMock).toHaveBeenCalledWith(currentUser.id, {
        email: "new@example.com",
        passwordHash: "new-password-hash",
      });
    });

    it("should not update anything when no fields are provided", async () => {
      const input: ProfileUpdateInput = {};

      const result = await updateProfile(mockedUser.id, input);

      expect(result).toEqual([]);

      expect(getUserByIdMock).not.toHaveBeenCalled();
      expect(getUserByEmailMock).not.toHaveBeenCalled();
      expect(hashMock).not.toHaveBeenCalled();
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it("should propagate email validation errors", async () => {
      const input: ProfileUpdateInput = {
        email: "invalid-email",
      };

      validateEmailMock.mockImplementation(() => {
        throw new Error("INVALID_EMAIL");
      });

      await expect(updateProfile(mockedUser.id, input)).rejects.toThrow(
        "INVALID_EMAIL"
      );

      expect(getUserByIdMock).not.toHaveBeenCalled();
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it("should propagate password validation errors", async () => {
      const input: ProfileUpdateInput = {
        password: "short",
      };

      validatePasswordMock.mockImplementation(() => {
        throw new Error("INVALID_PASSWORD");
      });

      await expect(updateProfile(mockedUser.id, input)).rejects.toThrow(
        "INVALID_PASSWORD"
      );

      expect(hashMock).not.toHaveBeenCalled();
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it("should not search for an existing email when the email is unchanged", async () => {
      const input: ProfileUpdateInput = {
        email: mockedUser.email,
      };

      getUserByIdMock.mockResolvedValue(mockedUser);

      await updateProfile(mockedUser.id, input);

      expect(getUserByEmailMock).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      getUserByIdMock.mockRejectedValue(new Error("DynamoDB error"));

      await expect(
        updateProfile(mockedUser.id, {
          email: "new@example.com",
        })
      ).rejects.toThrow("DynamoDB error");
    });
  });
});
