import {
  DeleteCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createExpenseRecord,
  deleteExpenseRecord,
  getExpensesByUserId,
  updateExpenseRecord,
} from "../expenses.repository";
import { mockedExpense, dates, mockedUpdateExpense } from "./mocks";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

vi.mock("../../../dynamodb", () => ({
  dynamoDb: {
    send: sendMock,
  },
}));

describe("expenses.repository", () => {
  const { id, userId } = mockedExpense;

  beforeEach(() => {
    sendMock.mockReset();
  });

  describe("createExpenseRecord", () => {
    it("should create an expense", async () => {
      sendMock.mockResolvedValueOnce({});

      await createExpenseRecord(mockedExpense);

      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(PutCommand);
      expect(command.input).toEqual({
        TableName: process.env.EXPENSES_TABLE_NAME,
        Item: mockedExpense,
      });
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValueOnce(error);

      await expect(createExpenseRecord(mockedExpense)).rejects.toThrow(
        "DynamoDB error"
      );
    });
  });

  describe("getExpensesByUserId", () => {
    it("should return all expenses for a user", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [mockedExpense],
      });

      const result = await getExpensesByUserId({
        userId,
      });

      expect(result).toEqual([mockedExpense]);
      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(QueryCommand);
      expect(command.input).toEqual({
        TableName: process.env.EXPENSES_TABLE_NAME,
        IndexName: "UserDateIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeNames: {
          "#date": "date",
        },
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      });
    });

    it("should return expenses within a date range", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [mockedExpense],
      });

      const result = await getExpensesByUserId({
        userId,
        startDate: dates.start,
        endDate: dates.end,
      });

      expect(result).toEqual([mockedExpense]);

      const command = sendMock.mock.calls[0][0];

      expect(command.input).toEqual({
        TableName: process.env.EXPENSES_TABLE_NAME,
        IndexName: "UserDateIndex",
        KeyConditionExpression:
          "userId = :userId AND #date BETWEEN :startDate AND :endDate",
        ExpressionAttributeNames: {
          "#date": "date",
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":startDate": dates.start,
          ":endDate": dates.end,
        },
      });
    });

    it("should return expenses from a start date onwards", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [mockedExpense],
      });

      const result = await getExpensesByUserId({
        userId,
        startDate: dates.start,
      });

      expect(result).toEqual([mockedExpense]);

      const command = sendMock.mock.calls[0][0];

      expect(command.input).toEqual({
        TableName: process.env.EXPENSES_TABLE_NAME,
        IndexName: "UserDateIndex",
        KeyConditionExpression: "userId = :userId AND #date >= :startDate",
        ExpressionAttributeNames: {
          "#date": "date",
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":startDate": dates.start,
        },
      });
    });

    it("should return expenses up to an end date", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [mockedExpense],
      });

      const result = await getExpensesByUserId({
        userId,
        endDate: dates.end,
      });

      expect(result).toEqual([mockedExpense]);

      const command = sendMock.mock.calls[0][0];

      expect(command.input).toEqual({
        TableName: process.env.EXPENSES_TABLE_NAME,
        IndexName: "UserDateIndex",
        KeyConditionExpression: "userId = :userId AND #date <= :endDate",
        ExpressionAttributeNames: {
          "#date": "date",
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":endDate": dates.end,
        },
      });
    });

    it("should return an empty array when no expenses are found", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [],
      });

      const result = await getExpensesByUserId({
        userId,
      });

      expect(result).toEqual([]);
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValueOnce(error);

      await expect(
        getExpensesByUserId({
          userId,
        })
      ).rejects.toThrow("DynamoDB error");
    });
  });

  describe("updateExpenseRecord", () => {
    it("should update an expense only when it belongs to the user", async () => {
      sendMock.mockResolvedValueOnce({});

      const { amount, description, categoryId, date } = mockedUpdateExpense;

      await updateExpenseRecord({
        expenseId: id,
        userId,
        expense: {
          amount,
          description,
          categoryId,
          date,
        },
      });

      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(UpdateCommand);

      expect(command.input.TableName).toBe(process.env.EXPENSES_TABLE_NAME);

      expect(command.input.Key).toEqual({
        id,
      });

      expect(command.input.ConditionExpression).toBe("userId = :userId");

      expect(command.input.ExpressionAttributeNames).toEqual({
        "#date": "date",
      });

      expect(command.input.ExpressionAttributeValues).toMatchObject({
        ":amount": amount,
        ":description": description,
        ":categoryId": categoryId,
        ":date": date,
        ":userId": userId,
      });

      expect(command.input.UpdateExpression).toBe(
        "SET amount = :amount, description = :description, categoryId = :categoryId, #date = :date, updatedAt = :updatedAt"
      );

      expect(command.input.ExpressionAttributeValues[":updatedAt"]).toEqual(
        expect.any(String)
      );
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValueOnce(error);

      await expect(
        updateExpenseRecord({
          expenseId: id,
          userId,
          expense: {
            amount: mockedUpdateExpense.amount,
            description: mockedUpdateExpense.description,
            categoryId: mockedUpdateExpense.categoryId,
            date: mockedUpdateExpense.date,
          },
        })
      ).rejects.toThrow("DynamoDB error");
    });
  });

  describe("deleteExpenseRecord", () => {
    it("should delete an expense only when it belongs to the user", async () => {
      sendMock.mockResolvedValueOnce({});

      await deleteExpenseRecord({
        expenseId: id,
        userId,
      });

      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(DeleteCommand);
      expect(command.input).toEqual({
        TableName: process.env.EXPENSES_TABLE_NAME,
        Key: {
          id,
        },
        ConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      });
    });

    it("should propagate DynamoDB errors", async () => {
      const error = new Error("DynamoDB error");

      sendMock.mockRejectedValueOnce(error);

      await expect(
        deleteExpenseRecord({
          expenseId: id,
          userId,
        })
      ).rejects.toThrow("DynamoDB error");
    });
  });
});
