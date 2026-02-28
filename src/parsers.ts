import type { ParseResult, ParserParams } from "./types";
import {
  BarcodeError,
  BarcodeErrorCodes,
  checkValidDate,
  ElementType,
  GROUP_SEPARATOR,
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
export function parseFloatingPoint(
  stringToParse: string,
  numberOfFractionals: number,
  negative: boolean = false,
): number {
  const offset = stringToParse.length - numberOfFractionals;
  const auxString =
    (negative ? "-" : "") + stringToParse.slice(0, offset) + "." + stringToParse.slice(offset);
  try {
    return Number.parseFloat(auxString);
  } catch (error_) {
    throw new InternalError("36", error_ as Error);
  }
}

/**
 * Dates in GS1-elements have the format "YYMMDD".
 * This function generates a new ParsedElement and tries to fill a
 * JS-date into the "data"-part.
 * @param codestring The codestring to parse the date from
 * @param ai The AI to use for the ParsedElement
 * @param definition AI definition
 * @param options Parser options
 */
export function parseDate(params: ParserParams): ParseResult<Date> {
  const { codestring, ai, definition, options } = params;
  const elementToReturn = new ParsedElementClass<Date>(ai, definition.title, ElementType.D);
  const offSet = ai.length;
  const dateYYMMDD = codestring.slice(offSet, offSet + 6);

  if (options.utcTimestamps) {
    elementToReturn.data.setUTCHours(0, 0, 0, 0);
  } else {
    elementToReturn.data.setHours(0, 0, 0, 0);
  }

  if (dateYYMMDD.length !== 6) {
    throw new BarcodeError(
      BarcodeErrorCodes.FixedLengthDataTooShort,
      "37",
      `Data length ${dateYYMMDD.length} is less than expected length 6 for AI "${ai}".`,
    );
  }

  if (!NUMERIC_REGEX.test(dateYYMMDD)) {
    throw new BarcodeError(
      BarcodeErrorCodes.NumericDataExpected,
      "39",
      `Numeric data expected for AI "${ai}", but got "${dateYYMMDD}".`,
    );
  }

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
  const currentCentury = Math.floor(new Date().getFullYear() / 100);
  const currentYear = new Date().getFullYear() % 100;
  const diff = yearAsNumber - currentYear;
  if (diff >= 51 && diff <= 99) {
    yearAsNumber = (currentCentury - 1) * 100 + yearAsNumber;
  } else if (diff >= -99 && diff <= -50) {
    yearAsNumber = (currentCentury + 1) * 100 + yearAsNumber;
  } else {
    yearAsNumber = currentCentury * 100 + yearAsNumber;
  }

  if (!checkValidDate(yearAsNumber, monthAsNumber, dayAsNumber)) {
    throw new BarcodeError(
      BarcodeErrorCodes.InvalidDate,
      "36",
      `Invalid date "${dateYYMMDD}" for AI "${ai}".`,
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
 * Simple: the element has a fixed length AND is not followed by an FNC1.
 */
export function parseFixedLength(params: ParserParams): ParseResult<string> {
  const { codestring, ai, definition } = params;
  const elementToReturn = new ParsedElementClass<string>(ai, definition.title, ElementType.S);
  const offSet = ai.length;
  const length = definition.fixedLength ?? 0;
  const data = codestring.slice(offSet, length + offSet);

  if (data.length < length) {
    throw new BarcodeError(
      BarcodeErrorCodes.FixedLengthDataTooShort,
      "37",
      `Data length ${data.length} is less than expected length ${length} for AI "${ai}".`,
    );
  }

  // TODO: handle numeric case

  elementToReturn.data = data;
  elementToReturn.dataString = data;
  const codestringToReturn = codestring.slice(length + offSet, codestring.length);
  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * tries to parse an element of variable length
 * some fixed length AIs are terminated by FNC1, so this function
 * is used even for fixed length items
 */
export function parseVariableLength(params: ParserParams): ParseResult<string> {
  const { codestring, ai, definition, options } = params;
  const elementToReturn = new ParsedElementClass<string>(ai, definition.title, ElementType.S);
  const offSet = ai.length;
  const posOfFNC = codestring.indexOf(options.fncChar ?? GROUP_SEPARATOR);
  let codestringToReturn = "";

  if (posOfFNC === -1) {
    elementToReturn.data = codestring.slice(offSet, codestring.length);
  } else {
    elementToReturn.data = codestring.slice(offSet, posOfFNC);
    codestringToReturn = codestring.slice(posOfFNC + 1, codestring.length);
  }

  if (elementToReturn.data === "") {
    throw new BarcodeError(
      BarcodeErrorCodes.EmptyVariableLengthData,
      "38",
      `Variable length data for AI "${ai}" is empty.`,
    );
  }

  // TODO: handle numeric case
  //   if (numeric && !NUMERIC_REGEX.test(elementToReturn.data)) {
  //     throw new BarcodeError(
  //       BarcodeErrorCodes.NumericDataExpected,
  //       "39",
  //       `Numeric data expected for AI "${ai}", but got "${elementToReturn.data}".`,
  //     );
  //   }

  elementToReturn.dataString = elementToReturn.data;

  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * Parses data elements of variable length, which additionally have
 *
 * - an indicator for the number of valid decimals
 * - an implicit unit of measurement
 *
 * These data elements contain e.g. a weight or length.
 */
export function parseVariableLengthMeasure(params: ParserParams): ParseResult<number> {
  const { codestring, ai, definition, options } = params;
  // the place of the decimal fraction is given by the fourth number, that's
  // the first after the identifier itself.
  const numberOfDecimals = Number.parseInt(codestring.substring(0, 1));
  if (Number.isNaN(numberOfDecimals) || !(definition.dpp ?? []).includes(numberOfDecimals)) {
    throw new InvalidAiError(ai, codestring.substring(0, 1));
  }
  const elementToReturn = new ParsedElementClass<number>(
    ai + numberOfDecimals,
    definition.title,
    ElementType.N,
  );
  const offSet = ai.length + 1;
  const posOfFNC = codestring.indexOf(options.fncChar ?? GROUP_SEPARATOR);
  let numberPart = "";

  let codestringToReturn = "";
  if (posOfFNC === -1) {
    numberPart = codestring.slice(offSet, codestring.length);
  } else {
    numberPart = codestring.slice(offSet, posOfFNC);
    codestringToReturn = codestring.slice(posOfFNC + 1, codestring.length);
  }
  // adjust decimals according to fourthNumber:
  // TODO: handle unit

  elementToReturn.data = parseFloatingPoint(numberPart, numberOfDecimals);
  elementToReturn.dataString = numberPart;
  elementToReturn.unit = "";
  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * The place of the decimal fraction is given by the fourth number, that's
 * the first after the identifier itself.
 *
 * All of theses elements have a length of 6 characters.
 */
export function parseFixedLengthMeasure(params: ParserParams): ParseResult<number> {
  const { codestring, ai, definition } = params;
  const ai_stem = ai.substring(0, ai.length - 1);
  const fourthNumber = ai.substring(ai.length - 1, ai.length);
  const elementToReturn = new ParsedElementClass<number>(
    ai_stem + fourthNumber,
    definition.title,
    ElementType.N,
  );
  const offset = ai_stem.length + 1;

  if (!NUMERIC_REGEX.test(fourthNumber)) {
    throw new InvalidAiError(ai_stem, fourthNumber);
  }

  const numberOfDecimals = Number.parseInt(fourthNumber, 10);
  const numberPart = codestring.slice(offset, offset + 6);

  if (!NUMERIC_REGEX.test(numberPart)) {
    throw new BarcodeError(
      BarcodeErrorCodes.NumericDataExpected,
      "39",
      `Numeric data expected for AI "${ai_stem + fourthNumber}", but got "${numberPart}".`,
    );
  }

  elementToReturn.data = parseFloatingPoint(numberPart, numberOfDecimals);
  elementToReturn.dataString = numberPart;
  //elementToReturn.unit = unit;
  const codestringToReturn = codestring.slice(offset + 6, codestring.length);

  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * The place of the decimal fraction is given by the AI definition
 *
 * All of theses elements have a length of 6 characters.
 */
export function parseTemperature(params: ParserParams): ParseResult<number> {
  const { codestring, ai, definition, options } = params;
  const elementToReturn = new ParsedElementClass<number>(ai, definition.title, ElementType.N);
  const offset = ai.length;

  if (codestring.length < offset + 6) {
    throw new BarcodeError(
      BarcodeErrorCodes.FixedLengthDataTooShort,
      "40",
      `Data length ${codestring.length - offset} is less than expected length 6 for AI "${ai}".`,
    );
  }

  let nextAi = codestring.indexOf(options.fncChar ?? GROUP_SEPARATOR);
  if (nextAi === -1) {
    nextAi = offset + 7;
  } else if (nextAi < offset + 6) {
    // TODO: improve error
    throw new BarcodeError(
      BarcodeErrorCodes.FixedLengthDataTooShort,
      "40",
      `Data length ${nextAi - ai.length} is less than expected length 6 for AI "${ai}".`,
    );
  }
  const numberPart = codestring.slice(offset, offset + 6);

  if (!NUMERIC_REGEX.test(numberPart)) {
    throw new BarcodeError(
      BarcodeErrorCodes.NumericDataExpected,
      "39",
      `Numeric data expected for AI "${ai}", but got "${numberPart}".`,
    );
  }
  const isNegative = ["-", "\u2013", "—"].includes(codestring.slice(offset + 6, offset + 7));

  elementToReturn.data = parseFloatingPoint(numberPart, 2, isNegative);
  elementToReturn.dataString = numberPart;
  //elementToReturn.unit = unit;
  const codestringToReturn = codestring.slice(nextAi, codestring.length);

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
export function parseVariableLengthWithISONumbers(params: ParserParams): ParseResult<number> {
  // an element of variable length, representing a number, followed by
  // some ISO-code.
  const { codestring, ai, definition, options } = params;
  const numberOfDecimals = Number.parseInt(codestring.substring(0, 1));
  if (Number.isNaN(numberOfDecimals) || !(definition.dpp ?? []).includes(numberOfDecimals)) {
    throw new InvalidAiError(ai, codestring.substring(0, 1));
  }

  const elementToReturn = new ParsedElementClass<number>(
    ai + numberOfDecimals,
    definition.title,
    ElementType.N,
  );
  const offSet = ai.length + 1;
  const posOfFNC = codestring.indexOf(options.fncChar ?? GROUP_SEPARATOR);
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
export function parseVariableLengthWithISOChars(params: ParserParams): ParseResult<string> {
  // an element of variable length, representing a sequence of chars, followed by
  // some ISO-code.
  const { codestring, ai, definition, options } = params;
  const numberOfDecimals = Number.parseInt(codestring.substring(0, 1));
  if (Number.isNaN(numberOfDecimals) || !(definition.serial ?? []).includes(numberOfDecimals)) {
    throw new InvalidAiError(ai, codestring.substring(0, 1));
  }

  const elementToReturn = new ParsedElementClass<string>(
    ai + numberOfDecimals,
    definition.title,
    ElementType.S,
  );
  const offSet = ai.length + 1;
  const posOfFNC = codestring.indexOf(options.fncChar ?? GROUP_SEPARATOR);
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
