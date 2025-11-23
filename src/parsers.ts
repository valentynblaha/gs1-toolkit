import type { ParseResult } from "./types";
import {
  BarcodeError,
  BarcodeErrorCodes,
  checkValidDate,
  InternalError,
  InvalidAiError,
  NUMERIC_REGEX,
  ParsedElementClass,
} from "./utils";

/**
 * Used for calculating numbers which are given as string
 * with a given number of fractional decimals.
 *
 * To avoid conversion errors binary <-> decimal I _don't_
 * just divide by 10 numberOfFractionals times.
 */
export function parseFloatingPoint(stringToParse: string, numberOfFractionals: number): number {
  const offset = stringToParse.length - numberOfFractionals;
  const auxString = stringToParse.slice(0, offset) + "." + stringToParse.slice(offset);
  try {
    return Number.parseFloat(auxString);
  } catch (error_) {
    throw new InternalError("36", error_ as Error);
  }
}

/**
 * dates in GS1-elements have the format "YYMMDD".
 * This function generates a new ParsedElement and tries to fill a
 * JS-date into the "data"-part.
 * @param {String} ai    the AI to use for the ParsedElement
 * @param {String} title the title to use for the ParsedElement
 * @param {String} codestring the codestring to parse the date from
 */
export function parseDate(ai: string, title: string, codestring: string): ParseResult<Date> {
  const elementToReturn = new ParsedElementClass<Date>(ai, title, "D");
  const offSet = ai.length;
  const dateYYMMDD = codestring.slice(offSet, offSet + 6);
  let yearAsNumber = 0;
  let monthAsNumber = 0;
  let dayAsNumber = 0;

  try {
    yearAsNumber = Number.parseInt(dateYYMMDD.slice(0, 2), 10);
  } catch (error_) {
    throw new InternalError("33", error_ as Error);
  }

  try {
    monthAsNumber = Number.parseInt(dateYYMMDD.slice(2, 4), 10) - 1;
  } catch (error_) {
    throw new InternalError("34", error_ as Error);
  }

  try {
    dayAsNumber = Number.parseInt(dateYYMMDD.slice(4, 6), 10);
  } catch (error_) {
    throw new InternalError("35", error_ as Error);
  }

  // we are in the 21st century, but section 7.12 of the specification
  // states that years 51-99 should be considered to belong to the
  // 20th century:
  if (yearAsNumber > 50) {
    yearAsNumber = yearAsNumber + 1900;
  } else {
    yearAsNumber = yearAsNumber + 2000;
  }

  if (!checkValidDate(yearAsNumber, monthAsNumber, dayAsNumber)) {
    throw new BarcodeError(
      BarcodeErrorCodes.InvalidDate,
      "36",
      `Invalid date "${dateYYMMDD}" for AI "${ai}".`
    );
  }

  if (dayAsNumber === 0) {
    monthAsNumber++;
  }

  elementToReturn.data.setFullYear(yearAsNumber, monthAsNumber, dayAsNumber);
  elementToReturn.dataString = dateYYMMDD;

  return { element: elementToReturn, codestring: codestring.slice(offSet + 6, codestring.length) };
}

/**
 * simple: the element has a fixed length AND is not followed by an FNC1.
 * @param {String} ai     the AI to use
 * @param {String} title  its title, i.e. its short description
 * @param {Number} length the fixed length
 * @param {String} codestring the codestring to parse from
 * @param {Boolean} numeric whether the data is numeric or alphanumeric (default: false)
 */
