import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  SuggestCategoryInput,
  SuggestCategoryResponse,
} from "@extropy/shared";

const { responsesCreateMock, OpenAIMock } = vi.hoisted(() => {
  const responsesCreateMock = vi.fn();

  class OpenAIMock {
    responses = {
      create: responsesCreateMock,
    };
  }

  return {
    responsesCreateMock,
    OpenAIMock,
  };
});

vi.mock("openai", () => ({
  default: OpenAIMock,
}));

vi.mock("../expenses.helpers", () => ({
  validateDescription: vi.fn(),
}));

vi.mock("../expenses.prompts", () => ({
  buildCategoryPrompt: vi.fn(),
}));

import { validateDescription } from "../expenses.helpers";
import { buildCategoryPrompt } from "../expenses.prompts";
import { suggestExpenseCategory } from "../expenses.ai";

const validateDescriptionMock = vi.mocked(validateDescription);
const buildCategoryPromptMock = vi.mocked(buildCategoryPrompt);

describe("expenses.ai", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const categories = [
    {
      id: "food",
      name: "Food",
    },
    {
      id: "transport",
      name: "Transport",
    },
    {
      id: "bills",
      name: "Bills",
    },
  ];

  const input: SuggestCategoryInput = {
    description: "Uber ride from airport",
    categories,
  };

  it("should return the AI category suggestion", async () => {
    const suggestion: SuggestCategoryResponse = {
      categoryId: "transport",
      confidence: 0.97,
    };

    buildCategoryPromptMock.mockReturnValue(
      "Categories:\ntransport: Transport"
    );

    responsesCreateMock.mockResolvedValue({
      output_text: JSON.stringify(suggestion),
    });

    const result = await suggestExpenseCategory(input);

    expect(result).toEqual(suggestion);
  });

  it("should validate the description before calling OpenAI", async () => {
    validateDescriptionMock.mockImplementation(() => {
      throw new Error("INVALID_DESCRIPTION");
    });

    await expect(suggestExpenseCategory(input)).rejects.toThrow(
      "INVALID_DESCRIPTION"
    );

    expect(responsesCreateMock).not.toHaveBeenCalled();
  });

  it("should send the expected prompt configuration to OpenAI", async () => {
    const suggestion: SuggestCategoryResponse = {
      categoryId: "transport",
      confidence: 0.97,
    };

    const prompt = "Categories:\ntransport: Transport";

    buildCategoryPromptMock.mockReturnValue(prompt);

    responsesCreateMock.mockResolvedValue({
      output_text: JSON.stringify(suggestion),
    });

    await suggestExpenseCategory(input);

    expect(responsesCreateMock).toHaveBeenCalledWith({
      model: "gpt-5.6-luna",
      input: [
        {
          role: "system",
          content: expect.stringContaining(
            "Return exactly one category from the provided list."
          ),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "expense_category_suggestion",
          strict: true,
          schema: {
            type: "object",
            properties: {
              categoryId: {
                type: ["string", "null"],
              },
              confidence: {
                type: "number",
              },
            },
            required: ["categoryId", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });
  });

  it("should support a null category suggestion", async () => {
    const suggestion: SuggestCategoryResponse = {
      categoryId: null,
      confidence: 0.2,
    };

    responsesCreateMock.mockResolvedValue({
      output_text: JSON.stringify(suggestion),
    });

    const result = await suggestExpenseCategory(input);

    expect(result).toEqual(suggestion);
  });

  it("should propagate OpenAI errors", async () => {
    responsesCreateMock.mockRejectedValue(new Error("OpenAI API error"));

    await expect(suggestExpenseCategory(input)).rejects.toThrow(
      "OpenAI API error"
    );
  });

  it("should propagate invalid JSON errors", async () => {
    responsesCreateMock.mockResolvedValue({
      output_text: "invalid-json",
    });

    await expect(suggestExpenseCategory(input)).rejects.toThrow();
  });

  it("should pass the description and categories to the prompt builder", async () => {
    const suggestion: SuggestCategoryResponse = {
      categoryId: "food",
      confidence: 0.91,
    };

    buildCategoryPromptMock.mockReturnValue("Food description prompt");

    responsesCreateMock.mockResolvedValue({
      output_text: JSON.stringify(suggestion),
    });

    await suggestExpenseCategory({
      description: "Restaurant dinner",
      categories,
    });

    expect(buildCategoryPromptMock).toHaveBeenCalledWith({
      description: "Restaurant dinner",
      categories,
    });
  });
});
