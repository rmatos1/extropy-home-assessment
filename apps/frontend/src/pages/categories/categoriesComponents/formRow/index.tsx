import { forwardRef, memo } from "react";
import { Form } from "react-router";

import { InputGroup } from "../../../../components";

type FormRowProps = {
  isSaving: boolean;
  onCancel: () => void;
};

export const FormRow = memo(
  forwardRef<HTMLFormElement, FormRowProps>(function FormRow(
    { isSaving, onCancel },
    ref
  ) {
    return (
      <tr className="border-b border-gray-200 bg-blue-50">
        <td className="px-4 py-3">
          <Form ref={ref} method="post" className="flex gap-4">
            <InputGroup name="categoryName" type="text" />

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
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
          </Form>
        </td>
      </tr>
    );
  })
);
