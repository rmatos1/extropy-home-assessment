import { createBrowserRouter, Navigate } from "react-router";

import { AuthLayout, DashboardLayout, RootLayout } from "../layouts";
import { ErrorBoundary, LoadingScreen } from "../components";
import {
  Login,
  Signup,
  Categories,
  Expenses,
  Overview,
  Profile,
} from "../pages";
import {
  loginAction,
  signupAction,
  updateProfileAction,
  logoutAction,
  expenseActions,
  createCategoryAction,
} from "./actions";
import {
  requireAuthLoader,
  redirectAuthenticatedLoader,
  categoriesLoader,
  expensesLoader,
  overviewLoader,
} from "./loaders";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    ErrorBoundary,
    HydrateFallback: LoadingScreen,
    children: [
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
            loader: redirectAuthenticatedLoader,
          },
          {
            path: "/signup",
            Component: Signup,
            action: signupAction,
            loader: redirectAuthenticatedLoader,
          },
        ],
      },
      {
        element: <DashboardLayout />,
        loader: requireAuthLoader,
        children: [
          {
            path: "/overview",
            Component: Overview,
            loader: overviewLoader,
            handle: {
              name: "Overview",
            },
          },
          {
            path: "/expenses",
            Component: Expenses,
            loader: expensesLoader,
            action: expenseActions,
            handle: {
              name: "Expenses",
            },
          },
          {
            path: "/categories",
            Component: Categories,
            loader: categoriesLoader,
            action: createCategoryAction,
            handle: {
              name: "Categories",
            },
          },
          {
            path: "/profile",
            Component: Profile,
            action: updateProfileAction,
            handle: {
              name: "Profile",
            },
          },
          {
            path: "/logout",
            action: logoutAction,
          },
        ],
      },
    ],
  },
]);
