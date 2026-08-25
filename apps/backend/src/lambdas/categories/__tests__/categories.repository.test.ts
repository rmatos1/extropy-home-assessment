import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCategoryRecord,
  getCategoriesByUserId,
} from "../categories.repository";
import { mockedCategory } from "./mocks";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

vi.mock("../../../dynamodb", () => ({
  dynamoDb: {
    send: sendMock,
  },
}));

describe("categories.repository", () => {
  const { userId } = mockedCategory;

  beforeEach(() => {
    sendMock.mockReset();
  });

  describe("createCategoryRecord", () => {
    it("should create a category", async () => {
      sendMock.mockResolvedValueOnce({});

      await createCategoryRecord(mockedCategory);

      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(PutCommand);
      expect(command.input).toEqual({
        TableName: process.env.CATEGORIES_TABLE_NAME,
        Item: mockedCategory,
        ConditionExpression: "attribute_not_exists(id)",
      });
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValueOnce(error);

      await expect(createCategoryRecord(mockedCategory)).rejects.toThrow(
        "DynamoDB error"
      );
    });
  });

  describe("getCategoriesByUserId", () => {
    it("should return the user's custom categories", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [mockedCategory],
      });

      const result = await getCategoriesByUserId(userId);

      expect(result).toEqual([mockedCategory]);
      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(QueryCommand);
      expect(command.input).toEqual({
        TableName: process.env.CATEGORIES_TABLE_NAME,
        IndexName: "UserIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      });
    });

    it("should return an empty array when the user has no custom categories", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [],
      });

      const result = await getCategoriesByUserId(userId);

      expect(result).toEqual([]);
    });

    it("should return an empty array when Items is undefined", async () => {
      sendMock.mockResolvedValueOnce({});

      const result = await getCategoriesByUserId(userId);

      expect(result).toEqual([]);
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValueOnce(error);

      await expect(getCategoriesByUserId(userId)).rejects.toThrow(
        "DynamoDB error"
      );
    });
  });
});
