import { describe, it, expect } from "vitest";
import { parseDate } from "../src/parsers";

// GS1 date AIs (YYMMDD): 11, 12, 13, 15, 17
const DATE_AIS = ["11", "12", "13", "15", "17"];

describe("GS1 Date Parsing - Edge Cases", () => {
  //
  // VALID CASES
  //
  const validDates = [
    // Normal valid dates
    ["000101", new Date(2000, 0, 1)],
    ["991231", new Date(1999, 11, 31)],

    // Leap years
    ["200229", new Date(2020, 1, 29)],
    ["040229", new Date(2004, 1, 29)],

    // Non-leap February
    ["230228", new Date(2023, 1, 28)],

    // End-of-month cases
    ["230430", new Date(2023, 3, 30)], // April 30
    ["230531", new Date(2023, 4, 31)], // May 31

    // **Day = 00 → last day of month**
    ["221200", new Date(2022, 11, 31)], // Dec 2022 → 31
    ["130200", new Date(2013, 1, 28)],  // Feb 2013 → 28
    ["160200", new Date(2016, 1, 29)],  // Feb 2016 (leap) → 29
    ["210400", new Date(2021, 3, 30)],  // Apr 2021 → 30
  ];

  for (const [value] of validDates) {
    for (const ai of DATE_AIS) {
      it(`should parse valid GS1 date AI ${ai}: "${value}"`, () => {
        expect(() => parseDate(ai, "", ai + value, false)).not.toThrow();
      });
    }
  }

  //
  // INVALID DATE CASES (Should throw)
  //
  const invalidDates = [
    "000000",     // month=00 → invalid even with day=00
    "991300",     // month=13
    "22AB10",     // invalid characters
    "12345",      // too short
    "1234567",    // too long

    // Invalid days except 00
    "991232",     // 32 not allowed
    "230231",     // Feb 31 nonexistent
    "230230",     // Feb 30 nonexistent
    "230431",     // April 31 doesn't exist

    // Invalid month/day combinations where day != 00
    "221431",     // month 14
  ];

  for (const value of invalidDates) {
    for (const ai of DATE_AIS) {
      it(`should throw on invalid GS1 date AI ${ai}: "${value}"`, () => {
        expect(() => parseDate(ai, "", ai + value, false)).toThrow();
      });
    }
  }

  //
  // AMBIGUOUS EDGE CASES
  //
  describe("Ambiguous/Boundary Cases", () => {
    it("should follow the GS1 rule (section 7.12) for the century", () => {
      expect(parseDate("17", "", "17000101", false).element.data.getFullYear()).toBe(2000);
      expect(parseDate("17", "", "17490101", false).element.data.getFullYear()).toBe(2049);
      expect(parseDate("17", "", "17500101", false).element.data.getFullYear()).toBe(2050);
      expect(parseDate("17", "", "17990101", false).element.data.getFullYear()).toBe(1999);
    });

    it("should throw if value is partially missing (e.g., '23031')", () => {
      expect(() => parseDate("11", "", "1123031", false)).toThrow();
    });

    it("should throw for February 30 or 31", () => {
      expect(() => parseDate("17", "", "17230230", false)).toThrow();
      expect(() => parseDate("17", "", "17230231", false)).toThrow();
    });

    it("should throw for April 31", () => {
      expect(() => parseDate("15", "", "15230431", false)).toThrow();
    });
  });
});
