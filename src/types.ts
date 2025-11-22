export type ElementType = "S" | "N" | "D";
export type GS1DecodedData = string | number | Date;

export interface ParsedElement {
  ai: string;
  dataTitle: string;
  data: GS1DecodedData;
  dataString: string;
  unit: string;
}

export interface ParseResult {
  element: ParsedElement;
  codestring: string;
}

export interface BarcodeAnswer {
  codeName: string;
  denormalized: string;
  parsedCodeItems: ParsedElement[];
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
