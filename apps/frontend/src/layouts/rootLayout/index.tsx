import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";

export function RootLayout() {
  return (
    <>
      <Outlet />

      <Toaster position="top-right" />
    </>
  );
}
