import { describe, it, expect } from "vitest";
import { GS1Parser, GS1Field } from "../src/index";

const GS = "\x1D";
const VALID_GTIN = "0101234567890128";

describe("GS1 AIs 4300-4333 Parsing", () => {
  const parser = new GS1Parser();

  describe("4300-4309: Ship-to fields", () => {
    const shipToTests: Array<[string, GS1Field, string]> = [
      ["4300", GS1Field.SHIP_TO_COMP, "ACME Corporation"],
      ["4301", GS1Field.SHIP_TO_NAME, "John Doe"],
      ["4302", GS1Field.SHIP_TO_ADD1, "123 Main Street"],
      ["4303", GS1Field.SHIP_TO_ADD2, "Suite 100"],
      ["4304", GS1Field.SHIP_TO_SUB, "Downtown"],
      ["4305", GS1Field.SHIP_TO_LOC, "Springfield"],
      ["4306", GS1Field.SHIP_TO_REG, "IL"],
      ["4307", GS1Field.SHIP_TO_COUNTRY, "US"],
      ["4308", GS1Field.SHIP_TO_PHONE, "+1-555-123-4567"],
      ["4309", GS1Field.SHIP_TO_GEO, "40.7128,-74.0060"],
    ];

    for (const [ai, field, testValue] of shipToTests) {
      it(`should parse AI ${ai} (${field}) with value "${testValue}"`, () => {
        const barcode = VALID_GTIN + ai + testValue;
        const result = parser.decode(barcode);
        expect(result.data[field]).toBeDefined();
        expect(result.data[field]!.data).toBe(testValue);
      });
    }

    it("should parse ship-to fields with GS separator", () => {
      const barcode = VALID_GTIN + "4300ACME Corp" + GS + "4301John Doe";
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.SHIP_TO_COMP]!.data).toBe("ACME Corp");
      expect(result.data[GS1Field.SHIP_TO_NAME]!.data).toBe("John Doe");
    });
  });

  describe("4310-4319: Return-to fields", () => {
    const returnToTests: Array<[string, GS1Field, string]> = [
      ["4310", GS1Field.RTN_TO_COMP, "Return Co Inc"],
      ["4311", GS1Field.RTN_TO_NAME, "Jane Smith"],
      ["4312", GS1Field.RTN_TO_ADD1, "456 Return Ave"],
      ["4313", GS1Field.RTN_TO_ADD2, "Building B"],
      ["4314", GS1Field.RTN_TO_SUB, "Industrial Park"],
      ["4315", GS1Field.RTN_TO_LOC, "Chicago"],
      ["4316", GS1Field.RTN_TO_REG, "IL"],
      ["4317", GS1Field.RTN_TO_COUNTRY, "US"],
      ["4318", GS1Field.RTN_TO_POST, "60601"],
      ["4319", GS1Field.RTN_TO_PHONE, "+1-555-987-6543"],
    ];

    for (const [ai, field, testValue] of returnToTests) {
      it(`should parse AI ${ai} (${field}) with value "${testValue}"`, () => {
        const barcode = VALID_GTIN + ai + testValue;
        const result = parser.decode(barcode);
        expect(result.data[field]).toBeDefined();
        expect(result.data[field]!.data).toBe(testValue);
      });
    }

    it("should parse return-to fields with GS separator", () => {
      const barcode = VALID_GTIN + "4310Return Co" + GS + "4311Jane Smith";
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.RTN_TO_COMP]!.data).toBe("Return Co");
      expect(result.data[GS1Field.RTN_TO_NAME]!.data).toBe("Jane Smith");
    });
  });

  describe("4320-4326: Service description and flags", () => {
    it("should parse AI 4320 (SRV DESCRIPTION)", () => {
      const barcode = VALID_GTIN + "4320EXPRESS DELIVERY";
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.SRV_DESCRIPTION]).toBeDefined();
      expect(result.data[GS1Field.SRV_DESCRIPTION]!.data).toBe("EXPRESS DELIVERY");
    });

    it("should parse AI 4321 (DANGEROUS GOODS)", () => {
      const barcode = VALID_GTIN + "4321Y";
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.DANGEROUS_GOODS]).toBeDefined();
      expect(result.data[GS1Field.DANGEROUS_GOODS]!.data).toBe("Y");
    });

    it("should parse AI 4322 (AUTH LEAVE)", () => {
      const barcode = VALID_GTIN + "4322N";
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.AUTH_LEAVE]).toBeDefined();
      expect(result.data[GS1Field.AUTH_LEAVE]!.data).toBe("N");
    });

    it("should parse AI 4323 (SIG REQUIRED)", () => {
      const barcode = VALID_GTIN + "4323Y";
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.SIG_REQUIRED]).toBeDefined();
      expect(result.data[GS1Field.SIG_REQUIRED]!.data).toBe("Y");
    });

    it("should parse AI 4324 (NBEF DEL DT)", () => {
      const barcode = VALID_GTIN + "43242401011530"; // YYMMDDHHMM format
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.NBEF_DEL_DT]).toBeDefined();
      expect(result.data[GS1Field.NBEF_DEL_DT]!.data).toBe("2401011530");
    });

    it("should parse AI 4325 (NAFT DEL DT)", () => {
      const barcode = VALID_GTIN + "43252501311700"; // YYMMDDHHMM format
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.NAFT_DEL_DT]).toBeDefined();
      expect(result.data[GS1Field.NAFT_DEL_DT]!.data).toBe("2501311700");
    });

    it("should parse AI 4326 (REL DATE)", () => {
      const barcode = VALID_GTIN + "4326240101"; // YYMMDD format
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.REL_DATE]).toBeDefined();
      expect(result.data[GS1Field.REL_DATE]!.dataString).toBe("240101");
    });
  });

  describe("4330-4333: Temperature fields", () => {
    // Temperature format: 6 digits where last 2 are decimal places
    // e.g., "203500" = 2035.00 = 20.35°C or °F
    // Optional negative sign after the 6 digits: "-", "–", "—"

    const tempTests: Array<[string, GS1Field, string, number, string]> = [
      ["4330", GS1Field.MAX_TEMP_F, "007520", 75.2, "°F"], // 75.2°F
      ["4331", GS1Field.MAX_TEMP_C, "000235", 2.35, "°C"], // 2.35°C
      ["4332", GS1Field.MIN_TEMP_F, "003200", 32, "°F"], // 32.0°F
      ["4333", GS1Field.MIN_TEMP_C, "000000", 0, "°C"], // 0.0°C
      ["4330", GS1Field.MAX_TEMP_F, "007520-", -75.2, "°F"], // -75.2°F
      ["4331", GS1Field.MAX_TEMP_C, "000235-", -2.35, "°C"], // -2.35°C
      ["4332", GS1Field.MIN_TEMP_F, "003200-", -32, "°F"], // -32.0°F
      ["4333", GS1Field.MIN_TEMP_C, "000000-", -0, "°C"], // -0.0°C
    ];

    for (const [ai, field, tempValue, expectedNum, unit] of tempTests) {
      it(`should parse AI ${ai} (${field}) with value "${tempValue}" as ${expectedNum}${unit}`, () => {
        const barcode = VALID_GTIN + ai + tempValue;
        const result = parser.decode(barcode);
        expect(result.data[field]).toBeDefined();
        const parsedTemp = result.data[field]!.data as number;
        expect(parsedTemp).toBeCloseTo(expectedNum, 2);
        expect(result.data[field]!.unit).toBe(unit);
      });
    }

    it("should parse negative temperature values", () => {
      // Negative temperatures use a sign character after the 6 digits
      const barcode = VALID_GTIN + "4331001800-"; // -18.00°C
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.MAX_TEMP_C]).toBeDefined();
      const parsedTemp = result.data[GS1Field.MAX_TEMP_C]!.data as number;
      expect(parsedTemp).toBeCloseTo(-18, 2);
    });

    it("should parse temperature with GS separator", () => {
      const barcode = VALID_GTIN + "4331002035" + GS + "4333000000";
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.MAX_TEMP_C]).toBeDefined();
      expect(result.data[GS1Field.MIN_TEMP_C]).toBeDefined();
      expect(result.data[GS1Field.MAX_TEMP_C]!.data as number).toBeCloseTo(20.35, 2);
      expect(result.data[GS1Field.MIN_TEMP_C]!.data as number).toBeCloseTo(0, 2);
    });

    it("should throw on invalid temperature (non-numeric)", () => {
      const barcode = VALID_GTIN + "4331ABC123";
      expect(() => parser.decode(barcode)).toThrow();
    });

    it("should throw on incomplete temperature (less than 6 digits)", () => {
      const barcode = VALID_GTIN + "433112345";
      expect(() => parser.decode(barcode)).toThrow();
    });
  });

  describe("Combined scenarios", () => {
    it("should parse multiple new AIs together", () => {
      const barcode = VALID_GTIN + "4300ACME Corp" + GS + "4307US" + GS + "4331002035" + GS + "4333000000";
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.SHIP_TO_COMP]!.data).toBe("ACME Corp");
      expect(result.data[GS1Field.SHIP_TO_COUNTRY]!.data).toBe("US");
      expect(result.data[GS1Field.MAX_TEMP_C]!.data as number).toBeCloseTo(20.35, 2);
      expect(result.data[GS1Field.MIN_TEMP_C]!.data as number).toBeCloseTo(0, 2);
    });

    it("should parse complete shipping address with temperature", () => {
      const barcode =
        VALID_GTIN +
        "4300Delivery Co" +
        GS +
        "4302123 Main St" +
        GS +
        "4305Springfield" +
        GS +
        "4306IL" +
        GS +
        "4307US" +
        GS +
        "4331000725" +
        GS +
        "4333000500";
      const result = parser.decode(barcode);
      expect(result.data[GS1Field.SHIP_TO_COMP]!.data).toBe("Delivery Co");
      expect(result.data[GS1Field.SHIP_TO_ADD1]!.data).toBe("123 Main St");
      expect(result.data[GS1Field.SHIP_TO_LOC]!.data).toBe("Springfield");
      expect(result.data[GS1Field.SHIP_TO_REG]!.data).toBe("IL");
      expect(result.data[GS1Field.SHIP_TO_COUNTRY]!.data).toBe("US");
      expect(result.data[GS1Field.MAX_TEMP_C]!.data as number).toBeCloseTo(7.25, 2);
      expect(result.data[GS1Field.MIN_TEMP_C]!.data as number).toBeCloseTo(5, 2);
    });
  });
});
