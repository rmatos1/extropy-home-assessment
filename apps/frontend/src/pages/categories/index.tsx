import { ActionButton, DashboardTable } from "../../components";

import { useCategoriesHelper } from "./useCategoriesHelper.hook";
import { FormRow } from "./categoriesComponents";
import { columns } from "./categories.constants";

export function Categories() {
  const {
    categoriesFetcher,
    categoriesFormRef,
    isAdding,
    categories,
    isSaving,
    onClickAddCategory,
    onCancelCategoryForm,
    isLoading,
  } = useCategoriesHelper();

  function renderFormRow() {
    return (
      <FormRow
        ref={categoriesFormRef}
        fetcher={categoriesFetcher}
        isSaving={isSaving}
        onCancel={onCancelCategoryForm}
      />
    );
  }

  return (
    <div className="bg-white flex flex-1 flex-col m-4 rounded-xl shadow-sm border-box p-4 gap-4">
      <div className="flex justify-end">
        <ActionButton
          text="Add expense"
          onClick={onClickAddCategory}
          isDisabled={isAdding}
          customClasses="px-4"
        />
      </div>

      <div className="mx-auto w-fit max-w-full min-w-0 overflow-x-auto rounded-lg border border-gray-200">
        <DashboardTable
          tableKey="categories-table"
          columns={columns}
          data={categories}
          isAdding={isAdding}
          renderFormRow={renderFormRow}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
