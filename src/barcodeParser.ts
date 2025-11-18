/**
 * Based on the repository of
 * P. Brockfeld, 2014-02-05
 *
 * https://github.com/PeterBrockfeld/BarcodeParser
 */

import {
  parseDate,
  parseFixedLength,
  parseFixedLengthMeasure,
  parseVariableLength,
  parseVariableLengthMeasure,
  parseVariableLengthWithISOChars,
  parseVariableLengthWithISONumbers,
} from "./parsers";
import type { BarcodeAnswer, ParseResult } from "./types";
import {
  BarcodeError,
  BarcodeErrorCodes,
  cleanCodestring,
  GROUP_SEPARATOR,
  InternalError,
  InvalidAiError,
} from "./utils";

/**
 * Does the main work:
 *   What AI is in the beginning of the restOfBarcode?
 *     If identified:
 *       which function to call with
 *       which parameters to parse the element?
 * @param   {String} codestring a string; the function tries to
 *                   identify an AI in the beginning of this string
 * @param   {Number} lotLen optional lot length parameter
 * @param   {String} fncChar optional function character parameter
 * @returns {ParseResult} if it succeeds in identifying an AI the
 *                   ParsedElement is returned, together with the
 *                   still unparsed rest of codestring.
 */
function identifyAI(codestring: string, lotLen?: number, fncChar?: string): ParseResult {
  if (!fncChar) {
    fncChar = GROUP_SEPARATOR;
  }

  // find first identifier. AIs have a minimum length of 2
  // digits, some have 3, some even 4.
  const firstNumber = codestring.slice(0, 1);
  const secondNumber = codestring.slice(1, 2);
  let thirdNumber = "";
  let fourthNumber = "";

  /**
   *
   * ======= BEGIN of the big switch =======================
   *
   * and now a very big "switch", which tries to find a valid
   * AI within the first digits of the codestring.
   *
   * See the documentation for an explanation why it is made
   * this way (and not by some configuration file).
   */

  switch (firstNumber) {
    case "0":
      switch (secondNumber) {
        case "0":
          // SSCC (Serial Shipping Container Code)
          return parseFixedLength("00", "SSCC", 18, codestring, true);
        case "1":
          // Global Trade Item Number (GTIN)
          return parseFixedLength("01", "GTIN", 14, codestring, true);
        case "2":
          // GTIN of Contained Trade Items
          return parseFixedLength("02", "CONTENT", 14, codestring);
        case "3":
          // GTIN of Made-to-Order Trade Items
          return parseFixedLength("03", "MTO GTIN", 14, codestring);
        default:
          throw new InvalidAiError("0", secondNumber);
      }
    case "1":
      switch (secondNumber) {
        case "0":
          // Batch or Lot Number
          return parseVariableLength("10", "BATCH/LOT", codestring, fncChar, lotLen ?? 20);
        case "1":
          // Production Date (YYMMDD)
          return parseDate("11", "PROD DATE", codestring);
        case "2":
          // Due Date (YYMMDD)
          return parseDate("12", "DUE DATE", codestring);
        case "3":
          // Packaging Date (YYMMDD)
          return parseDate("13", "PACK DATE", codestring);
        // AI "14" isn't defined
        case "5":
          // Best Before Date (YYMMDD)
          return parseDate("15", "BEST BEFORE or BEST BY", codestring);
        case "6":
          // Sell By Date (YYMMDD)
          return parseDate("16", "SELL BY", codestring);
        case "7":
          // Expiration Date (YYMMDD)
          return parseDate("17", "USE BY OR EXPIRY", codestring);
        default:
          throw new InvalidAiError("1", secondNumber);
      }
    case "2":
      switch (secondNumber) {
        case "0":
          // Variant Number
          return parseFixedLength("20", "VARIANT", 2, codestring);
        case "1":
          // Serial Number
          return parseVariableLength("21", "SERIAL", codestring, fncChar, lotLen ?? 20);
        case "2":
          // Product Variant
          return parseVariableLength("22", "CPV", codestring, fncChar, 20);

        case "3":
          thirdNumber = codestring.slice(2, 3);
          switch (thirdNumber) {
            case "5":
              // Third Party Controlled, Serialised Extension of Global Trade Item Number (GTIN)
              return parseVariableLength("235", "TPX", codestring, fncChar, 28);
            default:
              throw new InvalidAiError("23", thirdNumber);
          }
        case "4":
          // from now, the third number matters:
          thirdNumber = codestring.slice(2, 3);
          switch (thirdNumber) {
            case "0":
              // Additional Item Identification
              return parseVariableLength("240", "ADDITIONAL ID", codestring, fncChar, 30);
            case "1":
              // Customer Part Number
              return parseVariableLength("241", "CUST. PART NO.", codestring, fncChar, 30);
            case "2":
              // Made-to-Order Variation Number
              return parseVariableLength("242", "MTO VARIANT", codestring, fncChar, 6);
            case "3":
              // Packaging Component Number
              return parseVariableLength("243", "PCN", codestring, fncChar, 20);
            default:
              throw new InvalidAiError("24", thirdNumber);
          }
        case "5":
          // from now, the third number matters:
          thirdNumber = codestring.slice(2, 3);
          switch (thirdNumber) {
            case "0":
              // Secondary Serial Number
              return parseVariableLength("250", "SECONDARY SERIAL", codestring, fncChar, 30);
            case "1":
              // Reference to Source Entity
              return parseVariableLength("251", "REF. TO SOURCE", codestring, fncChar, 30);
            // AI "252" isn't defined
            case "3":
              // Global Document Type Identifier (GDTI)
              return parseVariableLength("253", "GDTI", codestring, fncChar, 42);
            case "4":
              // GLN Extension Component
              return parseVariableLength("254", "GLN EXTENSION COMPONENT", codestring, fncChar, 20);
            case "5":
              // Global Coupon Number (GCN)
              return parseVariableLength("255", "GCN", codestring, fncChar, 37);
            default:
              throw new InvalidAiError("25", thirdNumber);
          }
        // AI "26" to "29" aren't defined
        default:
          throw new InvalidAiError("2", secondNumber);
      }
    case "3":
      switch (secondNumber) {
        case "0":
          // Count of Items (Variable Measure Trade Item)
          return parseVariableLength("30", "VAR. COUNT", codestring, fncChar, 8);
        case "1":
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3);
          fourthNumber = codestring.slice(3, 4);

          switch (thirdNumber) {
            case "0":
              // Net weight, kilograms (Variable Measure Trade Item)
              return parseFixedLengthMeasure("310", fourthNumber, "NET WEIGHT (kg)", "KGM", codestring);
            case "1":
              // Length or first dimension, metres (Variable Measure Trade Item)
              return parseFixedLengthMeasure("311", fourthNumber, "LENGTH (m)", "MTR", codestring);
            case "2":
              // Width, diameter, or second dimension, metres (Variable Measure Trade Item)
              return parseFixedLengthMeasure("312", fourthNumber, "WIDTH (m)", "MTR", codestring);
            case "3":
              // Depth, thickness, height, or third dimension, metres (Variable Measure Trade Item)
              return parseFixedLengthMeasure("313", fourthNumber, "HEIGHT (m)", "MTR", codestring);
            case "4":
              // Area, square metres (Variable Measure Trade Item)
              return parseFixedLengthMeasure("314", fourthNumber, "AREA (m2)", "MTK", codestring);
            case "5":
              // Net volume, litres (Variable Measure Trade Item)
              return parseFixedLengthMeasure("315", fourthNumber, "NET VOLUME (l)", "LTR", codestring);
            case "6":
              // Net volume, cubic metres (Variable Measure Trade Item)
              return parseFixedLengthMeasure("316", fourthNumber, "NET VOLUME (m3)", "MTQ", codestring);
            default:
              throw new InvalidAiError("31", thirdNumber);
          }
        case "2":
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3);
          fourthNumber = codestring.slice(3, 4);

          switch (thirdNumber) {
            case "0":
              // Net weight, pounds (Variable Measure Trade Item)
              return parseFixedLengthMeasure("320", fourthNumber, "NET WEIGHT (lb)", "LBR", codestring);
            case "1":
              // Length or first dimension, inches (Variable Measure Trade Item)
              return parseFixedLengthMeasure("321", fourthNumber, "LENGTH (i)", "INH", codestring);
            case "2":
              // Length or first dimension, feet (Variable Measure Trade Item)
              return parseFixedLengthMeasure("322", fourthNumber, "LENGTH (f)", "FOT", codestring);
            case "3":
              // Length or first dimension, yards (Variable Measure Trade Item)
              return parseFixedLengthMeasure("323", fourthNumber, "LENGTH (y)", "YRD", codestring);
            case "4":
              // Width, diameter, or second dimension, inches (Variable Measure Trade Item)
              return parseFixedLengthMeasure("324", fourthNumber, "WIDTH (i)", "INH", codestring);
            case "5":
              // Width, diameter, or second dimension, feet (Variable Measure Trade Item)
              return parseFixedLengthMeasure("325", fourthNumber, "WIDTH (f)", "FOT", codestring);
            case "6":
              // Width, diameter, or second dimension, yards (Variable Measure Trade Item
              return parseFixedLengthMeasure("326", fourthNumber, "WIDTH (y)", "YRD", codestring);
            case "7":
              // Depth, thickness, height, or third dimension, inches (Variable Measure Trade Item)
              return parseFixedLengthMeasure("327", fourthNumber, "HEIGHT (i)", "INH", codestring);
            case "8":
              // Depth, thickness, height, or third dimension, feet (Variable Measure Trade Item)
              return parseFixedLengthMeasure("328", fourthNumber, "HEIGHT (f)", "FOT", codestring);
            case "9":
              // Depth, thickness, height, or third dimension, yards (Variable Measure Trade Item)
              return parseFixedLengthMeasure("329", fourthNumber, "HEIGHT (y)", "YRD", codestring);
            default:
              throw new InvalidAiError("32", thirdNumber);
          }
        case "3":
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3);
          fourthNumber = codestring.slice(3, 4);

          switch (thirdNumber) {
            case "0":
              // Logistic weight, kilograms
              return parseFixedLengthMeasure("330", fourthNumber, "GROSS WEIGHT (kg)", "KGM", codestring);
            case "1":
              // Length or first dimension, metres
              return parseFixedLengthMeasure("331", fourthNumber, "LENGTH (m), log", "MTR", codestring);
            case "2":
              // Width, diameter, or second dimension, metres
              return parseFixedLengthMeasure("332", fourthNumber, "WIDTH (m), log", "MTR", codestring);
            case "3":
              // Depth, thickness, height, or third dimension, metres
              return parseFixedLengthMeasure("333", fourthNumber, "HEIGHT (m), log", "MTR", codestring);
            case "4":
              // Area, square metres
              return parseFixedLengthMeasure("334", fourthNumber, "AREA (m2), log", "MTK", codestring);
            case "5":
              // Logistic volume, litres
              return parseFixedLengthMeasure("335", fourthNumber, "VOLUME (l), log", "LTR", codestring);
            case "6":
              // Logistic volume, cubic metres
              return parseFixedLengthMeasure("336", fourthNumber, "VOLUME (m3), log", "MTQ", codestring);
            case "7":
              // Kilograms per square metre, yes, the ISO code for this _is_ "28".
              return parseFixedLengthMeasure("337", fourthNumber, "KG PER m²", "28", codestring);
            default:
              throw new InvalidAiError("33", thirdNumber);
          }
        case "4":
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3);
          fourthNumber = codestring.slice(3, 4);

          switch (thirdNumber) {
            case "0":
              // Logistic weight, pounds
              return parseFixedLengthMeasure("340", fourthNumber, "GROSS WEIGHT (lb)", "LBR", codestring);
            case "1":
              // Length or first dimension, inches
              return parseFixedLengthMeasure("341", fourthNumber, "LENGTH (i), log", "INH", codestring);
            case "2":
              // Length or first dimension, feet
              return parseFixedLengthMeasure("342", fourthNumber, "LENGTH (f), log", "FOT", codestring);
            case "3":
              // Length or first dimension, yards
              return parseFixedLengthMeasure("343", fourthNumber, "LENGTH (y), log", "YRD", codestring);
            case "4":
              // Width, diameter, or second dimension, inches
              return parseFixedLengthMeasure("344", fourthNumber, "WIDTH (i), log", "INH", codestring);
            case "5":
              // Width, diameter, or second dimension, feet
              return parseFixedLengthMeasure("345", fourthNumber, "WIDTH (f), log", "FOT", codestring);
            case "6":
              // Width, diameter, or second dimension, yard
              return parseFixedLengthMeasure("346", fourthNumber, "WIDTH (y), log", "YRD", codestring);
            case "7":
              // Depth, thickness, height, or third dimension, inches
              return parseFixedLengthMeasure("347", fourthNumber, "HEIGHT (i), log", "INH", codestring);
            case "8":
              // Depth, thickness, height, or third dimension, feet
              return parseFixedLengthMeasure("348", fourthNumber, "HEIGHT (f), log", "FOT", codestring);
            case "9":
              // Depth, thickness, height, or third dimension, yards
              return parseFixedLengthMeasure("349", fourthNumber, "HEIGHT (y), log", "YRD", codestring);
            default:
              throw new InvalidAiError("33", thirdNumber);
          }
        case "5":
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3);
          fourthNumber = codestring.slice(3, 4);

          switch (thirdNumber) {
            case "0":
              // Area, square inches (Variable Measure Trade Item)
              return parseFixedLengthMeasure("350", fourthNumber, "AREA (i2)", "INK", codestring);
            case "1":
              // Area, square feet (Variable Measure Trade Item)
              return parseFixedLengthMeasure("351", fourthNumber, "AREA (f2)", "FTK", codestring);
            case "2":
              // Area, square yards (Variable Measure Trade Item)
              return parseFixedLengthMeasure("352", fourthNumber, "AREA (y2)", "YDK", codestring);
            case "3":
              // Area, square inches
              return parseFixedLengthMeasure("353", fourthNumber, "AREA (i2), log", "INK", codestring);
            case "4":
              // Area, square feet
              return parseFixedLengthMeasure("354", fourthNumber, "AREA (f2), log", "FTK", codestring);
            case "5":
              // Area, square yards
              return parseFixedLengthMeasure("355", fourthNumber, "AREA (y2), log", "YDK", codestring);
            case "6":
              // Net weight, troy ounces (Variable Measure Trade Item)
              return parseFixedLengthMeasure("356", fourthNumber, "NET WEIGHT (t)", "APZ", codestring);
            case "7":
              // Net weight (or volume), ounces (Variable Measure Trade Item)
              return parseFixedLengthMeasure("357", fourthNumber, "NET VOLUME (oz)", "ONZ", codestring);
            default:
              throw new InvalidAiError("35", thirdNumber);
          }
        case "6":
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3);
          fourthNumber = codestring.slice(3, 4);

          switch (thirdNumber) {
            case "0":
              // Net volume, quarts (Variable Measure Trade Item)
              return parseFixedLengthMeasure("360", fourthNumber, "NET VOLUME (q)", "QT", codestring);
            case "1":
              // Net volume, gallons U.S. (Variable Measure Trade Item)
              return parseFixedLengthMeasure("361", fourthNumber, "NET VOLUME (g)", "GLL", codestring);
            case "2":
              // Logistic volume, quarts
              return parseFixedLengthMeasure("362", fourthNumber, "VOLUME (q), log", "QT", codestring);
            case "3":
              // Logistic volume, gallons U.S.
              return parseFixedLengthMeasure("363", fourthNumber, "VOLUME (g), log", "GLL", codestring);
            case "4":
              // Net volume, cubic inches (Variable Measure Trade Item)
              return parseFixedLengthMeasure("364", fourthNumber, "VOLUME (i3)", "INQ", codestring);
            case "5":
              // Net volume, cubic feet (Variable Measure Trade Item)
              return parseFixedLengthMeasure("365", fourthNumber, "VOLUME (f3)", "FTQ", codestring);
            case "6":
              // Net volume, cubic yards (Variable Measure Trade Item)
              return parseFixedLengthMeasure("366", fourthNumber, "VOLUME (y3)", "YDQ", codestring);
            case "7":
              // Logistic volume, cubic inches
              return parseFixedLengthMeasure("367", fourthNumber, "VOLUME (i3), log", "INQ", codestring);
            case "8":
              // Logistic volume, cubic feet
              return parseFixedLengthMeasure("368", fourthNumber, "VOLUME (f3), log", "FTQ", codestring);
            case "9":
              // Logistic volume, cubic yards
              return parseFixedLengthMeasure("369", fourthNumber, "VOLUME (y3), log", "YDQ", codestring);
            default:
              throw new InvalidAiError("36", thirdNumber);
          }
        case "7":
          // Count of Trade Items
          return parseVariableLength("37", "COUNT", codestring, fncChar, 8);
        // AI "38" isn't defined
        case "9":
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3);
          fourthNumber = codestring.slice(3, 4);

          switch (thirdNumber) {
            case "0":
              // Applicable Amount Payable, local currency
              return parseVariableLengthMeasure("390", fourthNumber, "AMOUNT", "", codestring, fncChar);
            case "1":
              // Applicable Amount Payable with ISO Currency Code
              return parseVariableLengthWithISONumbers("391", fourthNumber, "AMOUNT", codestring, fncChar);
            case "2":
              // Applicable Amount Payable, single monetary area (Variable Measure Trade Item)
              return parseVariableLengthMeasure("392", fourthNumber, "PRICE", "", codestring, fncChar);
            case "3":
              // Applicable Amount Payable with ISO Currency Code (Variable Measure Trade Item)
              return parseVariableLengthWithISONumbers("393", fourthNumber, "PRICE", codestring, fncChar);
            default:
              throw new InvalidAiError("39", thirdNumber);
          }
        default:
          throw new InvalidAiError("3", secondNumber);
      }
    case "4":
      switch (secondNumber) {
        case "0":
          // third number matters:
          thirdNumber = codestring.slice(2, 3);
          switch (thirdNumber) {
            case "0":
              // Customer's Purchase Order Number
              return parseVariableLength("400", "ORDER NUMBER", codestring, fncChar, 30);
            case "1":
              // Global Identification Number for Consignment (GINC)
              return parseVariableLength("401", "GINC", codestring, fncChar);
            case "2":
              // Global Shipment Identification Number (GSIN)
              return parseVariableLength("402", "GSIN", codestring, fncChar, 17); // should be 17 digits long
            case "3":
              // Routing Code
              return parseVariableLength("403", "ROUTE", codestring, fncChar, 30);
            default:
              throw new InvalidAiError("40", thirdNumber);
          }
        case "1":
          //third number matters:
          thirdNumber = codestring.slice(2, 3);
          switch (thirdNumber) {
            case "0":
              // Ship to - Deliver to Global Location Number
              return parseFixedLength("410", "SHIP TO LOC", 13, codestring);
            case "1":
              // Bill to - Invoice to Global Location Number
              return parseFixedLength("411", "BILL TO", 13, codestring);
            case "2":
              // Purchased from Global Location Number
              return parseFixedLength("412", "PURCHASE FROM", 13, codestring);
            case "3":
              // Ship for - Deliver for - Forward to Global Location Number
              return parseFixedLength("413", "SHIP FOR LOC", 13, codestring);
            case "4":
              // Identification of a physical location - Global Location Number (GLN)
              return parseFixedLength("414", "LOC NO", 13, codestring);
            case "5":
              // Global Location Number (GLN) of the invoicing party
              return parseFixedLength("415", "PAY TO", 13, codestring);
            case "6":
              // Global Location Number (GLN) of the production or service location
              return parseFixedLength("416", "PROD/SERV LOC", 13, codestring);
            case "7":
              // Party Global Location Number (GLN)
              return parseFixedLength("417", "PARTY", 13, codestring);
            default:
              throw new InvalidAiError("41", thirdNumber);
          }
        case "2":
          //third number matters:
          thirdNumber = codestring.slice(2, 3);
          switch (thirdNumber) {
            case "0":
              // Ship to - Deliver to Postal Code Within a Single Postal Authority
              return parseVariableLength("420", "SHIP TO POST", codestring, fncChar, 20);
            case "1":
              // Ship to - Deliver to Postal Code with ISO Country Code
              return parseVariableLengthWithISOChars("421", "SHIP TO POST", codestring, fncChar);
            case "2":
              // Country of Origin of a Trade Item
              return parseFixedLength("422", "ORIGIN", 3, codestring);
            case "3":
              // Country of Initial Processing
              // Up to 5 3-digit ISO-countrycodes
              return parseVariableLength("423", "COUNTRY - INITIAL PROCESS.", codestring, fncChar, 15);
            case "4":
              // Country of Processing
              return parseFixedLength("424", "COUNTRY - PROCESS.", 3, codestring);
            case "5":
              // Country of Disassembly
              return parseFixedLength("425", "COUNTRY - DISASSEMBLY", 3, codestring);
            case "6":
              // Country Covering full Process Chain
              return parseFixedLength("426", "COUNTRY - FULL PROCESS", 3, codestring);
            case "7":
              // Country Subdivision of Origin
              return parseVariableLength("427", "ORIGIN SUBDIVISION", codestring, fncChar, 3);
            default:
              throw new InvalidAiError("42", thirdNumber);
          }
        // TODO: implement AIs 430 to 439 (Transport Related AIs)
        default:
          throw new InvalidAiError("4", secondNumber);
      }
    // first digits 5 and 6 are not used
    case "7":
      switch (secondNumber) {
        case "0":
          //third and fourth number matter:
          thirdNumber = codestring.slice(2, 3);
          fourthNumber = codestring.slice(3, 4);

          switch (thirdNumber) {
            case "0":
              switch (fourthNumber) {
                case "1":
                  // NATO Stock Number (NSN)
                  return parseVariableLength("7001", "NSN", codestring, fncChar, 13); //should be 13 digits long
                case "2":
                  // UN/ECE Meat Carcasses and Cuts Classification
                  return parseVariableLength("7002", "MEAT CUT", codestring, fncChar);
                case "3":
                  // Expiration Date and Time
                  return parseVariableLength("7003", "EXPIRY TIME", codestring, fncChar, 10); //should be 10 digits long
                case "4":
                  // Active Potency
                  return parseVariableLength("7004", "ACTIVE POTENCY", codestring, fncChar, 6);
                default:
                  throw new InvalidAiError("70", thirdNumber);
              }
            // 1 and 2 are not used
            case "3":
              // Approval Number of Processor with ISO Country Code

              // Title and stem for parsing are build from 4th number:

              return parseVariableLengthWithISOChars(
                "703" + fourthNumber,
                "PROCESSOR # " + fourthNumber,
                codestring,
                fncChar
              );
            default:
              throw new InvalidAiError("70", thirdNumber);
          }
        case "1":
          thirdNumber = codestring.slice(2, 3);
          switch (thirdNumber) {
            case "0":
              // National Healthcare Reimbursement Number (NHRN) – Germany PZN
              return parseVariableLength("710", "NHRN PZN", codestring, fncChar);
            case "1":
              // National Healthcare Reimbursement Number (NHRN) – France CIP
              return parseVariableLength("711", "NHRN CIP", codestring, fncChar);
            case "2":
              // National Healthcare Reimbursement Number (NHRN) – Spain CN
              return parseVariableLength("712", "NHRN CN", codestring, fncChar);
            case "3":
              // National Healthcare Reimbursement Number (NHRN) – Brasil DRN
              return parseVariableLength("713", "NHRN DRN", codestring, fncChar);
            default:
              throw new InvalidAiError("71", thirdNumber);
          }
        default:
          throw new InvalidAiError("7", secondNumber);
      }
    case "8":
      switch (secondNumber) {
        case "0":
          thirdNumber = codestring.slice(2, 3);
          fourthNumber = codestring.slice(3, 4);

          switch (thirdNumber) {
            case "0":
              switch (fourthNumber) {
                case "1":
                  // Roll Products (Width, Length, Core Diameter, Direction, Splices)
                  return parseVariableLength("8001", "DIMENSIONS", codestring, fncChar, 14); // should be 14 digits long
                case "2":
                  // Cellular Mobile Telephone Identifier
                  return parseVariableLength("8002", "CMT No", codestring, fncChar);
                case "3":
                  // Global Returnable Asset Identifier (GRAI)
                  return parseVariableLength("8003", "GRAI", codestring, fncChar); // should contain at least 14 digits
                case "4":
                  // Global Individual Asset Identifier (GIAI)
                  return parseVariableLength("8004", "GIAI", codestring, fncChar);
                case "5":
                  // Price Per Unit of Measure
                  return parseVariableLength("8005", "PRICE PER UNIT", codestring, fncChar, 6); // should be 6 digits long
                case "6":
                  // Identification of the Components of a Trade Item
                  return parseVariableLength("8006", "GCTIN", codestring, fncChar, 18); // should be exactly 18 digits long
                case "7":
                  // International Bank Account Number (IBAN)
                  return parseVariableLength("8007", "IBAN", codestring, fncChar);
                case "8":
                  // Date and Time of Production
                  return parseVariableLength("8008", "PROD TIME", codestring, fncChar, 12); // should be exactly 12 digits long
                default:
                  throw new InvalidAiError("800", fourthNumber);
              }
            case "1":
              switch (fourthNumber) {
                case "0":
                  // Component / Part Identifier (CPID)
                  return parseVariableLength("8010", "CPID", codestring, fncChar);
                case "1":
                  // Component / Part Identifier Serial Number (CPID SERIAL)
                  return parseVariableLength("8011", "CPID SERIAL", codestring, fncChar);
                case "7":
                  // Global Service Relation Number to identify the relationship between an organisation offering services and the provider of services
                  return parseVariableLength("8017", "GSRN - PROVIDER", codestring, fncChar, 18); // should be 18 digits long
                case "8":
                  // Global Service Relation Number to identify the relationship between an organisation offering services and the recipient of services
                  return parseVariableLength("8018", "GSRN - RECIPIENT", codestring, fncChar, 18, true); // should be 18 digits long
                case "9":
                  // Service Relation Instance Number (SRIN)
                  return parseVariableLength("8019", "SRIN", codestring, fncChar, undefined, true);
                default:
                  throw new InvalidAiError("801", fourthNumber);
              }
            case "2":
              switch (fourthNumber) {
                case "0":
                  // Payment Slip Reference Number
                  return parseVariableLength("8020", "REF No", codestring, fncChar);
                default:
                  throw new InvalidAiError("802", fourthNumber);
              }
            default:
              throw new InvalidAiError("80", thirdNumber);
          }
        case "1":
          thirdNumber = codestring.slice(2, 3);
          fourthNumber = codestring.slice(3, 4);
          switch (thirdNumber) {
            case "0":
              switch (fourthNumber) {
                case "0":
                  // GS1-128 Coupon Extended Code
                  return parseVariableLength("8100", "-", codestring, fncChar, 6); //should be 6 digits long
                case "1":
                  // GS1-128 Coupon Extended Code
                  return parseVariableLength("8101", "-", codestring, fncChar, 10); //should be 10 digits long
                case "2":
                  // GS1-128 Coupon Extended Code
                  return parseVariableLength("8102", "-", codestring, fncChar, 2); //should be 2 digits long
                default:
                  throw new InvalidAiError("810", fourthNumber);
              }
            case "1":
              switch (fourthNumber) {
                case "0":
                  // Coupon Code Identification for Use in North America
                  return parseVariableLength("8110", "-", codestring, fncChar);
                default:
                  throw new InvalidAiError("811", fourthNumber);
              }
            default:
              throw new InvalidAiError("81", thirdNumber);
          }
        case "2":
          thirdNumber = codestring.slice(2, 3);
          switch (thirdNumber) {
            case "0":
              // Extended Packaging URL
              return parseVariableLength("8200", "PRODUCT URL", codestring, fncChar);
            default:
              throw new InvalidAiError("82", thirdNumber);
          }
        default:
          throw new InvalidAiError("8", secondNumber);
      }
    case "9":
      switch (secondNumber) {
        case "0":
          // Information Mutually Agreed Between Trading Partners
          return parseVariableLength("90", "INTERNAL", codestring, fncChar);
        case "1":
          // Company Internal Information
          return parseVariableLength("91", "INTERNAL", codestring, fncChar);
        case "2":
          // Company Internal Information
          return parseVariableLength("92", "INTERNAL", codestring, fncChar);
        case "3":
          // Company Internal Information
          return parseVariableLength("93", "INTERNAL", codestring, fncChar);
        case "4":
          // Company Internal Information
          return parseVariableLength("94", "INTERNAL", codestring, fncChar);
        case "5":
          // Company Internal Information
          return parseVariableLength("95", "INTERNAL", codestring, fncChar);
        case "6":
          // Company Internal Information
          return parseVariableLength("96", "INTERNAL", codestring, fncChar);
        case "7":
          // Company Internal Information
          return parseVariableLength("97", "INTERNAL", codestring, fncChar);
        case "8":
          // Company Internal Information
          return parseVariableLength("98", "INTERNAL", codestring, fncChar);
        case "9":
          // Company Internal Information
          return parseVariableLength("99", "INTERNAL", codestring, fncChar);
        default:
          throw new InvalidAiError("9", secondNumber);
      }
    default:
      throw new InvalidAiError("", firstNumber);
  }
  /**
   *
   * ======= END of the big switch =======================
   *
   * now identifyAI has just to return the new
   * ParsedElement (create by one of the parsing
   * functions) and the (cleaned) rest of codestring.
   */
}

