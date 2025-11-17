import { AIMap, GS1Field } from "./aiNames";
import { decode } from "./barcodeParser";
import type { BarcodeAnswer, ParsedElement, ParserOptions } from "./types";
import { DecodeResult, GROUP_SEPARATOR } from "./utils";

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
    const filteredItems: Partial<Record<GS1Field, ParsedElement>> = {};
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
