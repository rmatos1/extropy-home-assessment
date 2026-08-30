import { redirect, type ActionFunctionArgs } from "react-router";

import { auth, updateProfile, logout } from "../../../services";
import { useAuthStore } from "../../../store";

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

    useAuthStore.getState().setUserEmail(email);

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

    useAuthStore.getState().setUserEmail(email);

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

export async function updateProfileAction({ request }: ActionFunctionArgs) {
  const { email, password } = await getAuthData(request);

  const data = email ? { email } : { password };

  try {
    const updatedFields = await updateProfile(data);

    if (updatedFields.includes("email")) {
      useAuthStore.getState().setUserEmail(email);
    }

    if (updatedFields.length === 0) {
      throw new Error("No changes were made.");
    }

    return {
      success: true,
      updated: updatedFields[0],
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}

export async function logoutAction() {
  try {
    await logout();

    return redirect("/login");
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}
