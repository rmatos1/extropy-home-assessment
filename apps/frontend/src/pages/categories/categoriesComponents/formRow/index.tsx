import { forwardRef, memo } from "react";
import type { FetcherWithComponents } from "react-router";

import { InputGroup, TableFormActions } from "../../../../components";

type FormRowProps = {
  fetcher: FetcherWithComponents<unknown>;
  isSaving: boolean;
  onCancel: () => void;
};

export const FormRow = memo(
  forwardRef<HTMLFormElement, FormRowProps>(function FormRow(
    { fetcher, isSaving, onCancel },
    ref
  ) {
    return (
      <tr className="border-b border-gray-200 bg-blue-50">
        <td className="px-4 py-3">
          <fetcher.Form
            ref={ref}
            method="post"
            className="flex gap-4 max-sm:flex-col"
          >
            <InputGroup name="categoryName" type="text" />

            <TableFormActions isSaving={isSaving} onCancel={onCancel} />
          </fetcher.Form>
        </td>
      </tr>
    );
  })
);
