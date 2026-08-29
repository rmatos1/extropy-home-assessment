import { createBrowserRouter, Navigate } from "react-router";

import { AuthLayout, DashboardLayout } from "../layouts";
import { Login, Signup } from "../pages";
import { dashboardNavigation } from "../constants";
import { loginAction, signupAction } from "./actions/auth";
import { currentUserLoader } from "./loaders/auth";

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
        action: loginAction,
        //loader: () => currentUserLoader("/overview"),
      },
      {
        path: "/signup",
        Component: Signup,
        action: signupAction,
        //loader: () => currentUserLoader("/overview"),
      },
    ],
  },
  {
    element: <DashboardLayout />,
    //loader: () => currentUserLoader("/login"),
    children: dashboardNavigation.map(({ to, Component, name }) => ({
      path: to,
      Component,
      handle: {
        name,
      },
    })),
  },
]);
