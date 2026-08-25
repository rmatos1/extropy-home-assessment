import { NavLink } from "react-router";

import { dashboardNavigation } from "../../constants";

export function DashboardSideMenu() {
  return (
    <aside className="fixed min-h-screen w-xs bg-linear-to-b from-blue-700 to-blue-900 border-box shadow-lg">
      <div className="w-xs h-15 border-b border-white/20"></div>

      <nav className="mt-4 px-3">
        <ul className="flex flex-col gap-1">
          {dashboardNavigation.map(({ name, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `block rounded-md px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-white/20 text-white font-bold"
                      : "hover:bg-white/10 text-white/90"
                  }`
                }
              >
                {name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
