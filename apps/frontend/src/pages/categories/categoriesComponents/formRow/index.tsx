import { memo } from "react";

import { InputGroup } from "../../../../components";

type FormRowProps = {
  categoryName: string;
  isSaving: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const FormRow = memo(function FormRow({
  categoryName,
  isSaving,
  onChange,
  onSave,
  onCancel,
}: FormRowProps) {
  return (
    <tr className="border-b border-gray-200 bg-blue-50">
      <td className="px-4 py-3">
        <InputGroup
          name="categoryName"
          type="text"
          value={categoryName}
          onChange={(event) => onChange(event.target.value)}
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
            {isSaving ? "Saving..." : "Save"}
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
