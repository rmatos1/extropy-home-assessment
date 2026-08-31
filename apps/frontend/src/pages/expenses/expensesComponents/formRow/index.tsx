import { memo, ReactNode } from "react";
import type { Expense, Category } from "@extropy/shared";

import { InputGroup, TableFormActions } from "../../../../components";
import { useFormRowHelper } from "./useFormRowHelper.hook";

type FormRowProps = {
  form: string;
  formData: Expense;
  categories: Category[];
  isEditing: boolean;
  isSaving: boolean;
  onCancel: () => void;
};

type CustomTdProps = {
  label: string;
  children: ReactNode;
  showSuggestion: boolean;
};

const MobileLabel = ({ text }: { text: string }) => (
  <span className="mb-1 hidden text-sm font-medium text-gray-500 max-md:block px-2">
    {text}
  </span>
);

const CustomTd = ({ label, children, showSuggestion }: CustomTdProps) => (
  <td className="px-4 py-3 max-md:block max-md:w-full">
    <MobileLabel text={label} />

    {children}

    {showSuggestion && <div className="h-10 max-md:h-0"></div>}
  </td>
);

export const FormRow = memo(
  ({
    form,
    formData,
    categories,
    isEditing,
    isSaving,
    onCancel,
  }: FormRowProps) => {
    const {
      categorySelectRef,
      amountRef,
      showSuggestion,
      suggestionTextButton,
      isSuggestingCategory,
      today,
      onChangeDescription,
      onClickSuggestedCategory,
    } = useFormRowHelper(formData.description, categories);

    return (
      <tr className="border-b border-gray-200 bg-blue-50 max-md:block max-md:w-full">
        <CustomTd label="Date" showSuggestion={showSuggestion}>
          <InputGroup
            name="date"
            type="date"
            defaultValue={formData.date}
            form={form}
            max={today}
          />
        </CustomTd>

        <td className="px-4 py-3 max-md:block max-md:w-full">
          <MobileLabel text="Description" />

          <InputGroup
            name="description"
            type="text"
            defaultValue={formData.description}
            form={form}
            onChange={onChangeDescription}
          />

          {showSuggestion && (
            <div className="px-1 h-10 flex items-end">
              {isSuggestingCategory && (
                <span className="text-sm text-gray-500">
                  Suggesting category...
                </span>
              )}

              {suggestionTextButton && (
                <button
                  onClick={onClickSuggestedCategory}
                  type="button"
                  className="h-8 rounded-md bg-blue-400 px-4 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestionTextButton}
                </button>
              )}
            </div>
          )}
        </td>

        <CustomTd label="Category" showSuggestion={showSuggestion}>
          <select
            ref={categorySelectRef}
            name="categoryId"
            className="h-10 rounded-lg border border-gray-300 px-2 text-base text-gray-900 max-md:w-full"
            defaultValue={formData.categoryId}
            form={form}
            required
          >
            <option value="">Select</option>
            {categories?.map((item: Category) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </CustomTd>

        <CustomTd label="Amount" showSuggestion={showSuggestion}>
          <InputGroup
            ref={amountRef}
            name="amount"
            type="text"
            inputMode="decimal"
            pattern="^\d+([.,]\d{1,2})?$"
            defaultValue={formData.amount}
            form={form}
          />
        </CustomTd>

        <CustomTd label="" showSuggestion={showSuggestion}>
          <TableFormActions
            isSaving={isSaving}
            isEditing={isEditing}
            onCancel={onCancel}
            form={form}
          />
        </CustomTd>
      </tr>
    );
  }
);
