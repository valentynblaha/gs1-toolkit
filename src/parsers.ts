import type { ParseResult } from "./types";
import {
  BarcodeError,
  BarcodeErrorCodes,
  checkValidDate,
  ElementType,
  InternalError,
  InvalidAiError,
  NUMERIC_REGEX,
  ParsedElementClass
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
  negative: boolean = false
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
 * dates in GS1-elements have the format "YYMMDD".
 * This function generates a new ParsedElement and tries to fill a
 * JS-date into the "data"-part.
 * @param {String} ai    the AI to use for the ParsedElement
 * @param {String} title the title to use for the ParsedElement
 * @param {String} codeString the codeString to parse the date from
 * @param {Boolean} utc  whether to parse the date as UTC or local time
 */
export function parseDate(ai: string, title: string, codeString: string, utc: boolean, fncChar: string): ParseResult<Date> {
  let elementToReturn = new ParsedElementClass<Date>(ai, title, ElementType.Date);
  const offSet = ai.length;
  let dataString: string = '';
  try {
    const dateYYMMDD = codeString.slice(offSet, offSet + 6);
    const posOfFNC = fncChar ? codeString.indexOf(fncChar, offSet) : offSet + 6;
    if (posOfFNC == -1) {
      dataString = codeString.slice(offSet);
    } else {
      dataString = codeString.slice(offSet, posOfFNC);
    }

    if (utc) {
      elementToReturn.data.setUTCHours(0, 0, 0, 0);
    } else {
      elementToReturn.data.setHours(0, 0, 0, 0);
    }

    if (dateYYMMDD.length !== 6) {
      throw new BarcodeError(
        BarcodeErrorCodes.FixedLengthDataTooShort,
        "37",
        `Data length ${dateYYMMDD.length} is less than expected length 6 for AI "${ai}".`
      );
    }

    if (!NUMERIC_REGEX.test(dateYYMMDD)) {
      throw new BarcodeError(
        BarcodeErrorCodes.NumericDataExpected,
        "39",
        `Numeric data expected for AI "${ai}", but got "${dateYYMMDD}".`
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
        `Invalid date "${dateYYMMDD}" for AI "${ai}".`
      );
    }

    if (dayAsNumber === 0) {
      monthAsNumber++;
    }

    if (utc) {
      elementToReturn.data.setUTCFullYear(yearAsNumber, monthAsNumber, dayAsNumber);
    } else {
      elementToReturn.data.setFullYear(yearAsNumber, monthAsNumber, dayAsNumber);
    }
  } catch (error) {
    elementToReturn = new ParsedElementClass<Date>(ai, title, ElementType.Error, error as Error);
  }

  elementToReturn.dataString = dataString;
  return { element: elementToReturn, codestring: codeString.slice(offSet + dataString.length) };
}

/**
 * dates in GS1-elements have the format "YYMMDDHHmm".
 * This function generates a new ParsedElement and tries to fill a
 * JS-date into the "data"-part.
 * @param {String} ai    the AI to use for the ParsedElement
 * @param {String} title the title to use for the ParsedElement
 * @param {String} codeString the codestring to parse the date from
 * @param {Boolean} utc  whether to parse the date as UTC or local time
 */
export function parseDatetime(ai: string, title: string, codeString: string, utc: boolean, fncChar: string): ParseResult<Date> {
  let elementToReturn = new ParsedElementClass<Date>(ai, title, ElementType.Date);
  const offSet = ai.length;
  const posOfFNC = codeString.indexOf(fncChar);
  let dateYYMMDD = "";
  if (posOfFNC === -1) {
    dateYYMMDD = codeString.slice(offSet, codeString.length);
  } else {
    dateYYMMDD = codeString.slice(offSet, posOfFNC);
  }
  try {
    if (dateYYMMDD.length !== 10) {
      throw new BarcodeError(
        BarcodeErrorCodes.FixedLengthDataTooShort,
        "37",
        `Data length ${dateYYMMDD.length} is not of expected length 10 for AI "${ai}".`
      );
    }

    if (!NUMERIC_REGEX.test(dateYYMMDD)) {
      throw new BarcodeError(
        BarcodeErrorCodes.NumericDataExpected,
        "39",
        `Numeric data expected for AI "${ai}", but got "${dateYYMMDD}".`
      );
    }

    let yearAsNumber = 0;
    let monthAsNumber = 0;
    let dayAsNumber = 0;
    let hourAsNumber = 0;
    let minuteAsNumber = 0;

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

    try {
      hourAsNumber = Number.parseInt(dateYYMMDD.slice(6, 8), 10);
    } catch (error_) {
      throw new InternalError("35", error_ as Error);
    }

    try {
      minuteAsNumber = Number.parseInt(dateYYMMDD.slice(8, 10), 10);
    } catch (error_) {
      throw new InternalError("35", error_ as Error);
    }

    if (utc) {
      elementToReturn.data.setUTCHours(hourAsNumber, minuteAsNumber, 0, 0);
    } else {
      elementToReturn.data.setHours(hourAsNumber, minuteAsNumber, 0, 0);
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
        `Invalid date "${dateYYMMDD}" for AI "${ai}".`
      );
    }

    if (dayAsNumber === 0) {
      monthAsNumber++;
    }

    elementToReturn.data.setFullYear(yearAsNumber, monthAsNumber, dayAsNumber);
  } catch (error) {
    elementToReturn = new ParsedElementClass<Date>(ai, title, ElementType.Error, error as Error);
  }
  elementToReturn.dataString = dateYYMMDD;
  return { element: elementToReturn, codestring: codeString.slice(offSet + 10, codeString.length) };
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
  let elementToReturn: ParsedElementClass<string> = new ParsedElementClass<string>(ai, title, ElementType.String);
  const offSet = ai.length;
  const dataString = codestring.slice(offSet, length + offSet);
  try {
    if (dataString.length < length) {
      throw new BarcodeError(
        BarcodeErrorCodes.FixedLengthDataTooShort,
        "37",
        `Data length ${dataString.length} is less than expected length ${length} for AI "${ai}".`
      );
    }

    if (numeric && !NUMERIC_REGEX.test(dataString)) {
      throw new BarcodeError(
        BarcodeErrorCodes.NumericDataExpected,
        "39",
        `Numeric data expected for AI "${ai}", but got "${dataString}".`
      );
    }
    elementToReturn.data = dataString;
  } catch (error) {
    elementToReturn = new ParsedElementClass<string>(ai, title, ElementType.Error, error as Error);
  }
  elementToReturn.dataString = dataString;
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
  let elementToReturn: ParsedElementClass<string> = new ParsedElementClass<string>(ai, title, ElementType.String);
  const offSet = ai.length;
  const posOfFNC = codestring.indexOf(fncChar);
  let codestringToReturn = "";
  let dataString = "";
  try {
    if (posOfFNC === -1) {
      //we've got the last element of the barcode
      if (maxLength && maxLength > 0) {
        //lot
        dataString = codestring.slice(offSet, maxLength + offSet);
        codestringToReturn = codestring.replace(ai + dataString, "");
      } else {
        dataString = codestring.slice(offSet, codestring.length);
      }
    } else {
      dataString = codestring.slice(offSet, posOfFNC);
      codestringToReturn = codestring.slice(posOfFNC + 1, codestring.length);
    }
    if (dataString === "") {
      throw new BarcodeError(
        BarcodeErrorCodes.EmptyVariableLengthData,
        "38",
        `Variable length data for AI "${ai}" is empty.`
      );
    }

    if (numeric && !NUMERIC_REGEX.test(dataString)) {
      throw new BarcodeError(
        BarcodeErrorCodes.NumericDataExpected,
        "39",
        `Numeric data expected for AI "${ai}", but got "${dataString}".`
      );
    }
    elementToReturn.data = dataString;
  } catch (error) {
    elementToReturn = new ParsedElementClass<string>(ai, title, ElementType.Error, error as Error);
  }
  elementToReturn.dataString = dataString;

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
  const ai = ai_stem + fourthNumber;
  let elementToReturn = new ParsedElementClass<number>(ai, title, ElementType.Number);
  let codestringToReturn = "";
  let dataString = "";
  try {
    const offSet = ai_stem.length + 1;
    const posOfFNC = codestring.indexOf(fncChar);
    const numberOfDecimals = Number.parseInt(fourthNumber, 10);

    if (posOfFNC === -1) {
      dataString = codestring.slice(offSet, codestring.length);
    } else {
      dataString = codestring.slice(offSet, posOfFNC);
      codestringToReturn = codestring.slice(posOfFNC + 1, codestring.length);
    }
    // adjust decimals according to fourthNumber:

    elementToReturn.data = parseFloatingPoint(dataString, numberOfDecimals);
  } catch (error) {
    elementToReturn = new ParsedElementClass<number>(ai, title, ElementType.Error, error as Error);
  }
  elementToReturn.dataString = dataString;
  elementToReturn.unit = unit;

  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * The place of the decimal fraction is given by the fourth number, that's
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
  const ai = ai_stem + fourthNumber;
  let elementToReturn = new ParsedElementClass<number>(ai, title, ElementType.Number);
  let codestringToReturn = '';
  let dataString = '';

  try {
    const offset = ai_stem.length + 1;

    if (!NUMERIC_REGEX.test(fourthNumber)) {
      throw new InvalidAiError(ai_stem, fourthNumber);
    }

    const numberOfDecimals = Number.parseInt(fourthNumber, 10);
    dataString = codestring.slice(offset, offset + 6);

    if (!NUMERIC_REGEX.test(dataString)) {
      throw new BarcodeError(
        BarcodeErrorCodes.NumericDataExpected,
        "39",
        `Numeric data expected for AI "${ai}", but got "${dataString}".`
      );
    }

    elementToReturn.data = parseFloatingPoint(dataString, numberOfDecimals);
    codestringToReturn = codestring.slice(offset + 6, codestring.length);
  } catch (error) {
    elementToReturn = new ParsedElementClass<number>(ai, title, ElementType.Error, error as Error);
  }
  elementToReturn.dataString = dataString;
  elementToReturn.unit = unit;

  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * The place of the decimal fraction is given by the AI definition
 *
 * All of theses elements have a length of 6 characters.
 * @param {String} ai      the first digits of the AI, _not_ the fourth digit
 * @param {Number} decimals the 4th number indicating the count of valid fractionals
 * @param {String} title        the title of the AI
 * @param {String} unit         often these elements have an implicit unit of measurement
 * @param {String} codestring  the codestring to parse from
 * @param {String} fncChar  the separator
 */
export function parseTemperature(
  ai: string,
  decimals: number,
  title: string,
  unit: string,
  codestring: string,
  fncChar: string
): ParseResult<number> {
  let elementToReturn = new ParsedElementClass<number>(ai, title, ElementType.Number);
  const offset = ai.length;
  let codestringToReturn = "";
  let dataString = "";
  try {
    if (codestring.length < offset + 6) {
      throw new BarcodeError(
        BarcodeErrorCodes.FixedLengthDataTooShort,
        "40",
        `Data length ${codestring.length - offset} is less than expected length 6 for AI "${ai}".`
      );
    }

    let nextAi = codestring.indexOf(fncChar);
    if (nextAi === -1) {
      nextAi = offset + 7;
    } else if (nextAi < offset + 6) {
      // TODO: improve error
      throw new BarcodeError(
        BarcodeErrorCodes.FixedLengthDataTooShort,
        "40",
        `Data length ${nextAi - ai.length} is less than expected length 6 for AI "${ai}".`
      );
    }
    dataString = codestring.slice(offset, offset + 6);

    if (!NUMERIC_REGEX.test(dataString)) {
      throw new BarcodeError(
        BarcodeErrorCodes.NumericDataExpected,
        "39",
        `Numeric data expected for AI "${ai}", but got "${dataString}".`
      );
    }
    const idNegative = ["-", "\u2013", "—"].includes(codestring.slice(offset + 6, offset + 7));

    elementToReturn.data = parseFloatingPoint(dataString, decimals, idNegative);
    codestringToReturn = codestring.slice(nextAi, codestring.length);
  } catch (error) {
    elementToReturn = new ParsedElementClass<number>(ai, title, ElementType.Error, error as Error);
  }
  elementToReturn.dataString = dataString;
  elementToReturn.unit = unit;
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
  const ai = ai_stem + fourthNumber;
  let elementToReturn = new ParsedElementClass<number>(ai, title, ElementType.Number);
  let codestringToReturn = "";
  let dataString = "";
  try {
    const offSet = ai_stem.length + 1;
    const posOfFNC = codestring.indexOf(fncChar);
    const numberOfDecimals = Number.parseInt(fourthNumber, 10);
    let isoPlusNumbers = "";
    if (posOfFNC === -1) {
      isoPlusNumbers = codestring.slice(offSet, codestring.length);
    } else {
      isoPlusNumbers = codestring.slice(offSet, posOfFNC);
      codestringToReturn = codestring.slice(posOfFNC + 1, codestring.length);
    }
    // cut off ISO-Code
    dataString = isoPlusNumbers.slice(3, isoPlusNumbers.length);
    elementToReturn.data = parseFloatingPoint(dataString, numberOfDecimals);
    elementToReturn.unit = isoPlusNumbers.slice(0, 3);
  } catch (error) {
    elementToReturn = new ParsedElementClass<number>(ai, title, ElementType.Error, error as Error);
  }
  elementToReturn.dataString = dataString;
  return { element: elementToReturn, codestring: codestringToReturn };
}

/**
 * parses data elements of variable length, which additionally have
 *
 * - an explicit unit of measurement or reference
 *
 * These data element contain countries, authorities within countries.
 * @param {String} ai      the first digits of the AI, _not_ the fourth digit
 * @param {String} title        the title of the AI
 * @param {String} codestring   the codestring to parse from
 * @param {String} fncChar      the FNC-character to remove
 */
export function parseVariableLengthWithISOChars(
  ai: string,
  title: string,
  codestring: string,
  fncChar: string
): ParseResult<string> {
  // an element of variable length, representing a sequence of chars, followed by
  // some ISO-code.
  let elementToReturn = new ParsedElementClass<string>(ai, title, ElementType.String);
  let codestringToReturn = "";
  let dataString = "";
  try {
    const offSet = ai.length;
    const posOfFNC = codestring.indexOf(fncChar);

    if (posOfFNC === -1) {
      dataString = codestring.slice(offSet, codestring.length);
    } else {
      dataString = codestring.slice(offSet, posOfFNC);
      codestringToReturn = codestring.slice(posOfFNC + 1, codestring.length);
    }
    // cut off ISO-Code
    elementToReturn.data = dataString.slice(3, dataString.length);
    elementToReturn.unit = dataString.slice(0, 3);
  } catch (error) {
    elementToReturn = new ParsedElementClass<string>(ai, title, ElementType.Error, error as Error);
  }
  elementToReturn.dataString = dataString;
  return { element: elementToReturn, codestring: codestringToReturn };
}
