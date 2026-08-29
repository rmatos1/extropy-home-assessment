import { Categories, Expenses, Overview, Profile } from "../pages";
import { FolderIcon, GraphIcon, UserIcon, WalletIcon } from "../icons";

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
    name: "Categories",
    to: "/categories",
    Component: Categories,
    icon: FolderIcon,
  },
  {
    name: "Profile",
    to: "/profile",
    Component: Profile,
    icon: UserIcon,
  },
];
