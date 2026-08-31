const serverlessConfiguration = {
  service: "extropy-home-assessment-backend",

  frameworkVersion: "4",

  plugins: ["serverless-offline"],

  provider: {
    name: "aws",
    runtime: "nodejs22.x",
    region: "us-east-1",

    environment: {
      USERS_TABLE_NAME: "extropy-users",
      EXPENSES_TABLE_NAME: "extropy-expenses",
      CATEGORIES_TABLE_NAME: "extropy-categories",

      JWT_SECRET: "${env:JWT_SECRET}",
      OPENAI_API_KEY: "${env:OPENAI_API_KEY}",
    },

    httpApi: {
      cors: {
        allowedOrigins: [
          "http://localhost:5173",
          "https://extropy-home-assessment.vercel.app",
          "https://extropy-home-assessment-miwmphorv-roberiomatos-projects.vercel.app",
        ],
        allowedHeaders: ["Content-Type"],
        allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowCredentials: true,
      },
    },

    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
              "dynamodb:Query",
            ],
            Resource: [
              {
                "Fn::GetAtt": ["UsersTable", "Arn"],
              },
              {
                "Fn::Join": [
                  "/",
                  [
                    {
                      "Fn::GetAtt": ["UsersTable", "Arn"],
                    },
                    "index",
                    "EmailIndex",
                  ],
                ],
              },
              {
                "Fn::GetAtt": ["ExpensesTable", "Arn"],
              },
              {
                "Fn::Join": [
                  "/",
                  [
                    {
                      "Fn::GetAtt": ["ExpensesTable", "Arn"],
                    },
                    "index",
                    "UserDateIndex",
                  ],
                ],
              },
              {
                "Fn::GetAtt": ["CategoriesTable", "Arn"],
              },
              {
                "Fn::Join": [
                  "/",
                  [
                    {
                      "Fn::GetAtt": ["CategoriesTable", "Arn"],
                    },
                    "index",
                    "UserIndex",
                  ],
                ],
              },
            ],
          },
        ],
      },
    },
  },

  build: {
    esbuild: {
      format: "cjs",
      outExtension: {
        ".js": ".cjs",
      },
    },
  },

  functions: {
    auth: {
      handler: "src/lambdas/auth/index.handler",
      events: [
        { httpApi: { method: "GET", path: "/auth/me" } },
        { httpApi: { method: "PATCH", path: "/auth/me" } },
        { httpApi: { method: "POST", path: "/auth/signup" } },
        { httpApi: { method: "POST", path: "/auth/login" } },
        { httpApi: { method: "POST", path: "/auth/logout" } },
      ],
    },

    expenses: {
      handler: "src/lambdas/expenses/index.handler",
      events: [
        { httpApi: { method: "GET", path: "/expenses" } },
        { httpApi: { method: "POST", path: "/expenses" } },
        { httpApi: { method: "PUT", path: "/expenses/{id}" } },
        { httpApi: { method: "DELETE", path: "/expenses/{id}" } },
        {
          httpApi: {
            method: "POST",
            path: "/expenses/suggest-category",
          },
        },
      ],
    },

    categories: {
      handler: "src/lambdas/categories/index.handler",
      events: [
        { httpApi: { method: "GET", path: "/categories" } },
        { httpApi: { method: "POST", path: "/categories" } },
      ],
    },

    spendingReport: {
      handler: "src/lambdas/reports/index.handler",
      events: [{ httpApi: { method: "GET", path: "/spending-report" } }],
    },
  },

  resources: {
    Resources: {
      UsersTable: {
        Type: "AWS::DynamoDB::Table",

        Properties: {
          TableName: "extropy-users",
          BillingMode: "PAY_PER_REQUEST",

          PointInTimeRecoverySpecification: {
            PointInTimeRecoveryEnabled: true,
          },

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

          PointInTimeRecoverySpecification: {
            PointInTimeRecoveryEnabled: true,
          },

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

          PointInTimeRecoverySpecification: {
            PointInTimeRecoveryEnabled: true,
          },

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
