import { Outlet, useNavigation } from "react-router";
import { LoadingScreen } from "../../components";

export function AuthLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-200">
      {isLoading && <LoadingScreen />}

      <section className="m-2 w-md rounded-xl bg-white shadow-sm">
        <Outlet />
      </section>
    </main>
  );
}
