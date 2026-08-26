import { redirect, type ActionFunctionArgs } from "react-router";

import { auth } from "../../services";
import { useAuthStore } from "../../store";

async function getAuthData(req: Request) {
  const formData = await req.formData();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  return { email, password };
}

export async function loginAction({ request }: ActionFunctionArgs) {
  const { email, password } = await getAuthData(request);

  try {
    await auth(
      {
        email,
        password,
      },
      "login"
    );

    useAuthStore.getState().setIsAuthenticated(true);

    return redirect("/overview");
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    }

    return {
      error: "An unexpected error occurred.",
    };
  }
}

export async function signupAction({ request }: ActionFunctionArgs) {
  const { email, password } = await getAuthData(request);

  try {
    await auth(
      {
        email,
        password,
      },
      "signup"
    );

    useAuthStore.getState().setIsAuthenticated(true);

    return redirect("/overview");
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    }

    return {
      error: "An unexpected error occurred.",
    };
  }
}
