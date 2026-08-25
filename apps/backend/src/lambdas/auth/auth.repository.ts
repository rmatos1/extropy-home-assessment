import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

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
