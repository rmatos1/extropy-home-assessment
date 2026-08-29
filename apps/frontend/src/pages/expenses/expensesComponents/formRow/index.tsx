import type { Expense } from "@extropy/shared";
import { memo } from "react";

import { InputGroup } from "../../../../components";

type ExpenseFormData = Omit<Expense, "amount"> & {
  amount: string;
};

type FormRowProps = {
  formData: ExpenseFormData;
  isEditing: boolean;
  isSaving: boolean;
  onChange: (field: keyof ExpenseFormData, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const FormRow = memo(function FormRow({
  formData,
  isEditing,
  isSaving,
  onChange,
  onSave,
  onCancel,
}: FormRowProps) {
  return (
    <tr className="border-b border-gray-200 bg-blue-50">
      <td className="px-4 py-3">
        <InputGroup
          name="date"
          type="date"
          value={formData.date}
          onChange={(event) => onChange("date", event.target.value)}
        />
      </td>

      <td className="px-4 py-3">
        <InputGroup
          name="description"
          type="text"
          value={formData.description}
          onChange={(event) => onChange("description", event.target.value)}
        />
      </td>

      <td className="px-4 py-3">
        <select
          value={formData.categoryId}
          onChange={(event) => onChange("categoryId", event.target.value)}
          className="h-10 w-full rounded-lg border border-gray-300 px-2 text-base text-gray-900"
        >
          <option value="">Select</option>
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="bills">Bills</option>
          <option value="entertainment">Entertainment</option>
        </select>
      </td>

      <td className="px-4 py-3">
        <InputGroup
          name="amount"
          type="text"
          inputMode="decimal"
          pattern="^\d+([.,]\d{1,2})?$"
          value={formData.amount}
          onChange={(event) => onChange("amount", event.target.value)}
        />
      </td>

      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : isEditing ? "Update" : "Save"}
          </button>

          <button
            type="button"
            className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
});
