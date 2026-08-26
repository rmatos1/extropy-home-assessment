import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-200">
      <section className="bg-white w-md m-2 rounded-b-xl shadow-sm">
        <Outlet />
      </section>
    </main>
  );
}
