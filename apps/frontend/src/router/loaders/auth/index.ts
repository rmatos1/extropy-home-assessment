import { redirect } from "react-router";

import { getCurrentUser } from "../../../services";

export async function requireAuthLoader() {
  try {
    return await getCurrentUser();
  } catch {
    throw redirect("/login");
  }
}

export async function redirectAuthenticatedLoader() {
  try {
    await getCurrentUser();

    throw redirect("/overview");
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    return null;
  }
}
