import { AIMap, GS1Field } from "./aiNames";
import { decode } from "./barcodeParser";
import type { BarcodeAnswer, GS1DecodedData, ParsedElement, ParserOptions } from "./types";
import { DecodeResult, GROUP_SEPARATOR } from "./utils";

const defaultOptions: Partial<ParserOptions> = {
  fncChar: GROUP_SEPARATOR
};

class GS1Parser {
  options: ParserOptions;

  /**
   * Builds a GS1 barcode parser
   * @param options Barcode parser options
   */
  constructor(options?: ParserOptions) {
    this.options = {...defaultOptions, ...options};
  }

  /**
   * Performs the actual parsing
   * @param barcode The barcode to be parsed
   * @returns Parsed data
   */
  decode(barcode: string): DecodeResult {
    // Replace ( with GS separator (ASCII 29) and remove )
    let normalized = barcode.replaceAll("(", this.options.fncChar!).replaceAll(")", "");

    // Remove leading FNC1 if present
    if (normalized.startsWith(this.options.fncChar!)) {
      normalized = normalized.slice(1);
    }

    const parsed: BarcodeAnswer = decode(normalized, this.options);
    const filteredItems: Partial<Record<GS1Field, ParsedElement<GS1DecodedData>>> = {};
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
