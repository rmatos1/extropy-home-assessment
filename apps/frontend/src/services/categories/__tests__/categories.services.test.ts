import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCategories, createCategory } from "../";

const { apiMock, setCategoriesMock, addCategoryMock, getStateMock } =
  vi.hoisted(() => ({
    apiMock: vi.fn(),
    setCategoriesMock: vi.fn(),
    addCategoryMock: vi.fn(),
    getStateMock: vi.fn(),
  }));

vi.mock("../../api", () => ({
  api: apiMock,
}));

vi.mock("../../../store", () => ({
  useCategoriesStore: {
    getState: getStateMock,
  },
}));

describe("categories services", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    getStateMock.mockReturnValue({
      categories: [],
      setCategories: setCategoriesMock,
      addCategory: addCategoryMock,
    });
  });

  describe("getCategories", () => {
    it("should return categories from the store when the cache is not empty", async () => {
      const categories = [
        {
          id: "food",
          name: "Food",
        },
        {
          id: "transport",
          name: "Transport",
        },
      ];

      getStateMock.mockReturnValue({
        categories,
        setCategories: setCategoriesMock,
        addCategory: addCategoryMock,
      });

      const result = await getCategories();

      expect(result).toEqual(categories);
      expect(apiMock).not.toHaveBeenCalled();
    });

    it("should request categories from the API when the cache is empty", async () => {
      const categories = [
        {
          id: "food",
          name: "Food",
        },
      ];

      apiMock.mockResolvedValue(categories);

      const result = await getCategories();

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/categories", {
        method: "GET",
      });

      expect(result).toEqual(categories);
    });

    it("should store categories returned by the API", async () => {
      const categories = [
        {
          id: "food",
          name: "Food",
        },
      ];

      apiMock.mockResolvedValue(categories);

      await getCategories();

      expect(setCategoriesMock).toHaveBeenCalledTimes(1);
      expect(setCategoriesMock).toHaveBeenCalledWith(categories);
    });

    it("should return the exact response from the API", async () => {
      const categories = [
        {
          id: "food",
          name: "Food",
        },
      ];

      apiMock.mockResolvedValue(categories);

      const result = await getCategories();

      expect(result).toBe(categories);
    });

    it("should not update the store when categories already exist in the cache", async () => {
      const categories = [
        {
          id: "food",
          name: "Food",
        },
      ];

      getStateMock.mockReturnValue({
        categories,
        setCategories: setCategoriesMock,
        addCategory: addCategoryMock,
      });

      await getCategories();

      expect(setCategoriesMock).not.toHaveBeenCalled();
    });

    it("should propagate API errors", async () => {
      const error = new Error("Unable to load categories");

      apiMock.mockRejectedValue(error);

      await expect(getCategories()).rejects.toBe(error);

      expect(setCategoriesMock).not.toHaveBeenCalled();
    });
  });

  describe("createCategory", () => {
    it("should create a category using POST", async () => {
      const category = {
        id: "food",
        name: "Food",
      };

      apiMock.mockResolvedValue(category);

      const result = await createCategory("Food");

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/categories", {
        method: "POST",
        body: JSON.stringify({
          categoryName: "Food",
        }),
      });

      expect(result).toEqual(category);
    });

    it("should add the created category to the store", async () => {
      const category = {
        id: "food",
        name: "Food",
      };

      apiMock.mockResolvedValue(category);

      await createCategory("Food");

      expect(addCategoryMock).toHaveBeenCalledTimes(1);
      expect(addCategoryMock).toHaveBeenCalledWith(category);
    });

    it("should return the created category", async () => {
      const category = {
        id: "food",
        name: "Food",
      };

      apiMock.mockResolvedValue(category);

      const result = await createCategory("Food");

      expect(result).toBe(category);
    });

    it("should send the exact category name provided", async () => {
      const category = {
        id: "food",
        name: "Food",
      };

      apiMock.mockResolvedValue(category);

      await createCategory("  Food  ");

      expect(apiMock).toHaveBeenCalledWith("/categories", {
        method: "POST",
        body: JSON.stringify({
          categoryName: "  Food  ",
        }),
      });
    });

    it("should propagate API errors", async () => {
      const error = new Error("Category already exists");

      apiMock.mockRejectedValue(error);

      await expect(createCategory("Food")).rejects.toBe(error);

      expect(addCategoryMock).not.toHaveBeenCalled();
    });
  });
});