/**
 * This is the main routine provided by the parseBarcode library. It takes a string,
 * splices it from left to right into its elements and tries to parse it as an
 * GS1 - element. If it succeeds, the result is returned as an object composed of
 * an identifier and an array.It accepts
 * @param   {String}   barcode is the contents of the barcode you'd like to get parsed
 * @param   {String}   fncChar is the FNC1 character used in the barcode
 * @param   {String}   lotLen optional lot length parameter
 * @returns {Array}    an array with elements which are objects of type "ParsedElement"
 */
function parseBarcode(barcode: string, fncChar: string, lotLen?: number): BarcodeAnswer {

  if (!barcode || typeof barcode !== "string") {
    throw new BarcodeError(
      BarcodeErrorCodes.EmptyBarcode,
      "31",
      "The barcode is empty or not a string."
    );
  }

  const barcodelength = barcode.length;
  const answer: BarcodeAnswer = { codeName: "", denormalized: "", parsedCodeItems: [] }; // the object to return
  let restOfBarcode = ""; // the rest of the barcode, when first
  // elements are spliced away
  const symbologyIdentifier = barcode.slice(0, 3);
  let currentElement: ParseResult;

  /**
   *
   * ==== First step: ====
   *
   * IF there is any symbology identifier
   *   chop it off;
   *   put as "codeName" into the answer;
   *   fill restOfBarcode with the rest
   *   after the symbology identifier;
   * ELSE
   *   leave "codeName" empty;
   *   put the whole barcode into restOfBarcode;
   */

  switch (symbologyIdentifier) {
    case "]C1":
      answer.codeName = "GS1-128";
      restOfBarcode = barcode.slice(3, barcodelength);
      break;
    case "]e0":
      answer.codeName = "GS1 DataBar";
      restOfBarcode = barcode.slice(3, barcodelength);
      break;
    case "]e1":
    case "]e2":
      answer.codeName = "GS1 Composite";
      restOfBarcode = barcode.slice(3, barcodelength);
      break;
    case "]d2":
      answer.codeName = "GS1 DataMatrix";
      restOfBarcode = barcode.slice(3, barcodelength);
      break;
    case "]Q3":
      answer.codeName = "GS1 QR Code";
      restOfBarcode = barcode.slice(3, barcodelength);
      break;
    default:
      answer.codeName = "";
      restOfBarcode = barcode;
      break;
  }

  /**
   * we have chopped off any symbology identifier. Now we can
   * try to parse the rest. It should give us an array of
   * ParsedElements.
   */

  /**
   * ===== Second step: ====
   *
   * Parse "barcode" data element by data element using
   * identifyAI.
   *
   */

  answer.parsedCodeItems = [];

  /**
   * The follwoing part calls "identifyAI" in a loop, until
   * the whole barcode is parsed (or an error occurs).
   *
   * It uses the following strategy:
   *
   *   try to parse the part after the symbology identifier:
   *   - identify the first AI;
   *   - make a parsed element from the part after the AI;
   *   - append the parsed element to answer;
   *   - chop off the parsed part;
   *  do so while there is left something to parse;
   */

  while (restOfBarcode.length > 0) {
    try {
      currentElement = identifyAI(restOfBarcode, lotLen);
      restOfBarcode = cleanCodestring(currentElement.codestring, fncChar);
      answer.parsedCodeItems.push(currentElement.element);
      answer.denormalized += "(" + currentElement.element.ai + ")" + currentElement.element.dataString;
    } catch (e) {
      if (e instanceof InternalError) {
        handleInternalError(e);
      } else {
        throw e;
      }
    }
  }
  /**
   * ==== Third and last step: =====
   *
   */
  return answer;
}

function handleInternalError(error: InternalError): never {
  switch (error.code) {
    case "32":
      throw new BarcodeError(BarcodeErrorCodes.InvalidNormalAI, 32, "Invalid normal AI.");
    case "33":
      throw new BarcodeError(BarcodeErrorCodes.InvalidDate, 33, "The year of the date is not valid.");
    case "34":
      throw new BarcodeError(BarcodeErrorCodes.InvalidDate, 34, "The month of the date is not valid.");
    case "36":
      throw new BarcodeError(BarcodeErrorCodes.InvalidNum, 36, "Invalid numbers");
    default:
      throw error;
  }
}

export { parseBarcode as decode };
