import { render, renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import toast from "react-hot-toast";

import { useCategoriesHelper } from "../useCategoriesHelper.hook";

const useFetcherMock = vi.fn();
const useLoaderDataMock = vi.fn();
const useNavigationMock = vi.fn();

vi.mock("react-router", () => ({
  useFetcher: () => useFetcherMock(),
  useLoaderData: () => useLoaderDataMock(),
  useNavigation: () => useNavigationMock(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("../../../router/loaders", () => ({
  categoriesLoader: {},
}));

const toastErrorMock = vi.mocked(toast.error);
const toastSuccessMock = vi.mocked(toast.success);

describe("useCategoriesHelper", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useLoaderDataMock.mockReturnValue([
      {
        id: "food",
        name: "Food",
      },
      {
        id: "transport",
        name: "Transport",
      },
    ]);

    useFetcherMock.mockReturnValue({
      state: "idle",
      data: undefined,
    });

    useNavigationMock.mockReturnValue({
      state: "idle",
      location: undefined,
    });
  });

  it("should return categories from loader data", () => {
    const { result } = renderHook(() => useCategoriesHelper());

    expect(result.current.categories).toEqual([
      {
        id: "food",
        name: "Food",
      },
      {
        id: "transport",
        name: "Transport",
      },
    ]);
  });

  it("should initialize isAdding as false", () => {
    const { result } = renderHook(() => useCategoriesHelper());

    expect(result.current.isAdding).toBe(false);
  });

  it("should set isAdding to true when adding a category", () => {
    const { result } = renderHook(() => useCategoriesHelper());

    act(() => {
      result.current.onClickAddCategory();
    });

    expect(result.current.isAdding).toBe(true);
  });

  it("should set isAdding to false when cancelling the category form", () => {
    const { result } = renderHook(() => useCategoriesHelper());

    act(() => {
      result.current.onClickAddCategory();
    });

    expect(result.current.isAdding).toBe(true);

    act(() => {
      result.current.onCancelCategoryForm();
    });

    expect(result.current.isAdding).toBe(false);
  });

  it("should return isSaving as true when the fetcher is submitting", () => {
    useFetcherMock.mockReturnValue({
      state: "submitting",
      data: undefined,
    });

    const { result } = renderHook(() => useCategoriesHelper());

    expect(result.current.isSaving).toBe(true);
  });

  it("should return isSaving as false when the fetcher is idle", () => {
    const { result } = renderHook(() => useCategoriesHelper());

    expect(result.current.isSaving).toBe(false);
  });

  it("should return isLoading as true when navigation is loading categories", () => {
    useNavigationMock.mockReturnValue({
      state: "loading",
      location: {
        pathname: "/categories",
      },
    });

    const { result } = renderHook(() => useCategoriesHelper());

    expect(result.current.isLoading).toBe(true);
  });

  it("should return isLoading as false when navigation is loading another route", () => {
    useNavigationMock.mockReturnValue({
      state: "loading",
      location: {
        pathname: "/expenses",
      },
    });

    const { result } = renderHook(() => useCategoriesHelper());

    expect(result.current.isLoading).toBe(false);
  });

  it("should return isLoading as false when navigation is idle", () => {
    useNavigationMock.mockReturnValue({
      state: "idle",
      location: undefined,
    });

    const { result } = renderHook(() => useCategoriesHelper());

    expect(result.current.isLoading).toBe(false);
  });

  it("should return isLoading as false when navigation is loading without a location", () => {
    useNavigationMock.mockReturnValue({
      state: "loading",
      location: undefined,
    });

    const { result } = renderHook(() => useCategoriesHelper());

    expect(result.current.isLoading).toBe(false);
  });

  it("should show an error toast when fetcher returns an error", () => {
    useFetcherMock.mockReturnValue({
      state: "idle",
      data: {
        error: "Unable to create category",
      },
    });

    renderHook(() => useCategoriesHelper());

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith("Unable to create category");
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  it("should show a success toast when fetcher returns success", () => {
    useFetcherMock.mockReturnValue({
      state: "idle",
      data: {
        success: true,
        message: "Category created successfully",
      },
    });

    renderHook(() => useCategoriesHelper());

    expect(toastSuccessMock).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Category created successfully"
    );
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("should reset the form when fetcher returns success", async () => {
    useFetcherMock.mockReturnValue({
      state: "idle",
      data: {},
    });

    const TestComponent = () => {
      const helper = useCategoriesHelper();

      return (
        <form ref={helper.categoriesFormRef}>
          <input name="categoryName" defaultValue="Food" />
        </form>
      );
    };

    const { rerender } = render(<TestComponent />);

    const form = document.querySelector("form");

    expect(form).toBeInTheDocument();

    const resetSpy = vi.spyOn(form!, "reset");

    useFetcherMock.mockReturnValue({
      state: "idle",
      data: {
        success: true,
        message: "Category created successfully",
      },
    });

    rerender(<TestComponent />);

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("should prioritize error handling over success when both are present", () => {
    useFetcherMock.mockReturnValue({
      state: "idle",
      data: {
        error: "Something went wrong",
        success: true,
        message: "Category created successfully",
      },
    });

    renderHook(() => useCategoriesHelper());

    expect(toastErrorMock).toHaveBeenCalledWith("Something went wrong");

    expect(toastSuccessMock).not.toHaveBeenCalled();
  });
});
