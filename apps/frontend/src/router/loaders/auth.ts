import { redirect } from "react-router";

import { getCurrentUser } from "../services/auth";

export async function currentUserLoader() {
  try {
    await getCurrentUser();

    return null;
  } catch {
    throw redirect("/login");
  }
}
