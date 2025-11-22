import type { GS1Field } from "./aiNames";
import type { ElementType, GS1DecodedData, ParsedElement } from "./types";

export const GROUP_SEPARATOR = String.fromCodePoint(29);

export const NUMERIC_REGEX = /^\d+$/;

export enum BarcodeErrorCodes {
  BarcodeNotANum = 1,
  EmptyBarcode,
  BarcodeNotGS1,
  InvalidBarcode,
  InvalidNumAI,
  InvalidNormalAI,
  InvalidDate,
  InvalidNum,
  FixedLengthDataTooShort,
  EmptyVariableLengthData,
  NumericDataExpected,
  UnknownErr,
}

export class InternalError extends Error {
  constructor(code: string, ex: Error) {
    super(code);
    this.name = "InternalError";
    this.code = code;
    this.ex = ex;
  }
  ex: Error;
  code: string;
}

export class InvalidAiError extends Error {
  constructor(prev: string, current: string) {
    let des: string;
    if (prev) {
      des = `Invalid AI identifier "${current}" after "${prev}"`;
    } else {
      des = `Invalid first AI identifier "${current}"`;
    }
    super(des);
    this.name = "InvalidAiError";
  }
}

export class BarcodeError extends Error {
  constructor(num: number, code: string | number, des: string) {
    super(des);
    this.name = "BarcodeError";
    this.num = num;
    this.code = code;
    this.des = des;
  }
  num: number;
  code: string | number;
  des: string;
}

export class ParsedElementClass implements ParsedElement {
  ai: string;
  dataTitle: string;
  data: GS1DecodedData;
  dataString: string;
  unit: string;

  /**
   * "ParsedElement" is the
   *
   * @constructor for ParsedElements, the components of the array returned by parseBarcode
   * @param elementAI        the AI of the recognized element
   * @param elementDataTitle the title of the element, i.e. its short description
   * @param elementType      a one-letter string describing the type of the element.
   *                                  allowed values are
   *                                  "S" for strings,
   *                                  "N" for numbers and
   *                                  "D" for dates
   */
  constructor(elementAI: string, elementDataTitle: string, elementType: ElementType) {
    this.ai = elementAI;
    this.dataTitle = elementDataTitle;
    this.unit = "";
    this.dataString = "";

    switch (elementType) {
      case "S":
        this.data = "";
        break;
      case "N":
        this.data = 0;
        break;
      case "D":
        this.data = new Date();
        this.data.setHours(0, 0, 0, 0);
        break;
      default:
        this.data = "";
        break;
    }
  }
}

/**
 * The result returned by {@link GS1Parser#decode}
 */
export class DecodeResult {
  constructor(
    /**
     * A barcode type identifier (a simple string denoting the type of barcode)
     */
    public codeName: string,
    /**
     * Human readable full barcode, with parentheses surrounding AIs
     */
    public denormalized: string,
    /**
     * The actual parsed data, presented in a dictionary
     */
    public data: Partial<Record<GS1Field, ParsedElement>> = {}
  ) {}
}

/**
 * some data items are followed by an FNC even in case of
 * fixed length, so the codestringToReturn may have
 * leading FNCs.
 *
 * This function eleminates these leading FNCs.
 *
 * @param   {String} stringToClean string which has to be cleaned
 * @param   {String} fncChar      the FNC-character to remove
 * @returns {String} the cleaned string
 */
export function cleanCodestring(stringToClean: string, fncChar: string): string {
  let result = stringToClean;
  let firstChar = result.slice(0, 1);
  while (firstChar === fncChar) {
    result = result.slice(1);
    firstChar = result.slice(0, 1);
  }
  return result;
}

export function checkValidDate(year: number, month: number, day: number): boolean {
  // Month must be between 0 and 11
  if (month < 0 || month > 11) return false;

  let m = month;
  if (day === 0) {
    m++;
  }

  // Construct the date
  const date = new Date(year, m, day);

  // Check that JS didn’t overflow into the next month
  const isValid =
    date.getFullYear() === year && date.getMonth() === month && (date.getDate() === day || day === 0); // Allow day 00 as valid (represents unknown day)

  return isValid;
}
