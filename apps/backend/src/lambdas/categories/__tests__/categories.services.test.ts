import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_CATEGORIES } from "../categories.constants";
import { createCategory, getCategories } from "../categories.services";
import { mockedCategory } from "./mocks";

const { createCategoryRecordMock, getCategoriesByUserIdMock } = vi.hoisted(
  () => ({
    createCategoryRecordMock: vi.fn(),
    getCategoriesByUserIdMock: vi.fn(),
  })
);

vi.mock("../categories.repository", () => ({
  createCategoryRecord: createCategoryRecordMock,
  getCategoriesByUserId: getCategoriesByUserIdMock,
}));

describe("categories.services", () => {
  const { userId, name } = mockedCategory;

  beforeEach(() => {
    createCategoryRecordMock.mockReset();
    getCategoriesByUserIdMock.mockReset();
  });

  describe("createCategory", () => {
    it("should create a custom category", async () => {
      createCategoryRecordMock.mockResolvedValueOnce(undefined);

      const result = await createCategory(userId, "  Gym  ");

      expect(result).toMatchObject({
        name: "Gym",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(result.id).toEqual(expect.any(String));

      expect(createCategoryRecordMock).toHaveBeenCalledTimes(1);
      expect(createCategoryRecordMock).toHaveBeenCalledWith({
        ...result,
        userId,
      });
    });

    it("should trim the category name before saving", async () => {
      createCategoryRecordMock.mockResolvedValueOnce(undefined);

      const result = await createCategory(userId, "   Gym   ");

      expect(result.name).toBe("Gym");

      expect(createCategoryRecordMock).toHaveBeenCalledWith({
        ...result,
        userId,
      });
    });

    it("should reject an empty category name", async () => {
      await expect(createCategory(userId, "   ")).rejects.toThrow(
        "INVALID_CATEGORY_NAME"
      );

      expect(createCategoryRecordMock).not.toHaveBeenCalled();
    });
  });

  describe("getCategories", () => {
    it("should return default and custom categories sorted by name", async () => {
      const customCategory = {
        ...mockedCategory,
        id: "category-456",
        name: "Travel",
      };

      getCategoriesByUserIdMock.mockResolvedValueOnce([
        {
          ...mockedCategory,
          name,
        },
        customCategory,
      ]);

      const result = await getCategories(mockedCategory.userId);

      expect(result).toEqual(
        [
          ...DEFAULT_CATEGORIES,
          {
            ...mockedCategory,
            name,
          },
          customCategory,
        ].sort((a, b) => a.name.localeCompare(b.name))
      );

      expect(getCategoriesByUserIdMock).toHaveBeenCalledTimes(1);
      expect(getCategoriesByUserIdMock).toHaveBeenCalledWith(userId);
    });

    it("should return only default categories when the user has no custom categories", async () => {
      getCategoriesByUserIdMock.mockResolvedValueOnce([]);

      const result = await getCategories(userId);

      expect(result).toEqual(
        [...DEFAULT_CATEGORIES].sort((a, b) => a.name.localeCompare(b.name))
      );

      expect(getCategoriesByUserIdMock).toHaveBeenCalledWith(userId);
    });

    it("should propagate repository errors", async () => {
      getCategoriesByUserIdMock.mockRejectedValueOnce(
        new Error("DynamoDB error")
      );

      await expect(getCategories(userId)).rejects.toThrow("DynamoDB error");
    });
  });
});
