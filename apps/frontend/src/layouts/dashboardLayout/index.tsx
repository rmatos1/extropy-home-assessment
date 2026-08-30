import { useState } from "react";
import { Outlet, useMatches, useFetcher } from "react-router";
import { Toaster } from "react-hot-toast";

import { DashboardSideMenu } from "../../components";
import { LogoutModal } from "../..//modals";

type RouteHandle = {
  name?: string;
};

export function DashboardLayout() {
  const matches = useMatches();
  const logoutFetcher = useFetcher();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const currentMatch = matches.find(
    (match) => (match.handle as RouteHandle)?.name
  );

  const pageTitle = (currentMatch?.handle as RouteHandle)?.name ?? "";

  const onToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const onClickLogout = () => {
    setShowLogoutModal(true);
  };

  const onCloseModal = () => {
    setShowLogoutModal(false);
  };

  const onConfirmLogout = () => {
    logoutFetcher.submit(null, {
      method: "post",
      action: "/logout",
    });
  };

  return (
    <>
      {showLogoutModal && (
        <LogoutModal
          onClose={onCloseModal}
          onConfirm={onConfirmLogout}
          isLoading={false}
        />
      )}

      <main className="flex min-h-screen bg-gray-200 relative">
        <DashboardSideMenu
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          onClickLogout={onClickLogout}
        />

        <aside className={isCollapsed ? "w-20" : "w-xs"}></aside>

        <section className="flex flex-1 flex-col">
          <header className="flex w-full h-15 shadow-sm bg-white/90 justify-between items-center px-5">
            <h2 className="font-bold text-2xl text-gray-800">{pageTitle}</h2>
          </header>

          <Outlet />
        </section>

        <Toaster position="top-right" />
      </main>
    </>
  );
}
