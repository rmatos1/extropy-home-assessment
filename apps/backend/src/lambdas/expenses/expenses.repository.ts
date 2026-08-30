import {
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import type {
  ExpenseRecord,
  DeleteExpenseInput,
  GetExpensesInput,
  UpdateExpenseInput,
} from "@extropy/shared";

import { dynamoDb } from "../../dynamodb";
import { USER_DATE_INDEX_NAME } from "./expenses.constants";

const tableName = process.env.EXPENSES_TABLE_NAME;

if (!tableName) {
  throw new Error("EXPENSES_TABLE_NAME environment variable is not configured");
}

export async function createExpenseRecord(
  expense: ExpenseRecord
): Promise<void> {
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
}: GetExpensesInput): Promise<ExpenseRecord[]> {
  let keyConditionExpression = "userId = :userId";

  const expressionAttributeValues: Record<string, string> = {
    ":userId": userId,
  };

  const expressionAttributeNames: Record<string, string> = {};

  if (startDate || endDate) {
    expressionAttributeNames["#date"] = "date";

    if (startDate) {
      expressionAttributeValues[":startDate"] = startDate;

      if (endDate) {
        keyConditionExpression += " AND #date BETWEEN :startDate AND :endDate";

        expressionAttributeValues[":endDate"] = endDate;
      } else {
        keyConditionExpression += " AND #date >= :startDate";
      }
    } else {
      keyConditionExpression += " AND #date <= :endDate";

      expressionAttributeValues[":endDate"] = endDate;
    }
  }

  const result = await dynamoDb.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: USER_DATE_INDEX_NAME,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ...(Object.keys(expressionAttributeNames).length > 0
        ? { ExpressionAttributeNames: expressionAttributeNames }
        : {}),
    })
  );

  return (result.Items ?? []) as ExpenseRecord[];
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
}: DeleteExpenseInput): Promise<void> {
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
