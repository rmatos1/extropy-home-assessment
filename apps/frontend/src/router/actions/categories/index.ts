import type { ActionFunctionArgs } from "react-router";

import { createCategory } from "../../../services";

export async function createCategoryAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const categoryName = String(formData.get("categoryName") ?? "").trim();

  const result = await createCategory(categoryName);

  if ("error" in result) {
    return result;
  }

  return {
    success: true,
    message: "Category added successfully!",
    category: result,
  };
}
