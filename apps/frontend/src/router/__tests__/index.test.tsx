import { describe, expect, it } from "vitest";

import { router } from "../";

describe("router", () => {
  it("should register the expected routes", () => {
    const routes = router.routes;

    expect(routes).toHaveLength(1);

    const rootRoute = routes[0];

    expect(rootRoute.children).toHaveLength(2);
  });

  it("should configure the authentication routes", () => {
    const rootRoute = router.routes[0];

    const authLayout = rootRoute.children?.[0];

    expect(authLayout).toBeDefined();

    const authRoutes = authLayout?.children ?? [];

    expect(authRoutes).toHaveLength(3);

    expect(authRoutes.find((route) => route.path === "/")).toBeDefined();

    expect(authRoutes.find((route) => route.path === "/login")).toBeDefined();

    expect(authRoutes.find((route) => route.path === "/signup")).toBeDefined();
  });

  it("should redirect the root route to login", () => {
    const rootRoute = router.routes[0];

    const authLayout = rootRoute.children?.[0];

    const rootRedirect = authLayout?.children?.find(
      (route) => route.path === "/"
    );

    expect(rootRedirect).toBeDefined();
    expect(rootRedirect?.element).toBeDefined();
  });

  it("should register the logout route with an action", () => {
    const rootRoute = router.routes[0];
    const dashboardLayout = rootRoute.children?.[1];

    const logoutRoute = dashboardLayout?.children?.find(
      (route) => route.path === "/logout"
    );

    expect(logoutRoute).toBeDefined();
    expect(logoutRoute?.action).toBeDefined();
  });

  it("should register all expected dashboard paths", () => {
    const rootRoute = router.routes[0];
    const dashboardLayout = rootRoute.children?.[1];

    const paths = dashboardLayout?.children
      ?.map((route) => route.path)
      .filter(Boolean);

    expect(paths).toEqual([
      "/overview",
      "/expenses",
      "/categories",
      "/profile",
      "/logout",
    ]);
  });
});
