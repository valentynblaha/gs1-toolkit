import { describe, it, expect } from "vitest";
import { GS1Parser, GS1Field } from "../src/index";

// GS1 date AIs (YYMMDD): 11, 12, 13, 15, 17
const DATE_AIS = ["11", "12", "13", "15", "17"];

// Map AI to GS1Field enum
const AI_TO_FIELD: Record<string, GS1Field> = {
  "11": GS1Field.PROD_DATE,
  "12": GS1Field.DUE_DATE,
  "13": GS1Field.PACK_DATE,
  "15": GS1Field.BEST_BEFORE,
  "17": GS1Field.EXP_DATE,
};

// Valid GTIN for testing (14 digits with check digit)
const VALID_GTIN = "0101234567890128";

describe("GS1 Date Parsing - Edge Cases", () => {
  const parser = new GS1Parser();

  //
  // VALID CASES
  //
  const validDates: [string, Date][] = [
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
    ["130200", new Date(2013, 1, 28)], // Feb 2013 → 28
    ["160200", new Date(2016, 1, 29)], // Feb 2016 (leap) → 29
    ["210400", new Date(2021, 3, 30)], // Apr 2021 → 30
  ];

  for (const [dateValue, expectedDate] of validDates) {
    for (const ai of DATE_AIS) {
      it(`should parse valid GS1 date AI ${ai}: "${dateValue}"`, () => {
        const barcode = VALID_GTIN + ai + dateValue;
        const result = parser.decode(barcode);
        const field = AI_TO_FIELD[ai];
        expect(result.data[field]).toBeDefined();

        const parsedDate = result.data[field]!.data as Date;
        expect(parsedDate.getFullYear()).toBe(expectedDate.getFullYear());
        expect(parsedDate.getMonth()).toBe(expectedDate.getMonth());
        expect(parsedDate.getDate()).toBe(expectedDate.getDate());
      });
    }
  }

  //
  // INVALID DATE CASES (Should throw)
  //

  // prettier-ignore
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

  for (const dateValue of invalidDates) {
    for (const ai of DATE_AIS) {
      it(`should throw on invalid GS1 date AI ${ai}: "${dateValue}"`, () => {
        const barcode = VALID_GTIN + ai + dateValue;
        expect(() => parser.decode(barcode)).toThrow();
      });
    }
  }

  //
  // AMBIGUOUS EDGE CASES
  //
  describe("Ambiguous/Boundary Cases", () => {
    it("should follow the GS1 rule (section 7.12) for the century", () => {
      const barcode1 = VALID_GTIN + "17000101";
      const result1 = parser.decode(barcode1);
      expect((result1.data[GS1Field.EXP_DATE]!.data as Date).getFullYear()).toBe(2000);

      const barcode2 = VALID_GTIN + "17490101";
      const result2 = parser.decode(barcode2);
      expect((result2.data[GS1Field.EXP_DATE]!.data as Date).getFullYear()).toBe(2049);

      const barcode3 = VALID_GTIN + "17500101";
      const result3 = parser.decode(barcode3);
      expect((result3.data[GS1Field.EXP_DATE]!.data as Date).getFullYear()).toBe(2050);

      const barcode4 = VALID_GTIN + "17990101";
      const result4 = parser.decode(barcode4);
      expect((result4.data[GS1Field.EXP_DATE]!.data as Date).getFullYear()).toBe(1999);
    });

    it("should throw if value is partially missing (e.g., '23031')", () => {
      const barcode = VALID_GTIN + "1123031";
      expect(() => parser.decode(barcode)).toThrow();
    });

    it("should throw for February 30 or 31", () => {
      const barcode1 = VALID_GTIN + "17230230";
      expect(() => parser.decode(barcode1)).toThrow();

      const barcode2 = VALID_GTIN + "17230231";
      expect(() => parser.decode(barcode2)).toThrow();
    });

    it("should throw for April 31", () => {
      const barcode = VALID_GTIN + "15230431";
      expect(() => parser.decode(barcode)).toThrow();
    });
  });
});
