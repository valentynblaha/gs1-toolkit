import type { ElementType } from "./utils";

export type GS1DecodedData = string | number | Date;
export interface ParserParams {
  codestring: string;
  ai: string;
  definition: AIDefinition;
  options: ParserOptions;
}

export type ParserFunction<T> = (params: ParserParams) => ParseResult<T>;
export interface AIDefinition {
  propertyName: string;
  title: string;
  /** Decimal point position - array of valid values for AIs that support variable decimal positions */
  dpp?: number[];
  /** Serial suffix - array of valid values for AIs that support variable serial suffixes (e.g., 703s, 723s) */
  serial?: number[];
  fixedLength?: number;
  parser: ParserFunction<GS1DecodedData>;
}

export interface ParsedElement<T> {
  ai: string;
  dataTitle: string;
  data: T;
  dataString: string;
  unit: string;
  type: ElementType;
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

  /**
   * If true, date fields are returned as UTC timestamps instead of local dates
   */
  utcTimestamps?: boolean;
}
