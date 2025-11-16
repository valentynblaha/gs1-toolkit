import { decode } from "./barcodeParser";
import type { BarcodeAnswer, ParsedElement, ParserOptions } from "./types";
import { DecodeResult, GROUP_SEPARATOR } from "./utils";

const AIMap: Record<string, string> = {
  ai00: "SSCC",
  ai01: "GTIN",
  ai02: "item", // Item Number
  ai10: "batch", // Batch or Lot Number
  ai11: "prodDate", // Production date
  ai13: "packDate", // Packaging date
  ai15: "safeDate", // Best Before Date
  ai17: "expDate", // Expiration Date
  ai21: "serial", // Serial Number
  ai240: "additionalProductID",
  ai241: "customerPartNumber",
  ai250: "secondarySerialNumber",
  ai30: "variableCount", // Variable Count
  ai3103: "netWeightKg", // Net weight in kg with 3 decimal places
  ai3106: "netWeightKg6", // Net weight in kg with 6 decimal places
  ai3203: "netWeightLb", // Net weight in pounds with 3 decimal places
  ai3206: "netWeightLb6", // Net weight in pounds with 6 decimal places
  ai37: "count", // Count of trade items in logistics unit
  ai3920: "price", // Price with ISO currency code
  ai3930: "priceWithISO", // Price with ISO currency code and price increment
  ai400: "customerInformation",
  ai401: "countryOfOrigin", // Country of origin or source
  ai410: "shipToPostalCode",
  ai411: "billToPostalCode",
  ai412: "purchaserPostalCode",
  ai413: "shipToCity",
  ai414: "globalLocationNumber", // GLN of physical location
  ai415: "shipToState",
  ai416: "countryCode", // Country code
  ai420: "postalCodeOfOrigin", // Postal code of origin
  ai421: "shipFromPostalCode",
  ai422: "languageIndicator",
  ai423: "countrySubdivision", // Country subdivision
  ai7001: "nsn", // National Stock Number
  ai7002: "ndc", // National Drug Code
  ai7030: "lotNumber", // Lot number
  ai7031: "epc", // Electronic Product Code
  ai7032: "scc", // Serial Shipping Container Code
  ai8001: "uvci", // Unique Vaccination Certificate Identifier
  ai8002: "mri", // Medical Record Identifier
  ai8003: "plb", // Patient Linked Barcode
  ai8018: "ssi", // Source Serial Item Identifier
  ai8020: "udid", // Unique Device Identifier
  ai8100: "pricePerUnit", // Price per unit of measure
  ai8110: "netVolumeLiters", // Net volume in liters with 3 decimal places
  ai8200: "productVariant",
  ai90: "custom0",
  ai91: "custom1",
  ai92: "custom2",
  ai93: "custom3",
  ai94: "custom4",
  ai95: "custom5",
  ai96: "custom6",
  ai97: "custom7",
  ai98: "custom8",
  ai99: "custom9",
};

class GS1Parser {
  public fncChar: string;
  public lotLen?: number;

  /**
   * Builds a GS1 barcode parser
   * @param options
   * @param options.fncChar The function character used as a separator in variable length fields. Default is ASCII 29 (Group Separator).
   * @param options.lotMaxLength The maximum length for lot/batch numbers. If not provided, no maximum length is enforced.
   */
  constructor(options?: ParserOptions) {
    this.fncChar = options?.fncChar || GROUP_SEPARATOR;
    this.lotLen = options?.lotMaxLength;
  }

  decode(barcode: string): DecodeResult {
    // Replace ( with GS separator (ASCII 29) and remove )
    let normalized = barcode.replaceAll("(", this.fncChar).replaceAll(")", "");

    // Remove leading FNC1 if present
    if (normalized.startsWith(this.fncChar)) {
      normalized = normalized.slice(1);
    }

    const parsed: BarcodeAnswer = decode(normalized, this.fncChar, this.lotLen);
    const filteredItems: Record<string, ParsedElement> = {};
    for (const item of parsed.parsedCodeItems) {
      const prop = AIMap["ai" + item.ai];
      if (prop) {
        filteredItems[prop] = item;
      }
    }

    return new DecodeResult(parsed.codeName, parsed.denormalized, filteredItems);
  }
}

export { GS1Parser };
