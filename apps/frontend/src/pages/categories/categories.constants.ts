import type { ColumnDef } from "@tanstack/react-table";

export const columns: Array<ColumnDef<typeof features, string>> = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue<string>(),
  },
];
