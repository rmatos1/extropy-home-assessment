import { ActionButton, DashboardTable } from "../../components";

import { columns, useCategoriesHelper } from "./useCategoriesHelper.hook";
import { FormRow } from "./categoriesComponents";

export function Categories() {
  const {
    isAdding,
    newCategoryName,
    customCategories,
    isSaving,
    onClickAddCategory,
    onChangeNewCategory,
    onCancelCategoryForm,
    onSubmitCategory,
  } = useCategoriesHelper();

  function renderFormRow() {
    return (
      <FormRow
        categoryName={newCategoryName}
        isSaving={isSaving}
        onChange={onChangeNewCategory}
        onSave={onSubmitCategory}
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

      <div className="overflow-x-auto w-lg rounded-lg border border-gray-200 mx-auto">
        <DashboardTable
          tableKey="categories-table"
          columns={columns}
          data={customCategories}
          isAdding={isAdding}
          renderFormRow={renderFormRow}
        />
      </div>
    </div>
  );
}
