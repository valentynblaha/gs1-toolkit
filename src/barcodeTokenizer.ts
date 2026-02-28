import { AIDefinitions } from "./aiDefinitions";
import type { ParserOptions } from "./types";
import { GROUP_SEPARATOR } from "./utils";

/**
 * Represents a single token from the barcode
 */
export interface BarcodeToken {
  /** The AI (Application Identifier) code */
  ai: string;
  /** The raw data value for this AI */
  value: string;
  /** Whether this AI has a fixed length or is variable */
  isFixed: boolean;
  /** The definition of this AI from AIDefinitions */
  definition: (typeof AIDefinitions)[string];
}

/**
 * Tokenizes a GS1 barcode based on the AIDefinitions map
 *
 * This tokenizer breaks down a barcode string into its constituent parts,
 * identifying each AI and extracting its corresponding value.
 *
 * @param barcode - The barcode string to tokenize
 * @param options - Parser options (including fncChar for field separator)
 * @returns An array of BarcodeToken objects
 * @throws Error if an invalid AI is encountered or the barcode format is invalid
 *
 * @example
 * const tokens = tokenizeBarcode("01123456789012211234567");
 * // Returns:
 * // [
 * //   { ai: "01", value: "12345678901234", isFixed: true, ... },
 * //   { ai: "21", value: "1234567", isFixed: false, ... }
 * // ]
 */
export function tokenizeBarcode(barcode: string, options: ParserOptions = {}): BarcodeToken[] {
  const fncChar = options.fncChar ?? GROUP_SEPARATOR;
  const tokens: BarcodeToken[] = [];
  let position = 0;

  while (position < barcode.length) {
    const token = extractNextToken(barcode, position, fncChar);

    if (!token) {
      throw new Error(
        `Failed to identify valid AI at position ${position}. ` +
          `Remaining barcode: "${barcode.slice(position)}"`,
      );
    }

    tokens.push(token);
    position = token.nextPosition;
  }

  return tokens;
}

/**
 * Extracts a single token starting at the given position in the barcode
 *
 * @param barcode - The complete barcode string
 * @param position - The current position to start looking for an AI
 * @param fncChar - The FNC1 field separator character
 * @returns A BarcodeToken with the next position to continue parsing, or null if no valid AI found
 */
function extractNextToken(
  barcode: string,
  position: number,
  fncChar: string,
): (BarcodeToken & { nextPosition: number }) | null {
  // Try to match AIs of lengths 2, 3, and 4 (in that order, as per GS1 spec)
  // Shorter AIs have priority
  for (let aiLength = 2; aiLength <= 4; aiLength++) {
    if (position + aiLength > barcode.length) {
      continue;
    }

    const potentialAI = barcode.slice(position, position + aiLength);

    if (potentialAI in AIDefinitions) {
      const definition = AIDefinitions[potentialAI];
      const valueStart = position + aiLength;

      // Extract the value based on whether the AI has fixed or variable length
      const { value, endPosition } = extractValue(barcode, valueStart, definition.fixedLength, fncChar);

      return {
        ai: potentialAI,
        value,
        isFixed: definition.fixedLength !== undefined,
        definition,
        nextPosition: endPosition,
      };
    }
  }

  return null;
}

/**
 * Extracts the data value for an AI
 *
 * For fixed-length AIs, extracts exactly fixedLength characters.
 * For variable-length AIs, extracts until the FNC1 separator or end of string.
 *
 * @param barcode - The barcode string
 * @param startPosition - Where to start extracting the value
 * @param fixedLength - The fixed length (undefined for variable length)
 * @param fncChar - The FNC1 separator character
 * @returns An object with the extracted value and the position after the value
 */
function extractValue(
  barcode: string,
  startPosition: number,
  fixedLength: number | undefined,
  fncChar: string,
): { value: string; endPosition: number } {
  if (fixedLength) {
    // Fixed length: extract exactly fixedLength characters
    const value = barcode.slice(startPosition, startPosition + fixedLength);
    let endPosition = startPosition + fixedLength;

    // Skip any FNC1 characters that might follow (as per GS1 spec)
    while (endPosition < barcode.length && barcode[endPosition] === fncChar) {
      endPosition++;
    }

    return { value, endPosition };
  } else {
    // Variable length: extract until FNC1 or end of string
    const fncIndex = barcode.indexOf(fncChar, startPosition);

    if (fncIndex === -1) {
      // No FNC1 found, take the rest of the barcode
      const value = barcode.slice(startPosition);
      return { value, endPosition: barcode.length };
    } else {
      // FNC1 found, take up to it
      const value = barcode.slice(startPosition, fncIndex);
      return { value, endPosition: fncIndex + 1 };
    }
  }
}

/**
 * Converts an array of tokens into a human-readable format
 * with AI codes in parentheses
 *
 * @param tokens - Array of BarcodeToken objects
 * @returns A denormalized (human-readable) barcode string
 *
 * @example
 * denormalizeTokens(tokens) // "(01)12345678901234(21)1234567"
 */
export function denormalizeTokens(tokens: BarcodeToken[]): string {
  return tokens.map(token => `(${token.ai})${token.value}`).join("");
}

/**
 * Converts tokens to a dictionary format for easy lookup
 *
 * @param tokens - Array of BarcodeToken objects
 * @returns An object mapping AI codes to their values
 *
 * @example
 * tokensToMap(tokens) // { "01": "12345678901234", "21": "1234567" }
 */
export function tokensToMap(tokens: BarcodeToken[]): Record<string, string> {
  const map: Record<string, string> = {};

  for (const token of tokens) {
    if (token.ai in map) {
      // Handle multiple occurrences of the same AI (append or track separately)
      map[token.ai] += `;${token.value}`;
    } else {
      map[token.ai] = token.value;
    }
  }

  return map;
}

/**
 * Validates tokens by checking if their values match expected formats/lengths
 *
 * @param tokens - Array of BarcodeToken objects to validate
 * @returns An object with validation results and any errors found
 */
export function validateTokens(tokens: BarcodeToken[]): {
  isValid: boolean;
  errors: Array<{ ai: string; error: string }>;
} {
  const errors: Array<{ ai: string; error: string }> = [];

  for (const token of tokens) {
    // Check fixed length compliance
    if (token.isFixed && token.definition.fixedLength !== undefined) {
      if (token.value.length !== token.definition.fixedLength) {
        errors.push({
          ai: token.ai,
          error: `Expected length ${token.definition.fixedLength}, got ${token.value.length}`,
        });
      }
    }

    // Check for empty variable length values
    if (!token.isFixed && token.value.length === 0) {
      errors.push({
        ai: token.ai,
        error: "Variable length field cannot be empty",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
