import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DashboardTable } from "../";

type TestRow = {
  id: string;
  name: string;
  amount: number;
};

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];

const data: TestRow[] = [
  {
    id: "1",
    name: "Food",
    amount: 100,
  },
  {
    id: "2",
    name: "Transport",
    amount: 50,
  },
  {
    id: "3",
    name: "Bills",
    amount: 200,
  },
];

const renderFormRow = vi.fn(() => (
  <tr data-testid="form-row">
    <td>Form row</td>
  </tr>
));

const renderActions = vi.fn((row: TestRow) => (
  <button type="button">Edit {row.name}</button>
));

describe("DashboardTable", () => {
  it("should render column headers", () => {
    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={data}
        isAdding={false}
        renderFormRow={renderFormRow}
      />
    );

    expect(
      screen.getByRole("columnheader", { name: "Name" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Amount" })
    ).toBeInTheDocument();
  });

  it("should render table data", () => {
    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={data}
        isAdding={false}
        renderFormRow={renderFormRow}
      />
    );

    expect(screen.getByRole("cell", { name: "Food" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Transport" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Bills" })).toBeInTheDocument();

    expect(screen.getByRole("cell", { name: "100" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "50" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "200" })).toBeInTheDocument();
  });

  it("should render the custom empty message when there is no data", () => {
    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={[]}
        isAdding={false}
        renderFormRow={renderFormRow}
        emptyMsg="No expenses found"
      />
    );

    expect(screen.getByText("No expenses found")).toBeInTheDocument();
  });

  it("should render the default empty message when there is no data", () => {
    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={[]}
        isAdding={false}
        renderFormRow={renderFormRow}
      />
    );

    expect(screen.getByText("No data available.")).toBeInTheDocument();
  });

  it("should render the loading state instead of table rows", () => {
    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={data}
        isAdding={false}
        renderFormRow={renderFormRow}
        isLoading
      />
    );

    expect(screen.getByText("Loading data...")).toBeInTheDocument();

    expect(screen.queryByText("Food")).not.toBeInTheDocument();
    expect(screen.queryByText("Transport")).not.toBeInTheDocument();
    expect(screen.queryByText("Bills")).not.toBeInTheDocument();
  });

  it("should render the new row when isAdding is true", () => {
    renderFormRow.mockClear();

    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={data}
        isAdding
        renderFormRow={renderFormRow}
      />
    );

    expect(screen.getByTestId("form-row")).toBeInTheDocument();

    expect(renderFormRow).toHaveBeenCalledTimes(1);
    expect(renderFormRow.mock.calls[0]).toEqual([]);
  });

  it("should not render the empty message when isAdding is true and there is no data", () => {
    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={[]}
        isAdding
        renderFormRow={renderFormRow}
      />
    );

    expect(screen.queryByText("No data available.")).not.toBeInTheDocument();

    expect(screen.getByTestId("form-row")).toBeInTheDocument();
  });

  it("should render actions for each row", () => {
    renderActions.mockClear();

    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={data}
        isAdding={false}
        renderFormRow={renderFormRow}
        renderActions={renderActions}
      />
    );

    expect(
      screen.getByRole("button", { name: "Edit Food" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Edit Transport" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Edit Bills" })
    ).toBeInTheDocument();

    expect(renderActions).toHaveBeenCalledTimes(3);
  });

  it("should render the Actions header when renderActions is provided", () => {
    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={data}
        isAdding={false}
        renderFormRow={renderFormRow}
        renderActions={renderActions}
      />
    );

    expect(
      screen.getByRole("columnheader", { name: "Actions" })
    ).toBeInTheDocument();
  });

  it("should not render the Actions header when renderActions is not provided", () => {
    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={data}
        isAdding={false}
        renderFormRow={renderFormRow}
      />
    );

    expect(
      screen.queryByRole("columnheader", { name: "Actions" })
    ).not.toBeInTheDocument();
  });

  it("should add the correct data-label to each cell", () => {
    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={data}
        isAdding={false}
        renderFormRow={renderFormRow}
        renderActions={renderActions}
      />
    );

    const foodCell = screen.getByText("Food").closest("td");
    const amountCell = screen.getByText("100").closest("td");
    const actionCell = screen
      .getByRole("button", {
        name: "Edit Food",
      })
      .closest("td");

    expect(foodCell).toHaveAttribute("data-label", "Name");
    expect(amountCell).toHaveAttribute("data-label", "Amount");
    expect(actionCell).toHaveAttribute("data-label", "Actions");
  });

  it("should sort rows when a column header is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={data}
        isAdding={false}
        renderFormRow={renderFormRow}
        initialSorting={[
          {
            id: "name",
            desc: false,
          },
        ]}
      />
    );

    const nameHeader = screen.getByRole("columnheader", {
      name: /Name/,
    });

    const button = nameHeader.querySelector("button");

    expect(button).not.toBeNull();

    await user.click(button!);

    const rows = screen.getAllByRole("row");

    expect(rows[1]).toHaveTextContent("Transport");
    expect(rows[2]).toHaveTextContent("Food");
    expect(rows[3]).toHaveTextContent("Bills");
  });

  it("should paginate rows using the default page size", () => {
    const manyRows: TestRow[] = Array.from({ length: 11 }, (_, index) => ({
      id: String(index + 1),
      name: `Item ${index + 1}`,
      amount: index + 1,
    }));

    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={manyRows}
        isAdding={false}
        renderFormRow={renderFormRow}
      />
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 10")).toBeInTheDocument();
    expect(screen.queryByText("Item 11")).not.toBeInTheDocument();

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("should move to the next page", async () => {
    const user = userEvent.setup();

    const manyRows: TestRow[] = Array.from({ length: 11 }, (_, index) => ({
      id: String(index + 1),
      name: `Item ${index + 1}`,
      amount: index + 1,
    }));

    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={manyRows}
        isAdding={false}
        renderFormRow={renderFormRow}
      />
    );

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();

    expect(screen.getByText("Item 11")).toBeInTheDocument();
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  });

  it("should move to the previous page", async () => {
    const user = userEvent.setup();

    const manyRows: TestRow[] = Array.from({ length: 11 }, (_, index) => ({
      id: String(index + 1),
      name: `Item ${index + 1}`,
      amount: index + 1,
    }));

    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={manyRows}
        isAdding={false}
        renderFormRow={renderFormRow}
      />
    );

    await user.click(screen.getByRole("button", { name: "Next" }));

    await user.click(screen.getByRole("button", { name: "Previous" }));

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();

    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("should disable Previous on the first page", () => {
    const manyRows: TestRow[] = Array.from({ length: 11 }, (_, index) => ({
      id: String(index + 1),
      name: `Item ${index + 1}`,
      amount: index + 1,
    }));

    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={manyRows}
        isAdding={false}
        renderFormRow={renderFormRow}
      />
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
  });

  it("should disable Next on the last page", async () => {
    const user = userEvent.setup();

    const manyRows: TestRow[] = Array.from({ length: 11 }, (_, index) => ({
      id: String(index + 1),
      name: `Item ${index + 1}`,
      amount: index + 1,
    }));

    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={manyRows}
        isAdding={false}
        renderFormRow={renderFormRow}
      />
    );

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    expect(screen.getByRole("button", { name: "Previous" })).not.toBeDisabled();
  });

  it("should change the page size", async () => {
    const user = userEvent.setup();

    const manyRows: TestRow[] = Array.from({ length: 26 }, (_, index) => ({
      id: String(index + 1),
      name: `Item ${index + 1}`,
      amount: index + 1,
    }));

    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={manyRows}
        isAdding={false}
        renderFormRow={renderFormRow}
      />
    );

    const select = screen.getByDisplayValue("10");

    await user.selectOptions(select, "25");

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();

    expect(screen.getByText("Item 25")).toBeInTheDocument();

    expect(screen.queryByText("Item 26")).not.toBeInTheDocument();
  });

  it("should render the provided initial page size", () => {
    const manyRows: TestRow[] = Array.from({ length: 11 }, (_, index) => ({
      id: String(index + 1),
      name: `Item ${index + 1}`,
      amount: index + 1,
    }));

    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={manyRows}
        isAdding={false}
        renderFormRow={renderFormRow}
        pageSize={25}
      />
    );

    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();

    expect(screen.getByText("Item 11")).toBeInTheDocument();
  });

  it("should render custom classes", () => {
    render(
      <DashboardTable
        tableKey="test-table"
        columns={columns}
        data={data}
        isAdding={false}
        renderFormRow={renderFormRow}
        customClasses={{
          table: "custom-table",
          th: "custom-thead",
          tbody: "custom-tbody",
          td: "custom-td",
        }}
      />
    );

    const table = screen.getByRole("table");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    expect(table).toHaveClass("custom-table");
    expect(thead).toHaveClass("custom-thead");
    expect(tbody).toHaveClass("custom-tbody");

    expect(screen.getByRole("cell", { name: "Food" })).toHaveClass("custom-td");
  });
});
