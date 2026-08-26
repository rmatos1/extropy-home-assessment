const serverlessConfiguration = {
  service: "extropy-home-assessment-backend",

  frameworkVersion: "4",

  provider: {
    name: "aws",
    runtime: "nodejs22.x",
    region: "us-east-1",
  },

  functions: {
    auth: {
      handler: "src/lambdas/auth/index.handler",
      events: [
        {
          httpApi: {
            method: "GET",
            path: "/auth/me",
          },
        },
        {
          httpApi: {
            method: "POST",
            path: "/auth/signup",
          },
        },
        {
          httpApi: {
            method: "POST",
            path: "/auth/login",
          },
        },
      ],
    },
  },

  resources: {
    Resources: {
      UsersTable: {
        Type: "AWS::DynamoDB::Table",

        Properties: {
          TableName: "extropy-users",
          BillingMode: "PAY_PER_REQUEST",

          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
            {
              AttributeName: "email",
              AttributeType: "S",
            },
          ],

          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],

          GlobalSecondaryIndexes: [
            {
              IndexName: "EmailIndex",

              KeySchema: [
                {
                  AttributeName: "email",
                  KeyType: "HASH",
                },
              ],

              Projection: {
                ProjectionType: "INCLUDE",
                NonKeyAttributes: ["passwordHash"],
              },
            },
          ],
        },
      },

      ExpensesTable: {
        Type: "AWS::DynamoDB::Table",

        Properties: {
          TableName: "extropy-expenses",
          BillingMode: "PAY_PER_REQUEST",

          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
            {
              AttributeName: "userId",
              AttributeType: "S",
            },
            {
              AttributeName: "date",
              AttributeType: "S",
            },
          ],

          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],

          GlobalSecondaryIndexes: [
            {
              IndexName: "UserDateIndex",

              KeySchema: [
                {
                  AttributeName: "userId",
                  KeyType: "HASH",
                },
                {
                  AttributeName: "date",
                  KeyType: "RANGE",
                },
              ],

              Projection: {
                ProjectionType: "INCLUDE",
                NonKeyAttributes: ["amount", "description", "categoryId"],
              },
            },
          ],
        },
      },

      CategoriesTable: {
        Type: "AWS::DynamoDB::Table",

        Properties: {
          TableName: "extropy-categories",
          BillingMode: "PAY_PER_REQUEST",

          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
            {
              AttributeName: "userId",
              AttributeType: "S",
            },
          ],

          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],

          GlobalSecondaryIndexes: [
            {
              IndexName: "UserIndex",

              KeySchema: [
                {
                  AttributeName: "userId",
                  KeyType: "HASH",
                },
              ],

              Projection: {
                ProjectionType: "INCLUDE",
                NonKeyAttributes: ["name"],
              },
            },
          ],
        },
      },
    },
  },
};

export default serverlessConfiguration;
