import { useState, useMemo, useEffect, type ChangeEvent, useRef } from "react";
import type { SuggestCategoryResponse, Category } from "@extropy/shared";

import { suggestExpenseCategory } from "../../../../services";

export const useFormRowHelper = (
  defaultDescription: string,
  categories: Category[]
) => {
  const categorySelectRef = useRef<HTMLSelectElement>(null);
  const amountRef = useRef<HTMLSelectElement>(null);
  const lastSuggestedDescriptionRef = useRef("");

  const [description, setDescription] = useState(defaultDescription);
  const [suggestion, setSuggestion] = useState<SuggestCategoryResponse | null>(
    null
  );
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const showSuggestion = Boolean(
    isSuggestingCategory || suggestion?.categoryId
  );

  const suggestionTextButton = useMemo(() => {
    if (!suggestion?.categoryId) {
      return "";
    }

    const suggestedCategory =
      categories.find((category) => category.id === suggestion.categoryId)
        ?.name ?? suggestion.categoryId;

    return `Use ccategory ${suggestedCategory}`;
  }, [suggestion, categories]);

  const onChangeDescription = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setDescription(value);
    setSuggestion(null);
  };

  const onClickSuggestedCategory = () => {
    if (!suggestion?.categoryId) {
      return;
    }

    if (categorySelectRef.current) {
      categorySelectRef.current.value = suggestion.categoryId;
      amountRef.current.focus();
    }

    setSuggestion(null);
  };

  useEffect(() => {
    const value = description.trim();

    if (value.length <= 3) {
      return;
    }

    if (value === lastSuggestedDescriptionRef.current) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSuggestingCategory(true);

        const result = await suggestExpenseCategory(value);

        lastSuggestedDescriptionRef.current = value;
        setSuggestion(result);
      } catch {
        setSuggestion(null);
      } finally {
        setIsSuggestingCategory(false);
      }
    }, 700);

    return () => clearTimeout(timeout);
  }, [description]);

  return {
    categorySelectRef,
    amountRef,
    showSuggestion,
    suggestionTextButton,
    isSuggestingCategory,
    today,
    onChangeDescription,
    onClickSuggestedCategory,
  };
};
