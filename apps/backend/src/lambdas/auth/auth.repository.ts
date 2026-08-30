import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import type { User } from "@extropy/shared";

import { dynamoDb } from "../../dynamodb";
import { EMAIL_INDEX_NAME } from "./auth.constants";

const tableName = process.env.USERS_TABLE_NAME;

if (!tableName) {
  throw new Error("USERS_TABLE_NAME environment variable is not configured");
}

export async function createUser(user: User): Promise<void> {
  await dynamoDb.send(
    new PutCommand({
      TableName: tableName,
      Item: user,
      ConditionExpression: "attribute_not_exists(id)",
    })
  );
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await dynamoDb.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: EMAIL_INDEX_NAME,
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
      Limit: 1,
    })
  );

  return result.Items?.[0] as User | undefined;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const result = await dynamoDb.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        id,
      },
    })
  );

  return result.Item as User | undefined;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, "email" | "passwordHash">>
): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, string> = {};

  if (data.email) {
    updateExpressions.push("email = :email");
    expressionAttributeValues[":email"] = data.email;
  }

  if (data.passwordHash) {
    updateExpressions.push("passwordHash = :passwordHash");
    expressionAttributeValues[":passwordHash"] = data.passwordHash;
  }

  updateExpressions.push("updatedAt = :updatedAt");
  expressionAttributeValues[":updatedAt"] = new Date().toISOString();

  await dynamoDb.send(
    new UpdateCommand({
      TableName: tableName,
      Key: {
        id,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: "attribute_exists(id)",
    })
  );
}
