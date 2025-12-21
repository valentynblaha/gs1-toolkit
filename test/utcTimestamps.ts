import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GS1Parser, GS1Field } from "../src/index";

// GS1 date AIs (YYMMDD format): 11, 12, 13, 15, 16, 17, 7006
const DATE_AIS = ["11", "12", "13", "15", "16", "17", "7006"];

// Map AI to GS1Field enum
const AI_TO_FIELD: Record<string, GS1Field> = {
  "11": GS1Field.PROD_DATE,
  "12": GS1Field.DUE_DATE,
  "13": GS1Field.PACK_DATE,
  "15": GS1Field.BEST_BEFORE,
  "16": GS1Field.SELL_BY,
  "17": GS1Field.EXP_DATE,
  "7006": GS1Field.FIRST_FREEZE_DATE,
};

// Valid GTIN for testing (14 digits with check digit)
const VALID_GTIN = "0101234567890128";

describe("GS1Parser utcTimestamps option", () => {
  let originalTimezone: string | undefined;

  beforeEach(() => {
    // Store original timezone
    originalTimezone = process.env.TZ;
  });

  afterEach(() => {
    // Restore original timezone
    if (originalTimezone) {
      process.env.TZ = originalTimezone;
    } else {
      delete process.env.TZ;
    }
  });

  describe("utcTimestamps: false (default - local time)", () => {
    const parser = new GS1Parser({ utcTimestamps: false });

    it("should set time to 00:00:00.000 in local timezone", () => {
      const barcode = VALID_GTIN + "17240101"; // Jan 1, 2024
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
      expect(date.getMilliseconds()).toBe(0);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(1);
    });

    it("should handle dates at midnight (00:00) correctly", () => {
      const barcode = VALID_GTIN + "17240101"; // Jan 1, 2024
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
      expect(date.getMilliseconds()).toBe(0);
    });

    it("should handle end-of-month dates correctly", () => {
      const barcode = VALID_GTIN + "17240131"; // Jan 31, 2024
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
      expect(date.getDate()).toBe(31);
    });

    it("should handle end-of-year dates correctly", () => {
      const barcode = VALID_GTIN + "17231231"; // Dec 31, 2023
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(11); // December is 11
      expect(date.getDate()).toBe(31);
    });

    it("should handle leap year February 29 correctly", () => {
      const barcode = VALID_GTIN + "17240229"; // Feb 29, 2024 (leap year)
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(1); // February is 1
      expect(date.getDate()).toBe(29);
    });

    it("should use local timezone offset", () => {
      const barcode = VALID_GTIN + "17240101";
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      // The date should be at local midnight, not UTC midnight
      // We can verify this by checking that getTime() differs from UTC
      const localMidnight = new Date(2024, 0, 1, 0, 0, 0, 0);
      expect(date.getTime()).toBe(localMidnight.getTime());
    });
  });

  describe("utcTimestamps: true (UTC time)", () => {
    const parser = new GS1Parser({ utcTimestamps: true });

    it("should set time to 00:00:00.000 UTC", () => {
      const barcode = VALID_GTIN + "17240101"; // Jan 1, 2024
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
      expect(date.getUTCMilliseconds()).toBe(0);
      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(0); // January is 0
      expect(date.getUTCDate()).toBe(1);
    });

    it("should handle dates at midnight UTC (00:00) correctly", () => {
      const barcode = VALID_GTIN + "17240101"; // Jan 1, 2024
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
      expect(date.getUTCMilliseconds()).toBe(0);
    });

    it("should handle end-of-month dates correctly in UTC", () => {
      const barcode = VALID_GTIN + "17240131"; // Jan 31, 2024
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
      expect(date.getUTCDate()).toBe(31);
    });

    it("should handle end-of-year dates correctly in UTC", () => {
      const barcode = VALID_GTIN + "17231231"; // Dec 31, 2023
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
      expect(date.getUTCFullYear()).toBe(2023);
      expect(date.getUTCMonth()).toBe(11); // December is 11
      expect(date.getUTCDate()).toBe(31);
    });

    it("should handle leap year February 29 correctly in UTC", () => {
      const barcode = VALID_GTIN + "17240229"; // Feb 29, 2024 (leap year)
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(1); // February is 1
      expect(date.getUTCDate()).toBe(29);
    });

    it("should produce UTC timestamps regardless of local timezone", () => {
      const barcode = VALID_GTIN + "17240101";
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      // The date should be at UTC midnight
      const utcMidnight = Date.UTC(2024, 0, 1, 0, 0, 0, 0);
      expect(date.getTime()).toBe(utcMidnight);
    });

    it("should handle dates that might cross day boundaries in different timezones", () => {
      // Test a date that, when converted to certain timezones, might appear to be a different day
      const barcode = VALID_GTIN + "17240101"; // Jan 1, 2024 UTC
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      // In UTC, it should be Jan 1, 2024 00:00:00
      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(0);
      expect(date.getUTCDate()).toBe(1);
      expect(date.getUTCHours()).toBe(0);
    });
  });

  describe("Comparison: UTC vs Local timestamps", () => {
    it("should produce different timestamps for UTC vs local when timezone offset exists", () => {
      const utcParser = new GS1Parser({ utcTimestamps: true });
      const localParser = new GS1Parser({ utcTimestamps: false });

      const barcode = VALID_GTIN + "17240101"; // Jan 1, 2024

      const utcResult = utcParser.decode(barcode);
      const localResult = localParser.decode(barcode);

      const utcDate = utcResult.data[GS1Field.EXP_DATE]!.data as Date;
      const localDate = localResult.data[GS1Field.EXP_DATE]!.data as Date;

      // Both should represent the same calendar date
      expect(utcDate.getUTCFullYear()).toBe(localDate.getFullYear());
      expect(utcDate.getUTCMonth()).toBe(localDate.getMonth());
      expect(utcDate.getUTCDate()).toBe(localDate.getDate());

      // But the timestamps may differ if local timezone is not UTC
      // UTC date should always be at UTC midnight
      expect(utcDate.getUTCHours()).toBe(0);
      // Local date should be at local midnight
      expect(localDate.getHours()).toBe(0);
    });

    it("should handle edge case: date at year boundary", () => {
      const utcParser = new GS1Parser({ utcTimestamps: true });
      const localParser = new GS1Parser({ utcTimestamps: false });

      const barcode = VALID_GTIN + "17231231"; // Dec 31, 2023

      const utcResult = utcParser.decode(barcode);
      const localResult = localParser.decode(barcode);

      const utcDate = utcResult.data[GS1Field.EXP_DATE]!.data as Date;
      const localDate = localResult.data[GS1Field.EXP_DATE]!.data as Date;

      expect(utcDate.getUTCFullYear()).toBe(2023);
      expect(localDate.getFullYear()).toBe(2023);
      expect(utcDate.getUTCMonth()).toBe(11);
      expect(localDate.getMonth()).toBe(11);
      expect(utcDate.getUTCDate()).toBe(31);
      expect(localDate.getDate()).toBe(31);
    });

    it("should handle edge case: date at month boundary", () => {
      const utcParser = new GS1Parser({ utcTimestamps: true });
      const localParser = new GS1Parser({ utcTimestamps: false });

      const barcode = VALID_GTIN + "17240131"; // Jan 31, 2024

      const utcResult = utcParser.decode(barcode);
      const localResult = localParser.decode(barcode);

      const utcDate = utcResult.data[GS1Field.EXP_DATE]!.data as Date;
      const localDate = localResult.data[GS1Field.EXP_DATE]!.data as Date;

      expect(utcDate.getUTCMonth()).toBe(0);
      expect(localDate.getMonth()).toBe(0);
      expect(utcDate.getUTCDate()).toBe(31);
      expect(localDate.getDate()).toBe(31);
    });
  });

  describe("All date AIs with utcTimestamps", () => {
    const testCases = [
      { dateValue: "240101", description: "Jan 1, 2024" },
      { dateValue: "240131", description: "Jan 31, 2024 (end of month)" },
      { dateValue: "240229", description: "Feb 29, 2024 (leap year)" },
      { dateValue: "240228", description: "Feb 28, 2024" },
      { dateValue: "241231", description: "Dec 31, 2024 (end of year)" },
      { dateValue: "240101", description: "Jan 1, 2024" },
    ];

    for (const { dateValue, description } of testCases) {
      describe(`Date: ${description} (${dateValue})`, () => {
        it("should parse correctly with utcTimestamps: false", () => {
          const parser = new GS1Parser({ utcTimestamps: false });

          for (const ai of DATE_AIS) {
            const barcode = VALID_GTIN + ai + dateValue;
            const result = parser.decode(barcode);
            const field = AI_TO_FIELD[ai];

            if (field) {
              const date = result.data[field]!.data as Date;
              expect(date.getHours()).toBe(0);
              expect(date.getMinutes()).toBe(0);
              expect(date.getSeconds()).toBe(0);
            }
          }
        });

        it("should parse correctly with utcTimestamps: true", () => {
          const parser = new GS1Parser({ utcTimestamps: true });

          for (const ai of DATE_AIS) {
            const barcode = VALID_GTIN + ai + dateValue;
            const result = parser.decode(barcode);
            const field = AI_TO_FIELD[ai];

            if (field) {
              const date = result.data[field]!.data as Date;
              expect(date.getUTCHours()).toBe(0);
              expect(date.getUTCMinutes()).toBe(0);
              expect(date.getUTCSeconds()).toBe(0);
            }
          }
        });
      });
    }
  });

  describe("Edge cases: midnight boundary conditions", () => {
    it("should handle dates that are exactly at midnight UTC", () => {
      const parser = new GS1Parser({ utcTimestamps: true });
      const barcode = VALID_GTIN + "17240101"; // Jan 1, 2024
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      // Should be exactly midnight UTC
      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
      expect(date.getUTCMilliseconds()).toBe(0);
    });

    it("should handle dates that are exactly at midnight local time", () => {
      const parser = new GS1Parser({ utcTimestamps: false });
      const barcode = VALID_GTIN + "17240101"; // Jan 1, 2024
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      // Should be exactly midnight local time
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
      expect(date.getMilliseconds()).toBe(0);
    });

    it("should ensure UTC timestamps are timezone-independent", () => {
      const parser = new GS1Parser({ utcTimestamps: true });
      const barcode = VALID_GTIN + "17240101";
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      // The timestamp should represent UTC midnight regardless of local timezone
      const expectedUTC = Date.UTC(2024, 0, 1, 0, 0, 0, 0);
      expect(date.getTime()).toBe(expectedUTC);
    });
  });

  describe("Default behavior (utcTimestamps not specified)", () => {
    it("should default to local time when utcTimestamps is not specified", () => {
      const parser = new GS1Parser(); // No options
      const barcode = VALID_GTIN + "17240101";
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      // Should use local time (same as utcTimestamps: false)
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
    });

    it("should default to local time when utcTimestamps is explicitly false", () => {
      const parser = new GS1Parser({ utcTimestamps: false });
      const barcode = VALID_GTIN + "17240101";
      const result = parser.decode(barcode);
      const date = result.data[GS1Field.EXP_DATE]!.data as Date;

      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
    });
  });
});
