import { FormComponent, InputGroup } from "../../components";

export function AddExpense() {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto my-10 w-md h-full">
      <FormComponent buttonText="Add Expense">
        <InputGroup
          label="Amount"
          name="amount"
          type="text"
          inputMode="decimal"
          pattern="^\d+([.,]\d{1,2})?$"
          isRequired
        />

        <InputGroup
          label="Description"
          name="description"
          type="text"
          isRequired
        />

        <InputGroup label="Category" name="category" type="text" isRequired />

        <InputGroup
          label="Date"
          name="date"
          type="date"
          max={today}
          isRequired
        />
      </FormComponent>
    </div>
  );
}
