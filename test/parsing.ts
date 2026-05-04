import { describe, expect, it } from "vitest";
import { ElementType, GS1Field, GS1Parser } from "../src/index";

const GS = "\x1D";
const parser = new GS1Parser();

describe("GS1 parser validation", () => {

  //
  // VALID BARCODE CASES — SHOULD NOT THROW
  //
  const validCases = [
    // Simple GTIN (AI 01 = 14 digits)
    "0101234567890128",

    // GTIN + Lot (AI 10 = variable-length)
    "0101234567890128" + "10ABC123",

    // GTIN + Lot with GS separator
    "0101234567890128" + GS + "10ABC123",

    // GTIN + Lot + Expiration date (AI 17 = fixed length, YYMMDD)
    "0101234567890128" + "17" + "260101" + "10LOT77",

    // Multiple AIs using GS separators
    "0101234567890128" + "17" + "260101" + GS + "10LOT77" + GS,

    // GTIN (01) + Serial (21 variable)
    "0101234567890128" + "21SER1234",

    // GS between variable-length and fixed-length AIs
    "0101234567890128" + "10LOT123" + GS + "17260101",

    // GS1 with AI 00 (SSCC)
    "00001234567890123456", // SSCC is 18 digits,

    // GTIN + Production date with day 00 (AI 17 = fixed length, YYMMDD)
    "010123456789012817991200"
  ];

  for (const value of validCases) {
    it(`should parse valid GS1 barcode: "${JSON.stringify(value)}"`, () => {
      expect(() => parser.decode(value)).not.toThrow();
      expect(() => parser.decode(value)).toBeTruthy();
    });
  }

  //
  // INVALID BARCODE CASES — SHOULD THROW
  //
  const invalidCases = [
    "",                                      // empty
    // "0101234567890128" + GS + GS + "10ABC",  // double GS not allowed
  ]
  for (const value of invalidCases) {
    it(`should throw on invalid GS1 barcode: "${JSON.stringify(value)}"`, () => {
      expect(() => parser.decode(value)).toThrow();
    });
  }

  //
  // INVALID BARCODE CASES — SHOULD THROW
  //
  const invalidCases2 = [
    { barcode: "01", field: GS1Field.GTIN },                                   // truncated AI
    { barcode: "01012345678901", field: GS1Field.GTIN },                       // GTIN incomplete (needs 14 digits)
    { barcode: "010123456789012X", field: GS1Field.GTIN },                     // non-numeric in numeric-only AI
    { barcode: "0101234567890128" + "17" + "991332", field: GS1Field.EXP_DATE },   // invalid date (AI 17)
    { barcode: "0101234567890128" + "10", field: GS1Field.BATCH },              // AI 10 but no data
    { barcode: "0101234567890128" + "21", field: GS1Field.SERIAL },              // AI 21 but no value
    { barcode: "0000123456789012345X", field: GS1Field.SSCC },                 // SSCC with invalid char
  ];

  for (const v of invalidCases2) {
    it(`should be an error for invalid GS1 barcode: "${JSON.stringify(v.barcode)}"`, () => {
      const result = parser.decode(v.barcode);
      expect(result.data?.[v.field]?.type).toBe(ElementType.Error);
      expect(result.isValid).toBeFalsy();
    });
  }
});
