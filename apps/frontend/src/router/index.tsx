import { createBrowserRouter, Navigate } from "react-router";

import { AuthLayout, DashboardLayout } from "../layouts";
import { Login, Signup } from "../pages";
import { dashboardNavigation } from "../constants";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/login" replace />,
      },
      {
        path: "/login",
        Component: Login,
      },
      {
        path: "/signup",
        Component: Signup,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: dashboardNavigation.map(({ to, Component, name }) => ({
      path: to,
      Component,
      handle: {
        name,
      },
    })),
  },
]);
