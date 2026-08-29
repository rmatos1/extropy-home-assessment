import type { Expense } from "@extropy/shared";

import { ActionButton, DashboardTable } from "../../components";
import { DeleteExpenseModal } from "../../modals";
import { columns, useExpensesHelper } from "./useExpensesHelper.hook";

import { ActionsRow, FormRow } from "./expensesComponents";

export function Expenses() {
  const {
    isAdding,
    onClickAddExpense,
    isEditing,
    isSaving,
    expenses,
    expenseFormData,
    selectedExpenseId,
    onClickEditExpense,
    onChangeFormData,
    onSubmitExpense,
    onCancelExpenseForm,
    onClickDeleteExpense,
    showDeleteModal,
    deleteExpenseDescription,
    onCloseModal,
    onConfirmDelete,
  } = useExpensesHelper();

  function renderFormRow() {
    return (
      <FormRow
        formData={expenseFormData}
        isEditing={isEditing}
        isSaving={isSaving}
        onChange={onChangeFormData}
        onSave={onSubmitExpense}
        onCancel={onCancelExpenseForm}
      />
    );
  }

  function renderActions(expense: Expense) {
    return (
      <ActionsRow
        isDisabled={isAdding || isSaving}
        onClickEdit={() => onClickEditExpense(expense)}
        onClickDelete={() => onClickDeleteExpense(expense)}
      />
    );
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteExpenseModal
          expenseDescription={deleteExpenseDescription}
          onClose={onCloseModal}
          onConfirm={onConfirmDelete}
        />
      )}
      <div className="bg-white flex flex-1 flex-col m-4 rounded-xl shadow-sm border-box p-4 gap-4">
        <div className="flex justify-end">
          <ActionButton
            text="Add expense"
            onClick={onClickAddExpense}
            isDisabled={isAdding || isEditing}
            customClasses="px-4"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <DashboardTable
            tableKey="expenses-table"
            columns={columns}
            data={expenses}
            isAdding={isAdding}
            isEditing={isEditing}
            editingRowId={selectedExpenseId}
            renderFormRow={renderFormRow}
            renderActions={renderActions}
          />
        </div>
      </div>
    </>
  );
}
