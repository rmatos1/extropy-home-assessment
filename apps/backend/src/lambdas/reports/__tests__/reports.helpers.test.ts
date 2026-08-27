import { describe, expect, it } from "vitest";

import { sortMonthsDescending } from "../reports.helpers";

describe("sortMonthsDescending", () => {
  it("should return -1 when the first month is more recent", () => {
    const result = sortMonthsDescending(["2026-08", {}], ["2026-07", {}]);

    expect(result).toBe(-1);
  });

  it("should return 1 when the second month is more recent", () => {
    const result = sortMonthsDescending(["2026-07", {}], ["2026-08", {}]);

    expect(result).toBe(1);
  });

  it("should return 0 when both months are equal", () => {
    const result = sortMonthsDescending(["2026-08", {}], ["2026-08", {}]);

    expect(result).toBe(0);
  });

  it("should sort months from most recent to oldest", () => {
    const entries: [string, unknown][] = [
      ["2026-06", {}],
      ["2026-08", {}],
      ["2026-07", {}],
    ];

    entries.sort(sortMonthsDescending);

    expect(entries.map(([month]) => month)).toEqual([
      "2026-08",
      "2026-07",
      "2026-06",
    ]);
  });
});
