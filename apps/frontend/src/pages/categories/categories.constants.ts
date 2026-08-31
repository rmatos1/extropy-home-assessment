import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import type { Category } from "@extropy/shared";

import { dashboardTableFeatures } from "../../components";

const columnHelper = createColumnHelper<
  typeof dashboardTableFeatures,
  Category
>();

export const columns: Array<
  ColumnDef<typeof dashboardTableFeatures, Category>
> = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),
]);
