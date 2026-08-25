import {
  AddCategory,
  AddExpense,
  Categories,
  Expenses,
  Overview,
  Profile,
} from "../pages";

export const dashboardNavigation = [
  {
    name: "Overview",
    to: "/overview",
    Component: Overview,
  },
  {
    name: "Expenses",
    to: "/expenses",
    Component: Expenses,
  },
  {
    name: "Add Expense",
    to: "/add-expense",
    Component: AddExpense,
  },
  {
    name: "Categories",
    to: "/categories",
    Component: Categories,
  },
  {
    name: "Add Category",
    to: "/add-category",
    Component: AddCategory,
  },
  {
    name: "Profile",
    to: "/profile",
    Component: Profile,
  },
];
