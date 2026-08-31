import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCategory } from "../../../../services";

import { createCategoryAction } from "../";
import { mockedCategory, mockedCategory2 } from "./mocks";

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
    createCategoryMock.mockResolvedValue(mockedCategory);

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
    createCategoryMock.mockResolvedValue(mockedCategory);

    await createCategoryAction({
      request: createRequest("  Food  "),
    } as never);

    expect(createCategoryMock).toHaveBeenCalledWith("Food");
  });

  it("should use an empty string when categoryName is missing", async () => {
    createCategoryMock.mockResolvedValue(mockedCategory);

    await createCategoryAction({
      request: createRequest(),
    } as never);

    expect(createCategoryMock).toHaveBeenCalledWith("");
  });

  it("should return the service error response", async () => {
    createCategoryMock.mockRejectedValue(new Error("Invalid category name"));

    const result = await createCategoryAction({
      request: createRequest(""),
    } as never);

    expect(createCategoryMock).toHaveBeenCalledWith("");

    expect(result).toEqual({
      error: "Invalid category name",
    });
  });

  it("should return the service error message", async () => {
    createCategoryMock.mockRejectedValue(new Error("CATEGORY_ALREADY_EXISTS"));

    const result = await createCategoryAction({
      request: createRequest("Food"),
    } as never);

    expect(result).toEqual({
      error: "CATEGORY_ALREADY_EXISTS",
    });
  });

  it("should return the same success response regardless of the created category data", async () => {
    createCategoryMock.mockResolvedValue(mockedCategory2);

    const result = await createCategoryAction({
      request: createRequest("Transport"),
    } as never);

    expect(result).toEqual({
      success: true,
      message: "Category added successfully!",
    });
  });
});
