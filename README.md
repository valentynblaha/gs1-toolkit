# GS1 Barcode Parser

[![NPM version](https://img.shields.io/npm/v/%40valentynb%2Fgs1-parser)](https://www.npmjs.com/package/@valentynb/gs1-parser)
[![NPM downloads](https://img.shields.io/npm/dm/%40valentynb%2Fgs1-parser)](https://www.npmjs.com/package/@valentynb/gs1-parser)
[![Build Status](https://img.shields.io/github/actions/workflow/status/valentynblaha/gs1-parser/publish.yml)](https://github.com/valentynblaha/gs1-parser/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Types Included](https://img.shields.io/badge/types-TypeScript-blue.svg?style=flat-square)](#)

A modern TypeScript library for parsing GS1 barcodes, supporting both ESModule and CommonJS formats.

### Based on work from: https://github.com/PeterBrockfeld/BarcodeParser

## Table of Contents

* [Purpose](#purpose)
* [Installation](#installation)
* [Disclaimer](#disclaimer)
* [The Specification](#the-specification)
* [About GS1 Barcodes](#about-gs1-barcodes)
  * [About the Structure of GS1 Barcodes](#about-the-structure-of-gs1-barcodes)
* [Use Case](#use-case)
* [How to Use It](#how-to-use-it)
  * [ESModule Usage](#esmodule-usage)
  * [CommonJS Usage](#commonjs-usage)
  * [TypeScript Usage](#typescript-usage)
  * [Limitations](#limitations)
* [API Reference](#api-reference)
* [About Barcode Scanning Devices](#about-barcode-scanning-devices)
  * [The FNC1 Character](#the-fnc1-character)
  * [Key Press Detecting](#key-press-detecting)
* [Examples](#examples)
* [What's New](#whats-new)
* [License](#license)

## Purpose

The barcode parser is a TypeScript library for handling the contents of GS1 barcodes. GS1 barcodes are used for various purposes, from simple product barcodes to complex codes describing the contents of an entire pallet. Two-dimensional barcodes can hold a significant amount of information, and this library makes it easier to access and process that data.

The barcode parser contains functions for parsing GS1 barcodes, yielding individual elements in a format easily processable by JavaScript and TypeScript applications.

The barcode parser is meant to be used in applications which:

* Take data from a barcode scanning device or barcode reading application
* Process the data
* Perform actions based on the barcode contents

## Installation

```bash
npm install @valentynb/gs1-parser
# or
yarn add @valentynb/gs1-parser
# or
pnpm add @valentynb/gs1-parser
```

## Disclaimer

This library is an independent interpretation of the GS1 specification. It is neither endorsed, supported, approved, nor recommended by GS1, and there are no affiliations with GS1.

## The Specification

The full "GS1 General Specifications" can be found at [http://www.gs1.org/standards/genspecs](https://ref.gs1.org/standards/genspecs/). This library has been updated to comply with the **2025 version** of the GS1 specification.

## About GS1 Barcodes

GS1 barcodes can contain comprehensive product information including:

* GTIN (Global Trade Item Number, formerly UPC or EAN)
* Weight or dimensions
* Price
* Lot/batch code
* Manufacturing date
* Expiration date
* And much more

### About the Structure of GS1 Barcodes

A GS1 barcode is a concatenation of *data elements*. Each element starts with an *application identifier* (AI), a two to four digit number, followed by the actual information.

A *data element* is delimited by:

* The end of the barcode
* A fixed character count specification
* A special FNC1 character

The *application identifiers* and their properties are described in the third chapter of the GS1 General Specifications.

The GS1 barcode begins with a *symbology identifier* (a three-character sequence denoting the barcode type), followed by an arbitrary number of *data elements*. The parser decomposes this string into its individual elements.

## Use Case

Your application receives a GS1 barcode as a string from a scanning device:

```
]C101040123456789011715012910ABC1233932978471131030005253922471142127649716
```

The library extracts and parses the data into structured elements:

| AI | Title | Contents | Unit/Currency |
|:---|:------|:---------|:--------------|
| 01 | GTIN | 04012345678901 | |
| 17 | USE BY OR EXPIRY | 2015-01-29 | |
| 10 | BATCH/LOT | ABC123 | |
| 3932 | PRICE | 47.11 | 978 |
| 3103 | NET WEIGHT (kg) | 0.525 | KGM |
| 3922 | PRICE | 47.11 | |
| 421 | SHIP TO POST | 49716 | 276 |

## How to Use It

### ESModule Usage

```typescript
import { GS1Parser } from '@valentynb/gs1-parser';

const gs1Parser = new GS1Parser(
  {
    lotMaxLength: 20 // If not specified, no limit is applied, except the one in the GS1 specs
    fncChar: String.fromCodePoint(29); // If not specified, the GS char is used
  }
);

try {
  const barcodeString = document.getElementById("barcode").value;
  // returns a DecodeResult object or throws an Error in case of parsing errors
  const result = gs1Parser.decode(barcodeString);
  
  console.log(result.codeName); // e.g., "GS1-128"
  console.log(result.denormalized); // Full barcode with parentheses
  console.log(result.data); // Dictionary of parsed elements
} catch (error) {
  console.error('Barcode parsing failed:', error);
}
```

### CommonJS Usage

```javascript
const { parseBarcode } = require('@valentynb/gs1-parser');

try {
  const result = parseBarcode(barcodeString);
  // Process result...
} catch (error) {
  console.error('Barcode parsing failed:', error);
}
```

### TypeScript Usage

The library is written in TypeScript and includes full type definitions:

```typescript
import { GS1Parser, BarcodeResult, ParsedElement } from '@valentynb/gs1-parser';

const gs1Parser = new GS1Parser(
  {
    lotMaxLength: 20 // If not specified, no limit is applied, except the one in the GS1 specs
    fncChar: String.fromCodePoint(29); // If not specified, the GS char is used
  }
);

try {
  const result: BarcodeResult = gs1Parser.decode(barcodeString);
  
  result.data.values().forEach((item: ParsedElement) => {
    console.log(`AI: ${item.ai}`);
    console.log(`Title: ${item.dataTitle}`);
    console.log(`Data: ${item.data}`);
    console.log(`Unit: ${item.unit || 'N/A'}`);
  });
} catch (error) {
  console.error('Error:', error);
}
```

### Limitations

The `decode()` method does not perform plausibility checks (as of now). If the barcode contains invalid data (e.g., an invalid GTIN or ISO code), the function will return this invalid content without validation.

## API Reference

### `GS1Parser.decode(barcode: string): BarcodeResult`

Parses a GS1 barcode string and returns structured data.

**Returns:** `BarcodeResult` object containing:
- `codeName` (string): Barcode type identifier (e.g., "GS1-128", "GS1-DataMatrix")
- `data` (Partial<Record<GS1Field, ParsedElement>>): Dictionary of parsed data elements
- `denormalized` (string): The original barcode in human readable form, with parentheses surrounding each AI

**ParsedCodeItem structure:**
- `ai` (string): Application identifier
- `data` (string | number | Date): The actual content
- `dataTitle` (string): Description of the data element
- `dataString` (string): The substring that is being parsed
- `unit` (string | undefined): Unit of measurement, country code, or currency (ISO codes)

## About Barcode Scanning Devices

GS1 barcodes are typically scanned using hardware barcode scanners configured as HID (Human Interface Device) keyboards. This works well for most characters but presents challenges with the FNC1 character.

### The FNC1 Character

The FNC1 is a non-printable control character used to delimit GS1 Element Strings of variable length.

GS1 DataMatrix and GS1 QR Code use ASCII Group Separator (GS, ASCII 29, 0x1D, Unicode U+001D) as FNC1.

Since this character isn't on standard keyboards, scanners send control sequences as replacements. The canonical sequence is `Ctrl + ]`.

**Important:** Keyboard layout matters! A scanner emulating a German keyboard may send `Ctrl + +` instead of `Ctrl + ]`, which can trigger browser zoom. You'll need to:

1. Identify the sequence your scanner sends
2. Catch and transform these keyboard events into proper group separators

### Key Press Detecting

To determine what control sequence your scanner sends, create a simple test page that logs keyboard events (`keyCode`, `charCode`, `which`) to the console when scanning test barcodes containing the GS character.

## Examples

Example usage and test barcodes are included in the repository, demonstrating:

* Basic parsing operations
* Handling different barcode formats (GS1-128, DataMatrix, QR Code)
* Working with FNC1 characters
* Building scanning applications

## What's New

This modernized version includes:

* **TypeScript**: Full TypeScript rewrite with complete type definitions
* **Dual Module Support**: Works with both ESModule (`import`) and CommonJS (`require`)
* **Updated Specification**: Complies with 2025 GS1 General Specifications
* **Reorganized Code**: Improved code structure and maintainability
* **Modern Build System**: Compatible with current JavaScript tooling

## License

Copyright © 2014-2015 Peter Brockfeld (original version)  
Copyright © 2025 Valentyn Blaha (This version)

See the LICENSE.md file for license rights and limitations (MIT).
