import { describe, it, expect } from "vitest";
import { GS1Parser } from "../src/index";

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
    });
  }

  //
  // INVALID BARCODE CASES — SHOULD THROW
  //
  const invalidCases = [
    "",                                      // empty
    "01",                                    // truncated AI
    "01012345678901",                        // GTIN incomplete (needs 14 digits)
    "010123456789012X",                      // non-numeric in numeric-only AI
    "0101234567890128" + "17" + "991332",    // invalid date (AI 17)
    "0101234567890128" + "10",               // AI 10 but no data
    // "0101234567890128" + GS + GS + "10ABC",  // double GS not allowed
    "0101234567890128" + "21",               // AI 21 but no value
    "0000123456789012345X",                  // SSCC with invalid char
  ];

  for (const value of invalidCases) {
    it(`should throw on invalid GS1 barcode: "${JSON.stringify(value)}"`, () => {
      expect(() => parser.decode(value)).toThrow();
    });
  }
});
