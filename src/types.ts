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

export interface ParserOptions {
  fncChar?: string;
  lotMaxLength?: number;
}