import type { SpendingReportResponse } from "@extropy/shared";

import { api } from "../api";

export function getSpendingReport(): Promise<SpendingReportResponse> {
  return api<SpendingReportResponse>("/spending-report", {
    method: "GET",
  });
}