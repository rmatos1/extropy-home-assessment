import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUser, getUserByEmail, getUserById } from "../auth.repository";
import { mockedUser } from "./mocks";

const { TEST_TABLE, sendMock } = vi.hoisted(() => {
  const TEST_TABLE = "test-users-table";
  process.env.USERS_TABLE_NAME = TEST_TABLE;

  return {
    TEST_TABLE,
    sendMock: vi.fn(),
  };
});

vi.mock("../../../dynamodb", () => ({
  dynamoDb: {
    send: sendMock,
  },
}));

describe("repository", () => {
  const { id, email } = mockedUser;

  beforeEach(() => {
    sendMock.mockReset();
  });

  describe("createUser", () => {
    it("should create a user", async () => {
      sendMock.mockResolvedValueOnce({});

      await createUser(mockedUser);

      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(PutCommand);
      expect(command.input).toEqual({
        TableName: TEST_TABLE,
        Item: mockedUser,
        ConditionExpression: "attribute_not_exists(id)",
      });
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValueOnce(error);

      await expect(createUser(mockedUser)).rejects.toThrow("DynamoDB error");
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user when found", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [mockedUser],
      });

      const result = await getUserByEmail(email);

      expect(result).toEqual(mockedUser);
      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(QueryCommand);
      expect(command.input).toEqual({
        TableName: TEST_TABLE,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
        Limit: 1,
      });
    });

    it("should return undefined when the user is not found", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [],
      });

      const result = await getUserByEmail("unknown@example.com");

      expect(result).toBeUndefined();
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValueOnce(error);

      await expect(getUserByEmail(email)).rejects.toThrow("DynamoDB error");
    });
  });

  describe("getUserById", () => {
    it("should return a user when found", async () => {
      sendMock.mockResolvedValueOnce({
        Item: mockedUser,
      });

      const result = await getUserById(id);

      expect(result).toEqual(mockedUser);
      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(GetCommand);
      expect(command.input).toEqual({
        TableName: TEST_TABLE,
        Key: {
          id,
        },
      });
    });

    it("should return undefined when the user is not found", async () => {
      sendMock.mockResolvedValueOnce({});

      const result = await getUserById("unknown-user");

      expect(result).toBeUndefined();
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValueOnce(error);

      await expect(getUserById(id)).rejects.toThrow("DynamoDB error");
    });
  });
});
