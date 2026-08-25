import {
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import type { Expense } from "@extropy/shared";

import { dynamoDb } from "../../dynamodb";
import { USER_DATE_INDEX_NAME } from "./expenses.constants";
import { ExpenseUserIdDatesInput, UpdateExpenseInput } from "./expenses.types";

const tableName = process.env.EXPENSES_TABLE_NAME;

if (!tableName) {
  throw new Error("EXPENSES_TABLE_NAME environment variable is not configured");
}

export async function createExpenseRecord(expense: Expense): Promise<void> {
  await dynamoDb.send(
    new PutCommand({
      TableName: tableName,
      Item: expense,
    })
  );
}

export async function getExpensesByUserId({
  userId,
  startDate,
  endDate,
}: ExpenseUserIdDatesInput): Promise<Expense[]> {
  let keyConditionExpression = "userId = :userId";

  const expressionAttributeValues: Record<string, string> = {
    ":userId": userId,
  };

  if (startDate && endDate) {
    keyConditionExpression += " AND #date BETWEEN :startDate AND :endDate";

    expressionAttributeValues[":startDate"] = startDate;
    expressionAttributeValues[":endDate"] = endDate;
  } else if (startDate) {
    keyConditionExpression += " AND #date >= :startDate";

    expressionAttributeValues[":startDate"] = startDate;
  } else if (endDate) {
    keyConditionExpression += " AND #date <= :endDate";

    expressionAttributeValues[":endDate"] = endDate;
  }

  const result = await dynamoDb.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: USER_DATE_INDEX_NAME,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: {
        "#date": "date",
      },
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );

  return (result.Items ?? []) as Expense[];
}

export async function updateExpenseRecord({
  expenseId,
  userId,
  expense,
}: UpdateExpenseInput): Promise<void> {
  await dynamoDb.send(
    new UpdateCommand({
      TableName: tableName,
      Key: {
        id: expenseId,
      },
      UpdateExpression:
        "SET amount = :amount, description = :description, categoryId = :categoryId, #date = :date, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#date": "date",
      },
      ExpressionAttributeValues: {
        ":amount": expense.amount,
        ":description": expense.description,
        ":categoryId": expense.categoryId,
        ":date": expense.date,
        ":updatedAt": new Date().toISOString(),
        ":userId": userId,
      },
      ConditionExpression: "userId = :userId",
    })
  );
}

export async function deleteExpenseRecord({
  expenseId,
  userId,
}: {
  expenseId: string;
  userId: string;
}): Promise<void> {
  await dynamoDb.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        id: expenseId,
      },
      ConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    })
  );
}
