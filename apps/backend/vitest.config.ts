import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      USERS_TABLE_NAME: "test-users-table",
      EXPENSES_TABLE_NAME: "test-expenses-table",
      CATEGORIES_TABLE_NAME: "test-categories-table",
      JWT_SECRET: "test-jwt-secret",
    },
  },
});
