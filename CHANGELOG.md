# Changelog

All changes to this project are documented in this file.

## v2.0.0

- Error handling changes:
- for a faulty field (ex. wrong date format) behavior has changed:
  - it won't throw an error, but mark field type as 'error' and the detailed error will be in the field 'error'.
  - dataString attribute will contain the raw value.
  - isValid field is introduced to flag if any field has parsing issue
  - not field related error: ex. invalid AI number will throw an error
- fix UTC date parsing

## v1.5.0

### Added

- AIs from 7230 to 7259
- Added datetime parsing: YYMMddHHmm

### Fixed

- Missing entry for AI entries: 03, 7011
- Wrong entries for some logistic measure AIs (33nn, 34nn, 35nn, 36nn)

## v1.4.0

### Added

- AIs from 4300 to 4333 (transport related AIs)
- Flag for UTC or local Date parsing

## v1.3.0

### Added

- Length validation for date fields
- Numeric validation for date fields
- GS1-compliant century calculation for dates

## v1.2.1

### Fixed

- Missing export of `ElementType`

## v1.2.0

### Added

- Data type indication for `ParsedElement`
- Auto-generated documentation
- Workflow that publishes documentation to GitHub Pages
- Generic data types in parsing functions

### Fixed

- Publishing of the `.github` directory
- README badge links
- OIDC authentication in the publishing workflow

## v1.1.0

### Added

- Validation for numeric data types

### Fixed

- Error messages
- README copyright and other package information

## v1.0.0

### First version

- Parsing of GS1 barcodes
