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
  showMobileMenu: boolean;
  onCloseMobileMenu: () => void;
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
  showMobileMenu,
  onCloseMobileMenu,
}: DashboardSideMenuProps) {
  const onClickMenuTopButton = () => {
    if (showMobileMenu) {
      onCloseMobileMenu();
      return;
    }

    onToggleCollapse();
  };

  return (
    <aside
      className={`fixed min-h-screen
    w-[85vw] max-w-xs
    bg-linear-to-b from-blue-700 to-blue-900
    px-3 shadow-lg
    transition-transform duration-300 ease-in-out
    z-3
    ${showMobileMenu ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}
    ${isCollapsed ? "min-lg:w-20" : "min-lg:w-2xs"}
  `}
    >
      <div className="flex h-15 border-b border-white/15 items-center justify-between">
        <h1 className="text-white text-md font-bold">
          {isCollapsed ? "" : "Personal Expense Tracker"}
        </h1>

        <button className="pl-1.5 py-1.5" onClick={onClickMenuTopButton}>
          {showMobileMenu || !isCollapsed ? (
            <ChevronDoubleLeftIcon />
          ) : (
            <ChevronDoubleRightIcon />
          )}
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
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-white/90 transition-colors duration-200 hover:bg-white/10 cursor-pointer"
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
