import { useState, type ChangeEvent } from "react";
import { Form } from "react-router";

import type { Category } from "@extropy/shared";

import { InputGroup } from "../../../../components";

type FilterFormProps = {
  categories: Category[];
  isDisabled: boolean;
};

export function FilterForm({ categories, isDisabled }: FilterFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  return (
    <Form
      method="get"
      aria-label="Expense filters"
      className="
    grid
    w-full
    grid-cols-4
    items-end
    gap-4
    max-lg:grid-cols-2
    max-sm:grid-cols-1
  "
    >
      <div className="min-w-0">
        <InputGroup
          label="From"
          name="startDate"
          type="date"
          isRequired={false}
          value={startDate}
          onChange={(event: ChangeEvent) => setStartDate(event.target.value)}
          max={endDate || today}
        />
      </div>

      <div className="min-w-0">
        <InputGroup
          label="To"
          name="endDate"
          type="date"
          isRequired={false}
          value={endDate}
          onChange={(event: ChangeEvent) => setEndDate(event.target.value)}
          min={startDate || undefined}
          max={today}
        />
      </div>

      <div className="min-w-0">
        <label htmlFor="categoryId" className="text-sm text-gray-600">
          Category
        </label>

        <select
          id="categoryId"
          name="categoryId"
          className="h-10 w-full min-w-0 rounded-lg border border-gray-300 px-3"
          defaultValue=""
        >
          <option value="">All categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="h-10 w-fit rounded-md bg-gray-500 px-4 font-medium text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Filter
      </button>
    </Form>
  );
}
