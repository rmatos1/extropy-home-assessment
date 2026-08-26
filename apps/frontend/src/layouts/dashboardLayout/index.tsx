import { useState } from "react";
import { Outlet, useMatches, Navigate } from "react-router";

import { DashboardSideMenu } from "../../components";
import { useAuthStore } from "../../store";

type RouteHandle = {
  name?: string;
};

export function DashboardLayout() {
  const { isAuthenticated, setIsAuthenticated } = useAuthStore();
  const matches = useMatches();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const onToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const currentMatch = matches.find(
    (match) => (match.handle as RouteHandle)?.name
  );

  const pageTitle = (currentMatch?.handle as RouteHandle)?.name ?? "";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="flex min-h-screen bg-gray-200 relative">
      <DashboardSideMenu
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        setIsAuthenticated={setIsAuthenticated}
      />

      <aside className={isCollapsed ? "w-20" : "w-xs"}></aside>

      <section className="flex flex-1 flex-col">
        <header className="flex w-full h-15 shadow-sm bg-white/90"></header>

        <div className="bg-white flex flex-1 flex-col m-4 rounded-xl shadow-sm border-box py-2 px-3">
          <h2 className="font-bold text-2xl text-gray-800">{pageTitle}</h2>

          <Outlet />
        </div>
      </section>
    </main>
  );
}
