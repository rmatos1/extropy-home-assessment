import type { ExpenseResponse } from "@extropy/shared";

import { ActionButton, DashboardTable, DefaultModal } from "../../components";
import { useExpensesHelper } from "./useExpensesHelper.hook";

import { ActionsRow, FilterForm, FormRow } from "./expensesComponents";

const formId = "expense-form";

export function Expenses() {
  const {
    expensesFetcher,
    expensesFormRef,
    isAdding,
    onClickAddExpense,
    isEditing,
    isProcessing,
    expenses,
    categories,
    expenseFormData,
    selectedExpenseId,
    onClickEditExpense,
    onCancelExpenseForm,
    onClickDeleteExpense,
    showDeleteModal,
    deleteExpenseDescription,
    onCloseModal,
    onConfirmDelete,
    columns,
    isLoading,
  } = useExpensesHelper();

  function renderFormRow() {
    return (
      <FormRow
        form={formId}
        formData={expenseFormData}
        categories={categories}
        isEditing={isEditing}
        isSaving={isProcessing}
        onCancel={onCancelExpenseForm}
      />
    );
  }

  function renderActions(expense: ExpenseResponse) {
    return (
      <ActionsRow
        isDisabled={isAdding || isProcessing}
        onClickEdit={() => onClickEditExpense(expense)}
        onClickDelete={() => onClickDeleteExpense(expense)}
      />
    );
  }

  return (
    <>
      {showDeleteModal && (
        <DefaultModal
          title="Delete expense"
          description={`Are you sure you want to delete ${deleteExpenseDescription}?`}
          onClose={onCloseModal}
          confirmTextButton="Delete"
          onConfirm={onConfirmDelete}
          isProcessing={isProcessing}
          processingText="deleting..."
        />
      )}
      <div className="bg-white flex flex-1 flex-col m-4 rounded-xl shadow-sm border-box p-4 gap-4">
        <div className="flex items-end gap-4 max-md:flex-col max-md:items-start">
          <FilterForm
            categories={categories}
            isDisabled={isAdding || isEditing}
          />

          <ActionButton
            text="Add expense"
            onClick={onClickAddExpense}
            isDisabled={isAdding || isEditing}
            customClasses="shrink-0 px-4 max-md:mt-4 max-md:self-end"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <expensesFetcher.Form id={formId} method="post" ref={expensesFormRef}>
            <input
              type="hidden"
              name="intent"
              value={isEditing ? "update" : "create"}
            />

            {isEditing && (
              <input
                type="hidden"
                name="expenseId"
                value={selectedExpenseId ?? ""}
              />
            )}
          </expensesFetcher.Form>

          <DashboardTable
            tableKey="expenses-table"
            columns={columns}
            data={expenses}
            isAdding={isAdding}
            isEditing={isEditing}
            editingRowId={selectedExpenseId}
            renderFormRow={renderFormRow}
            renderActions={renderActions}
            emptyMsg="No expense records"
            initialSorting={[
              {
                id: "date",
                desc: true,
              },
            ]}
            isLoading={isLoading}
            customClasses={{
              th: "max-md:hidden",
              td: "max-md:block max-md:w-full max-md:flex max-md:items-start max-md:flex-col max-md:before:mr-4 max-md:before:font-medium max-md:before:text-gray-500 max-md:before:content-[attr(data-label)]",
            }}
          />
        </div>
      </div>
    </>
  );
}
