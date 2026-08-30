import { NavLink } from "react-router";

import {
  ArrowTurnDownIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  FolderIcon,
  GraphIcon,
  UserIcon,
  WalletIcon,
} from "../../icons";

type DashboardSideMenuProps = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClickLogout: () => void;
};

const dashboardNavigation = [
  {
    name: "Overview",
    to: "/overview",
    icon: GraphIcon,
  },
  {
    name: "Expenses",
    to: "/expenses",
    icon: WalletIcon,
  },
  {
    name: "Categories",
    to: "/categories",
    icon: FolderIcon,
  },
  {
    name: "Profile",
    to: "/profile",
    icon: UserIcon,
  },
];

export function DashboardSideMenu({
  isCollapsed,
  onToggleCollapse,
  onClickLogout,
}: DashboardSideMenuProps) {
  return (
    <aside
      className={`fixed min-h-screen bg-linear-to-b from-blue-700 to-blue-900 shadow-lg px-3 ${
        isCollapsed ? "w-20" : "w-xs"
      }`}
    >
      <div className="flex h-15 border-b border-white/15 items-center justify-between">
        <h1 className="text-white text-lg font-bold">
          {isCollapsed ? "" : "Personal Expense Tracker"}
        </h1>

        <button className="pl-1.5 py-1.5" onClick={onToggleCollapse}>
          {isCollapsed ? <ChevronDoubleRightIcon /> : <ChevronDoubleLeftIcon />}
        </button>
      </div>

      <nav className="mt-4">
        <ul className="flex flex-col gap-1">
          {dashboardNavigation.map(({ name, to, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex gap-3 items-center rounded-md px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-white/20 text-white font-bold"
                      : "hover:bg-white/10 text-white/90"
                  }`
                }
              >
                <Icon />
                {!isCollapsed && <span>{name}</span>}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-white/90 transition-colors duration-200 hover:bg-white/10"
              onClick={onClickLogout}
            >
              <ArrowTurnDownIcon />
              {!isCollapsed && <span>Log out</span>}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
