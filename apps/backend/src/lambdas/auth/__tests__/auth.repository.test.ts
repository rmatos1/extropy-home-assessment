import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@extropy/shared";

import { dynamoDb } from "../../../dynamodb";
import { EMAIL_INDEX_NAME } from "../auth.constants";
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from "../auth.repository";
import { mockedUser } from "./mocks";

vi.mock("../../../dynamodb", () => ({
  dynamoDb: {
    send: vi.fn(),
  },
}));

const sendMock = vi.mocked(dynamoDb.send);

const tableName = process.env.USERS_TABLE_NAME;

if (!tableName) {
  throw new Error("USERS_TABLE_NAME is not configured for tests");
}

describe("auth.repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a user", async () => {
      const user: User = {
        ...mockedUser,
      };

      sendMock.mockResolvedValue({} as never);

      await createUser(user);

      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(PutCommand);
      expect(command.input).toEqual({
        TableName: tableName,
        Item: user,
        ConditionExpression: "attribute_not_exists(id)",
      });
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValue(error);

      await expect(createUser(mockedUser)).rejects.toThrow("DynamoDB error");
    });
  });

  describe("getUserByEmail", () => {
    it("should return the user when found", async () => {
      sendMock.mockResolvedValue({
        Items: [mockedUser],
      } as never);

      const result = await getUserByEmail(mockedUser.email);

      expect(result).toEqual(mockedUser);
      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(QueryCommand);
      expect(command.input).toEqual({
        TableName: tableName,
        IndexName: EMAIL_INDEX_NAME,
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": mockedUser.email,
        },
        Limit: 1,
      });
    });

    it("should return undefined when the user is not found", async () => {
      sendMock.mockResolvedValue({
        Items: [],
      } as never);

      const result = await getUserByEmail("unknown@example.com");

      expect(result).toBeUndefined();
    });

    it("should return undefined when DynamoDB does not return Items", async () => {
      sendMock.mockResolvedValue({} as never);

      const result = await getUserByEmail(mockedUser.email);

      expect(result).toBeUndefined();
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValue(error);

      await expect(getUserByEmail(mockedUser.email)).rejects.toThrow(
        "DynamoDB error"
      );
    });
  });

  describe("getUserById", () => {
    it("should return the user when found", async () => {
      sendMock.mockResolvedValue({
        Item: mockedUser,
      } as never);

      const result = await getUserById(mockedUser.id);

      expect(result).toEqual(mockedUser);
      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(GetCommand);
      expect(command.input).toEqual({
        TableName: tableName,
        Key: {
          id: mockedUser.id,
        },
      });
    });

    it("should return undefined when the user is not found", async () => {
      sendMock.mockResolvedValue({} as never);

      const result = await getUserById("unknown-id");

      expect(result).toBeUndefined();
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValue(error);

      await expect(getUserById(mockedUser.id)).rejects.toThrow(
        "DynamoDB error"
      );
    });
  });

  describe("updateUser", () => {
    it("should update email", async () => {
      sendMock.mockResolvedValue({} as never);

      const before = Date.now();

      await updateUser(mockedUser.id, {
        email: "new-email@example.com",
      });

      const after = Date.now();

      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(UpdateCommand);

      expect(command.input.TableName).toBe(tableName);
      expect(command.input.Key).toEqual({
        id: mockedUser.id,
      });
      expect(command.input.UpdateExpression).toBe(
        "SET email = :email, updatedAt = :updatedAt"
      );
      expect(command.input.ExpressionAttributeValues).toMatchObject({
        ":email": "new-email@example.com",
      });

      const updatedAt = command.input.ExpressionAttributeValues?.[
        ":updatedAt"
      ] as string;

      expect(new Date(updatedAt).getTime()).toBeGreaterThanOrEqual(before);
      expect(new Date(updatedAt).getTime()).toBeLessThanOrEqual(after);

      expect(command.input.ConditionExpression).toBe("attribute_exists(id)");
    });

    it("should update password hash", async () => {
      sendMock.mockResolvedValue({} as never);

      await updateUser(mockedUser.id, {
        passwordHash: "new-password-hash",
      });

      const command = sendMock.mock.calls[0][0];

      expect(command.input.UpdateExpression).toBe(
        "SET passwordHash = :passwordHash, updatedAt = :updatedAt"
      );

      expect(command.input.ExpressionAttributeValues).toMatchObject({
        ":passwordHash": "new-password-hash",
      });
    });

    it("should update email and password hash together", async () => {
      sendMock.mockResolvedValue({} as never);

      await updateUser(mockedUser.id, {
        email: "new-email@example.com",
        passwordHash: "new-password-hash",
      });

      const command = sendMock.mock.calls[0][0];

      expect(command.input.UpdateExpression).toBe(
        "SET email = :email, passwordHash = :passwordHash, updatedAt = :updatedAt"
      );

      expect(command.input.ExpressionAttributeValues).toMatchObject({
        ":email": "new-email@example.com",
        ":passwordHash": "new-password-hash",
      });

      expect(command.input.ExpressionAttributeValues?.[":updatedAt"]).toEqual(
        expect.any(String)
      );
    });

    it("should update only updatedAt when no optional fields are provided", async () => {
      sendMock.mockResolvedValue({} as never);

      await updateUser(mockedUser.id, {});

      const command = sendMock.mock.calls[0][0];

      expect(command.input.UpdateExpression).toBe("SET updatedAt = :updatedAt");

      expect(command.input.ExpressionAttributeValues).toEqual({
        ":updatedAt": expect.any(String),
      });

      expect(command.input.ConditionExpression).toBe("attribute_exists(id)");
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValue(error);

      await expect(
        updateUser(mockedUser.id, {
          email: "new-email@example.com",
        })
      ).rejects.toThrow("DynamoDB error");
    });
  });
});
