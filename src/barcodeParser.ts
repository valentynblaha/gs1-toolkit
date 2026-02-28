import { tokenizeBarcode } from "./barcodeTokenizer";
import type { BarcodeAnswer, ParserOptions } from "./types";
import { BarcodeError, BarcodeErrorCodes, InternalError } from "./utils";

/**
 * This is the main routine provided by the parseBarcode library. It takes a string,
 * splices it from left to right into its elements and tries to parse it as an
 * GS1 - element. If it succeeds, the result is returned as an object composed of
 * an identifier and an array.It accepts
 * @param   {String}   barcode is the contents of the barcode you'd like to get parsed
 * @param   {Object}   parserOptions options for the parser
 * @returns {Array}    an array with elements which are objects of type "ParsedElement"
 */
function parseBarcode(barcode: string, parserOptions: ParserOptions): BarcodeAnswer {
  if (!barcode || typeof barcode !== "string") {
    throw new BarcodeError(BarcodeErrorCodes.EmptyBarcode, "31", "The barcode is empty or not a string.");
  }

  const barcodelength = barcode.length;
  const answer: BarcodeAnswer = { codeName: "", denormalized: "", parsedCodeItems: [] }; // the object to return
  let restOfBarcode = ""; // the rest of the barcode, when first
  // elements are spliced away
  const symbologyIdentifier = barcode.slice(0, 3);

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
  answer.parsedCodeItems = [];

  try {
    const elements = tokenizeBarcode(restOfBarcode, parserOptions);
    for (const element of elements) {
      const parsedElement = element.definition.parser({
        codestring: element.value,
        ai: element.ai,
        definition: element.definition,
        options: parserOptions,
      });
      answer.parsedCodeItems.push(parsedElement.element);
      answer.denormalized += "(" + parsedElement.element.ai + ")" + parsedElement.element.dataString;
    }
  } catch (e) {
    if (e instanceof InternalError) {
      handleInternalError(e);
    } else {
      throw e;
    }
  }
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

