import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import type { CustomCategory } from "@extropy/shared";

import { dynamoDb } from "../../dynamodb";
import { USER_INDEX_NAME } from "./categories.constants";

const tableName = process.env.CATEGORIES_TABLE_NAME;

if (!tableName) {
  throw new Error(
    "CATEGORIES_TABLE_NAME environment variable is not configured"
  );
}

export async function createCategoryRecord(
  category: CustomCategory
): Promise<void> {
  await dynamoDb.send(
    new PutCommand({
      TableName: tableName,
      Item: category,
      ConditionExpression: "attribute_not_exists(id)",
    })
  );
}

export async function getCategoriesByUserId(
  userId: string
): Promise<CustomCategory[]> {
  const result = await dynamoDb.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: USER_INDEX_NAME,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    })
  );

  return (result.Items ?? []) as CustomCategory[];
}