export function parseFixedLength(
  ai: string,
  title: string,
  length: number,
  codestring: string,
  numeric: boolean = false
): ParseResult<string> {
  const elementToReturn = new ParsedElementClass<string>(ai, title, "S");
  const offSet = ai.length;
  const data = codestring.slice(offSet, length + offSet);

  if (data.length < length) {
    throw new BarcodeError(
      BarcodeErrorCodes.FixedLengthDataTooShort,
      "37",
      `Data length ${data.length} is less than expected length ${length} for AI "${ai}".`
    );
  }

  if (numeric && !NUMERIC_REGEX.test(data)) {
    throw new BarcodeError(
      BarcodeErrorCodes.NumericDataExpected,
      "39",
      `Numeric data expected for AI "${ai}", but got "${data}".`
    );
  }

  elementToReturn.data = data;
  elementToReturn.dataString = data;
  const codestringToReturn = codestring.slice(length + offSet, codestring.length);
  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * tries to parse an element of variable length
 * some fixed length AIs are terminated by FNC1, so this function
 * is used even for fixed length items
 * @param {String} ai    the AI to use
 * @param {String} title its title, i.e. its short description
 * @param {String} codestring the codestring to parse from
 * @param {String} fncChar the FNC-character to use as terminator
 * @param {Number} maxLength the maximum length of the variable length element
 * @param {Boolean} numeric whether the data is numeric or alphanumeric (default: false)
 */
export function parseVariableLength(
  ai: string,
  title: string,
  codestring: string,
  fncChar: string,
  maxLength?: number,
  numeric: boolean = false
): ParseResult<string> {
  const elementToReturn = new ParsedElementClass<string>(ai, title, "S");
  const offSet = ai.length;
  const posOfFNC = codestring.indexOf(fncChar);
  let codestringToReturn = "";

  if (posOfFNC === -1) {
    //we've got the last element of the barcode
    if (maxLength && maxLength > 0) {
      //lot
      elementToReturn.data = codestring.slice(offSet, maxLength + offSet);
      codestringToReturn = codestring.replace(ai + elementToReturn.data, "");
    } else {
      elementToReturn.data = codestring.slice(offSet, codestring.length);
    }
  } else {
    elementToReturn.data = codestring.slice(offSet, posOfFNC);
    codestringToReturn = codestring.slice(posOfFNC + 1, codestring.length);
  }

  if (elementToReturn.data === "") {
    throw new BarcodeError(
      BarcodeErrorCodes.EmptyVariableLengthData,
      "38",
      `Variable length data for AI "${ai}" is empty.`
    );
  }

  if (numeric && !NUMERIC_REGEX.test(elementToReturn.data)) {
    throw new BarcodeError(
      BarcodeErrorCodes.NumericDataExpected,
      "39",
      `Numeric data expected for AI "${ai}", but got "${elementToReturn.data}".`
    );
  }

  elementToReturn.dataString = elementToReturn.data;

  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * parses data elements of variable length, which additionally have
 *
 * - an indicator for the number of valid decimals
 * - an implicit unit of measurement
 *
 * These data elements contain e.g. a weight or length.
 *
 */
export function parseVariableLengthMeasure(
  ai_stem: string,
  fourthNumber: string,
  title: string,
  unit: string,
  codestring: string,
  fncChar: string
): ParseResult<number> {
  // the place of the decimal fraction is given by the fourth number, that's
  // the first after the identifier itself.
  const elementToReturn = new ParsedElementClass<number>(ai_stem + fourthNumber, title, "N");
  const offSet = ai_stem.length + 1;
  const posOfFNC = codestring.indexOf(fncChar);
  const numberOfDecimals = Number.parseInt(fourthNumber, 10);
  let numberPart = "";

  let codestringToReturn = "";
  if (posOfFNC === -1) {
    numberPart = codestring.slice(offSet, codestring.length);
  } else {
    numberPart = codestring.slice(offSet, posOfFNC);
    codestringToReturn = codestring.slice(posOfFNC + 1, codestring.length);
  }
  // adjust decimals according to fourthNumber:

  elementToReturn.data = parseFloatingPoint(numberPart, numberOfDecimals);
  elementToReturn.dataString = numberPart;
  elementToReturn.unit = unit;
  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * the place of the decimal fraction is given by the fourth number, that's
 * the first after the identifier itself.
 *
 * All of theses elements have a length of 6 characters.
 * @param {String} ai_stem      the first digits of the AI, _not_ the fourth digit
 * @param {Number} fourthNumber the 4th number indicating the count of valid fractionals
 * @param {String} title        the title of the AI
 * @param {String} unit         often these elements have an implicit unit of measurement
 * @param {String} codestring  the codestring to parse from
 */
export function parseFixedLengthMeasure(
  ai_stem: string,
  fourthNumber: string,
  title: string,
  unit: string,
  codestring: string
): ParseResult<number> {
  const elementToReturn = new ParsedElementClass<number>(ai_stem + fourthNumber, title, "N");
  const offSet = ai_stem.length + 1;

  if (!NUMERIC_REGEX.test(fourthNumber)) {
    throw new InvalidAiError(ai_stem, fourthNumber);
  }

  const numberOfDecimals = Number.parseInt(fourthNumber, 10);
  const numberPart = codestring.slice(offSet, offSet + 6);

  if (!NUMERIC_REGEX.test(numberPart)) {
    throw new BarcodeError(
      BarcodeErrorCodes.NumericDataExpected,
      "39",
      `Numeric data expected for AI "${ai_stem + fourthNumber}", but got "${numberPart}".`
    );
  }

  elementToReturn.data = parseFloatingPoint(numberPart, numberOfDecimals);
  elementToReturn.dataString = numberPart;
  elementToReturn.unit = unit;
  const codestringToReturn = codestring.slice(offSet + 6, codestring.length);

  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * parses data elements of variable length, which additionally have
 *
 * - an indicator for the number of valid decimals
 * - an explicit unit of measurement
 *
 * These data element contain amounts to pay or prices.
 * @param {String} ai_stem      the first digits of the AI, _not_ the fourth digit
 * @param {Number} fourthNumber the 4th number indicating the count of valid fractionals
 * @param {String} title        the title of the AI
 * @param {String} codestring   the codestring to parse from
 * @param {String} fncChar      the FNC-character to remove
 */
export function parseVariableLengthWithISONumbers(
  ai_stem: string,
  fourthNumber: string,
  title: string,
  codestring: string,
  fncChar: string
): ParseResult<number> {
  // an element of variable length, representing a number, followed by
  // some ISO-code.
  const elementToReturn = new ParsedElementClass<number>(ai_stem + fourthNumber, title, "N");
  const offSet = ai_stem.length + 1;
  const posOfFNC = codestring.indexOf(fncChar);
  const numberOfDecimals = Number.parseInt(fourthNumber, 10);
  let isoPlusNumbers = "";
  let numberPart = "";
  let codestringToReturn = "";
  if (posOfFNC === -1) {
    isoPlusNumbers = codestring.slice(offSet, codestring.length);
  } else {
    isoPlusNumbers = codestring.slice(offSet, posOfFNC);
    codestringToReturn = codestring.slice(posOfFNC + 1, codestring.length);
  }
  // cut off ISO-Code
  numberPart = isoPlusNumbers.slice(3, isoPlusNumbers.length);
  elementToReturn.data = parseFloatingPoint(numberPart, numberOfDecimals);
  elementToReturn.dataString = numberPart;
  elementToReturn.unit = isoPlusNumbers.slice(0, 3);

  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * parses data elements of variable length, which additionally have
 *
 * - an explicit unit of measurement or reference
 *
 * These data element contain countries, authorities within countries.
 * @param {String} ai_stem      the first digits of the AI, _not_ the fourth digit
 * @param {String} title        the title of the AI
 * @param {String} codestring   the codestring to parse from
 * @param {String} fncChar      the FNC-character to remove
 */
export function parseVariableLengthWithISOChars(
  ai_stem: string,
  title: string,
  codestring: string,
  fncChar: string
): ParseResult<string> {
  // an element of variable length, representing a sequence of chars, followed by
  // some ISO-code.
  const elementToReturn = new ParsedElementClass<string>(ai_stem, title, "S");
  const offSet = ai_stem.length;
  const posOfFNC = codestring.indexOf(fncChar);
  let isoPlusNumbers = "";

  let codestringToReturn = "";
  if (posOfFNC === -1) {
    isoPlusNumbers = codestring.slice(offSet, codestring.length);
  } else {
    isoPlusNumbers = codestring.slice(offSet, posOfFNC);
    codestringToReturn = codestring.slice(posOfFNC + 1, codestring.length);
  }
  // cut off ISO-Code
  elementToReturn.data = isoPlusNumbers.slice(3, isoPlusNumbers.length);
  elementToReturn.unit = isoPlusNumbers.slice(0, 3);
  elementToReturn.dataString = isoPlusNumbers;

  return { element: elementToReturn, codestring: codestringToReturn };
}
