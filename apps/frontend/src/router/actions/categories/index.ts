import type { ActionFunctionArgs } from "react-router";

import { createCategory } from "../../../services";

export async function createCategoryAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const categoryName = String(formData.get("categoryName") ?? "").trim();

  try {
    await createCategory(categoryName);

    return {
      success: true,
      message: "Category added successfully!",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}
