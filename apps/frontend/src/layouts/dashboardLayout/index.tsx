import { useState } from "react";
import { Outlet, useMatches, useFetcher } from "react-router";

import { DashboardSideMenu, DefaultModal } from "../../components";
import { MenuIcon } from "../../icons";

export function DashboardLayout() {
  const matches = useMatches();
  const logoutFetcher = useFetcher();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentMatch = matches.find(
    (match) => (match.handle as RouteHandle)?.name
  );

  const pageTitle = (currentMatch?.handle as RouteHandle)?.name ?? "";

  const onCloseMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const onClickOpenMenu = () => {
    setIsCollapsed(false);
    setShowMobileMenu(true);
  };

  return (
    <>
      {showLogoutModal && (
        <DefaultModal
          title="Log out"
          description="Are you sure you want to log out?"
          onClose={() => setShowLogoutModal(false)}
          confirmTextButton="Log out"
          onConfirm={() => {
            logoutFetcher.submit(null, {
              method: "post",
              action: "/logout",
            });
          }}
          isProcessing={logoutFetcher.state !== "idle"}
          processingText="Logging out..."
        />
      )}

      <main className="relative flex min-h-screen bg-gray-200">
        {showMobileMenu && (
          <div
            className="fixed z-2 inset-0 bg-black/50"
            onClick={onCloseMobileMenu}
          />
        )}

        <DashboardSideMenu
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          onClickLogout={() => setShowLogoutModal(true)}
          showMobileMenu={showMobileMenu}
          onCloseMobileMenu={onCloseMobileMenu}
        />

        <aside className={`${isCollapsed ? "w-20" : "w-2xs"} max-lg:hidden`} />

        <section className="flex flex-1 flex-col">
          <header
            className="
    flex h-15 w-full items-center gap-1 bg-white/90 px-5 shadow-sm
    max-lg:sticky max-lg:top-0 max-lg:z-1
  "
          >
            <button
              className="p-3  min-lg:hidden"
              onClick={onClickOpenMenu}
              aria-label="Open menu"
              type="button"
            >
              <MenuIcon />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
          </header>

          <div className="relative flex min-h-0 flex-1">
            <Outlet />
          </div>
        </section>
      </main>
    </>
  );
}
