import { describe, expect, it } from "vitest";

import { currencyFormatter, formatDate, formatMonth } from "../";

describe("helpers", () => {
  describe("currencyFormatter", () => {
    it("should format a value as USD currency", () => {
      expect(currencyFormatter.format(1234.56)).toBe("$1,234.56");
    });

    it("should format an integer with two decimal places", () => {
      expect(currencyFormatter.format(100)).toBe("$100.00");
    });

    it("should format zero", () => {
      expect(currencyFormatter.format(0)).toBe("$0.00");
    });
  });

  describe("formatDate", () => {
    it("should format an ISO date as DD/MM/YYYY", () => {
      expect(formatDate("2026-08-30")).toBe("30/08/2026");
    });

    it("should preserve leading zeros", () => {
      expect(formatDate("2026-01-05")).toBe("05/01/2026");
    });

    it("should format the first day of the year correctly", () => {
      expect(formatDate("2026-01-01")).toBe("01/01/2026");
    });
  });

  describe("formatMonth", () => {
    it("should format a month as abbreviated month and two-digit year", () => {
      expect(formatMonth("2026-08")).toBe("Aug 26");
    });

    it("should format January correctly", () => {
      expect(formatMonth("2026-01")).toBe("Jan 26");
    });

    it("should format December correctly", () => {
      expect(formatMonth("2026-12")).toBe("Dec 26");
    });

    it("should format a different year correctly", () => {
      expect(formatMonth("2027-03")).toBe("Mar 27");
    });
  });
});
