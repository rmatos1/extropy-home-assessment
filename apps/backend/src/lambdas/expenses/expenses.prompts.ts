type CategoryPromptInput = {
  description: string;
  categories: {
    id: string;
    name: string;
  }[];
};

export function buildCategoryPrompt({
  description,
  categories,
}: CategoryPromptInput) {
  const categoryList = categories
    .map((category) => `- ${category.id}: ${category.name}`)
    .join("\n");

  return `
Categories:
${categoryList}

Expense description:
${description}
`;
}
