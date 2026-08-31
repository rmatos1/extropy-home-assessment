import {
  DeleteCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  DeleteExpenseInput,
  ExpenseRecord,
  GetExpensesInput,
  UpdateExpenseInput,
} from "@extropy/shared";

import { dynamoDb } from "../../../dynamodb";
import { USER_DATE_INDEX_NAME } from "../expenses.constants";
import {
  createExpenseRecord,
  deleteExpenseRecord,
  getExpensesByUserId,
  updateExpenseRecord,
} from "../expenses.repository";

vi.mock("../../../dynamodb", () => ({
  dynamoDb: {
    send: vi.fn(),
  },
}));

const sendMock = vi.mocked(dynamoDb.send);

const tableName = process.env.EXPENSES_TABLE_NAME;

if (!tableName) {
  throw new Error("EXPENSES_TABLE_NAME is not configured for tests");
}

describe("expenses.repository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("createExpenseRecord", () => {
    it("should create an expense record", async () => {
      const expense: ExpenseRecord = {
        id: "expense-123",
        userId: "user-123",
        amount: 142.75,
        description: "Electricity bill",
        categoryId: "bills",
        date: "2026-08-30",
        createdAt: "2026-08-30T10:00:00.000Z",
        updatedAt: "2026-08-30T10:00:00.000Z",
      };

      sendMock.mockResolvedValue({} as never);

      await createExpenseRecord(expense);

      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(PutCommand);
      expect(command.input).toEqual({
        TableName: tableName,
        Item: expense,
      });
    });

    it("should propagate DynamoDB errors", async () => {
      sendMock.mockRejectedValue(new Error("DynamoDB error"));

      await expect(createExpenseRecord({} as ExpenseRecord)).rejects.toThrow(
        "DynamoDB error"
      );
    });
  });

  describe("getExpensesByUserId", () => {
    it("should return all expenses for a user without date filters", async () => {
      const expenses: ExpenseRecord[] = [
        {
          id: "expense-1",
          userId: "user-123",
          amount: 100,
          description: "Food",
          categoryId: "food",
          date: "2026-08-30",
          createdAt: "2026-08-30T10:00:00.000Z",
          updatedAt: "2026-08-30T10:00:00.000Z",
        },
      ];

      sendMock.mockResolvedValue({
        Items: expenses,
      } as never);

      const input: GetExpensesInput = {
        userId: "user-123",
      };

      const result = await getExpensesByUserId(input);

      expect(result).toEqual(expenses);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(QueryCommand);
      expect(command.input).toEqual({
        TableName: tableName,
        IndexName: USER_DATE_INDEX_NAME,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": "user-123",
        },
      });
    });

    it("should filter expenses by start and end dates", async () => {
      sendMock.mockResolvedValue({
        Items: [],
      } as never);

      const input: GetExpensesInput = {
        userId: "user-123",
        startDate: "2026-08-01",
        endDate: "2026-08-31",
      };

      await getExpensesByUserId(input);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(QueryCommand);
      expect(command.input).toEqual({
        TableName: tableName,
        IndexName: USER_DATE_INDEX_NAME,
        KeyConditionExpression:
          "userId = :userId AND #date BETWEEN :startDate AND :endDate",
        ExpressionAttributeNames: {
          "#date": "date",
        },
        ExpressionAttributeValues: {
          ":userId": "user-123",
          ":startDate": "2026-08-01",
          ":endDate": "2026-08-31",
        },
      });
    });

    it("should filter expenses from a start date", async () => {
      sendMock.mockResolvedValue({
        Items: [],
      } as never);

      const input: GetExpensesInput = {
        userId: "user-123",
        startDate: "2026-08-01",
      };

      await getExpensesByUserId(input);

      const command = sendMock.mock.calls[0][0];

      expect(command.input).toEqual({
        TableName: tableName,
        IndexName: USER_DATE_INDEX_NAME,
        KeyConditionExpression: "userId = :userId AND #date >= :startDate",
        ExpressionAttributeNames: {
          "#date": "date",
        },
        ExpressionAttributeValues: {
          ":userId": "user-123",
          ":startDate": "2026-08-01",
        },
      });
    });

    it("should filter expenses until an end date", async () => {
      sendMock.mockResolvedValue({
        Items: [],
      } as never);

      const input: GetExpensesInput = {
        userId: "user-123",
        endDate: "2026-08-31",
      };

      await getExpensesByUserId(input);

      const command = sendMock.mock.calls[0][0];

      expect(command.input).toEqual({
        TableName: tableName,
        IndexName: USER_DATE_INDEX_NAME,
        KeyConditionExpression: "userId = :userId AND #date <= :endDate",
        ExpressionAttributeNames: {
          "#date": "date",
        },
        ExpressionAttributeValues: {
          ":userId": "user-123",
          ":endDate": "2026-08-31",
        },
      });
    });

    it("should return an empty array when DynamoDB does not return Items", async () => {
      sendMock.mockResolvedValue({} as never);

      const result = await getExpensesByUserId({
        userId: "user-123",
      });

      expect(result).toEqual([]);
    });

    it("should propagate DynamoDB errors", async () => {
      sendMock.mockRejectedValue(new Error("DynamoDB error"));

      await expect(
        getExpensesByUserId({
          userId: "user-123",
        })
      ).rejects.toThrow("DynamoDB error");
    });
  });

  describe("updateExpenseRecord", () => {
    const input: UpdateExpenseInput = {
      expenseId: "expense-123",
      userId: "user-123",
      expense: {
        amount: 150.5,
        description: "Updated electricity bill",
        categoryId: "bills",
        date: "2026-08-31",
      },
    };

    it("should update an expense record", async () => {
      sendMock.mockResolvedValue({} as never);

      const before = Date.now();

      await updateExpenseRecord(input);

      const after = Date.now();

      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(UpdateCommand);

      expect(command.input.TableName).toBe(tableName);

      expect(command.input.Key).toEqual({
        id: input.expenseId,
      });

      expect(command.input.UpdateExpression).toBe(
        "SET amount = :amount, description = :description, categoryId = :categoryId, #date = :date, updatedAt = :updatedAt"
      );

      expect(command.input.ExpressionAttributeNames).toEqual({
        "#date": "date",
      });

      expect(command.input.ExpressionAttributeValues).toMatchObject({
        ":amount": input.expense.amount,
        ":description": input.expense.description,
        ":categoryId": input.expense.categoryId,
        ":date": input.expense.date,
        ":userId": input.userId,
      });

      const updatedAt = command.input.ExpressionAttributeValues?.[
        ":updatedAt"
      ] as string;

      expect(new Date(updatedAt).getTime()).toBeGreaterThanOrEqual(before);
      expect(new Date(updatedAt).getTime()).toBeLessThanOrEqual(after);

      expect(command.input.ConditionExpression).toBe("userId = :userId");
    });

    it("should propagate DynamoDB errors", async () => {
      sendMock.mockRejectedValue(new Error("DynamoDB error"));

      await expect(updateExpenseRecord(input)).rejects.toThrow(
        "DynamoDB error"
      );
    });
  });

  describe("deleteExpenseRecord", () => {
    const input: DeleteExpenseInput = {
      expenseId: "expense-123",
      userId: "user-123",
    };

    it("should delete an expense belonging to the user", async () => {
      sendMock.mockResolvedValue({} as never);

      await deleteExpenseRecord(input);

      expect(sendMock).toHaveBeenCalledTimes(1);

      const command = sendMock.mock.calls[0][0];

      expect(command).toBeInstanceOf(DeleteCommand);

      expect(command.input).toEqual({
        TableName: tableName,
        Key: {
          id: input.expenseId,
        },
        ConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": input.userId,
        },
      });
    });

    it("should propagate DynamoDB errors", async () => {
      sendMock.mockRejectedValue(new Error("DynamoDB error"));

      await expect(deleteExpenseRecord(input)).rejects.toThrow(
        "DynamoDB error"
      );
    });
  });
});
