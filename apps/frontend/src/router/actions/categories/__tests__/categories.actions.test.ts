import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCategory } from "../../../../services";

import { createCategoryAction } from "../";

vi.mock("../../../../services", () => ({
  createCategory: vi.fn(),
}));

const createCategoryMock = vi.mocked(createCategory);

describe("createCategoryAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const createRequest = (categoryName?: string) => {
    const formData = new FormData();

    if (categoryName !== undefined) {
      formData.set("categoryName", categoryName);
    }

    return new Request("http://localhost", {
      method: "POST",
      body: formData,
    });
  };

  it("should create a category and return a success response", async () => {
    createCategoryMock.mockResolvedValue({
      id: "category-123",
      name: "Food",
    });

    const result = await createCategoryAction({
      request: createRequest("Food"),
    } as never);

    expect(createCategoryMock).toHaveBeenCalledTimes(1);
    expect(createCategoryMock).toHaveBeenCalledWith("Food");

    expect(result).toEqual({
      success: true,
      message: "Category added successfully!",
    });
  });

  it("should trim the category name before creating it", async () => {
    createCategoryMock.mockResolvedValue({
      id: "category-123",
      name: "Food",
    });

    await createCategoryAction({
      request: createRequest("  Food  "),
    } as never);

    expect(createCategoryMock).toHaveBeenCalledWith("Food");
  });

  it("should use an empty string when categoryName is missing", async () => {
    createCategoryMock.mockResolvedValue({
      id: "category-123",
      name: "Food",
    });

    await createCategoryAction({
      request: createRequest(),
    } as never);

    expect(createCategoryMock).toHaveBeenCalledWith("");
  });

  it("should return the service error response", async () => {
    const errorResponse = {
      error: "Invalid category name",
    };

    createCategoryMock.mockResolvedValue(errorResponse);

    const result = await createCategoryAction({
      request: createRequest(""),
    } as never);

    expect(createCategoryMock).toHaveBeenCalledWith("");
    expect(result).toEqual(errorResponse);
  });

  it("should return the exact service error without transforming it", async () => {
    const errorResponse = {
      error: "CATEGORY_ALREADY_EXISTS",
    };

    createCategoryMock.mockResolvedValue(errorResponse);

    const result = await createCategoryAction({
      request: createRequest("Food"),
    } as never);

    expect(result).toBe(errorResponse);
  });

  it("should return the same success response regardless of the created category data", async () => {
    createCategoryMock.mockResolvedValue({
      id: "category-456",
      name: "Transport",
    });

    const result = await createCategoryAction({
      request: createRequest("Transport"),
    } as never);

    expect(result).toEqual({
      success: true,
      message: "Category added successfully!",
    });
  });
});
