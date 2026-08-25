import { Outlet, useMatches } from "react-router";

import { DashboardSideMenu } from "../../components";

type RouteHandle = {
  name?: string;
};

export function DashboardLayout() {
  const matches = useMatches();

  const currentMatch = matches.find(
    (match) => (match.handle as RouteHandle)?.name
  );

  const pageTitle = (currentMatch?.handle as RouteHandle)?.name ?? "";

  return (
    <main className="flex min-h-screen bg-gray-200 relative">
      <DashboardSideMenu />

      <aside className="w-xs"></aside>

      <section className="flex flex-1 flex-col">
        <header className="flex w-full h-15 shadow-sm bg-white/90"></header>

        <div className="bg-white flex flex-1 m-4 rounded-lg shadow-sm border-box py-2 px-3">
          <h2 className="font-bold text-2xl text-gray-800">{pageTitle}</h2>

          <Outlet />
        </div>
      </section>
    </main>
  );
}
