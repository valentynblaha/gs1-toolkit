import type { ElementType } from "./utils";

export type GS1DecodedData = string | number | Date;

export interface ParsedElement<T> {
  ai: string;
  dataTitle: string;
  data: T;
  dataString: string;
  unit: string;
  type: ElementType
}

export interface ParseResult<T> {
  element: ParsedElement<T>;
  codestring: string;
}

export interface BarcodeAnswer {
  codeName: string;
  denormalized: string;
  parsedCodeItems: ParsedElement<GS1DecodedData>[];
}

/**
 * Options that tweak the parser's behavior
 */
export interface ParserOptions {
  /**
   * The FNC1 character, a non-printable special character that delimits fields of variable length.
   * If not specified, the GS char (\x1D) is used
   */
  fncChar?: string;

  /**
   * The lot (or batch) field is usually delimited by a FNC1 char, but you can limit its size to a specific length.
   * If not specified, no limit is applied, except the one in the GS1 specs
   */
  lotMaxLength?: number;
}
