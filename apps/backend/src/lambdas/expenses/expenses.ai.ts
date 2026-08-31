import OpenAI from "openai";
import type {
  SuggestCategoryInput,
  SuggestCategoryResponse,
} from "@extropy/shared";

import { validateDescription } from "./expenses.helpers";
import { buildCategoryPrompt } from "./expenses.prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function suggestExpenseCategory({
  description,
  categories,
}: SuggestCategoryInput): Promise<SuggestCategoryResponse> {
  validateDescription(description);

  const response = await openai.responses.create({
    model: "gpt-5.6-luna",
    input: [
      {
        role: "system",
        content: `
You classify personal expenses.

Rules:
- Return exactly one category from the provided list.
- Never return multiple categories.
- Never invent a category.
- If the description is ambiguous, return null.
- Return only the categoryId and confidence.
        `,
      },
      {
        role: "user",
        content: buildCategoryPrompt({
          description,
          categories,
        }),
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
  console.log("response ai", response);
  return JSON.parse(response.output_text);
}
