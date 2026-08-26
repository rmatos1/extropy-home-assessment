import {
  AddCategory,
  AddExpense,
  Categories,
  Expenses,
  Overview,
  Profile,
} from "../pages";
import {
  FolderIcon,
  FolderPlusIcon,
  GraphIcon,
  PlusIcon,
  UserIcon,
  WalletIcon,
} from "../icons";

export const dashboardNavigation = [
  {
    name: "Overview",
    to: "/overview",
    Component: Overview,
    icon: GraphIcon,
  },
  {
    name: "Expenses",
    to: "/expenses",
    Component: Expenses,
    icon: WalletIcon,
  },
  {
    name: "Add Expense",
    to: "/add-expense",
    Component: AddExpense,
    icon: PlusIcon,
  },
  {
    name: "Categories",
    to: "/categories",
    Component: Categories,
    icon: FolderIcon,
  },
  {
    name: "Add Category",
    to: "/add-category",
    Component: AddCategory,
    icon: FolderPlusIcon,
  },
  {
    name: "Profile",
    to: "/profile",
    Component: Profile,
    icon: UserIcon,
  },
];
