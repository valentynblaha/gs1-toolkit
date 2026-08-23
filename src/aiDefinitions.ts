import {
  parseDate,
  parseFixedLength,
  parseFixedLengthMeasure,
  parseTemperature,
  parseVariableLength,
  parseVariableLengthMeasure,
  parseVariableLengthWithISOChars,
  parseVariableLengthWithISONumbers,
} from "./parsers";
import type { AIDefinition } from "./types";

export const AIDefinitions: Record<string, AIDefinition> = {
  // SSCC (Serial Shipping Container Code)
  "00": {
    propertyName: "sscc",
    title: "SSCC",
    fixedLength: 18,
    parser: parseFixedLength,
  },
  // Global Trade Item Number (GTIN)
  "01": {
    propertyName: "gtin",
    title: "GTIN",
    fixedLength: 14,
    parser: parseFixedLength,
  },
  // GTIN of Contained Trade Items
  "02": {
    propertyName: "content",
    title: "CONTENT",
    fixedLength: 14,
    parser: parseFixedLength,
  },
  // GTIN of Made-to-Order Trade Items
  "03": {
    propertyName: "mtoGtin",
    title: "MTO GTIN",
    fixedLength: 14,
    parser: parseFixedLength,
  },
  // Batch or Lot Number
  "10": {
    propertyName: "batch",
    title: "BATCH/LOT",
    parser: parseVariableLength,
  },
  // Production Date (YYMMDD)
  "11": {
    propertyName: "prodDate",
    title: "PROD DATE",
    fixedLength: 6,
    parser: parseDate,
  },
  // Due Date (YYMMDD)
  "12": {
    propertyName: "dueDate",
    title: "DUE DATE",
    fixedLength: 6,
    parser: parseDate,
  },
  // Packaging Date (YYMMDD)
  "13": {
    propertyName: "packDate",
    title: "PACK DATE",
    fixedLength: 6,
    parser: parseDate,
  },
  // Best Before Date (YYMMDD)
  "15": {
    propertyName: "bestBefore",
    title: "BEST BEFORE or BEST BY",
    fixedLength: 6,
    parser: parseDate,
  },
  // Sell By Date (YYMMDD)
  "16": {
    propertyName: "sellBy",
    title: "SELL BY",
    fixedLength: 6,
    parser: parseDate,
  },
  // Expiration Date (YYMMDD)
  "17": {
    propertyName: "expDate",
    title: "USE BY OR EXPIRY",
    fixedLength: 6,
    parser: parseDate,
  },
  // Variant Number
  "20": {
    propertyName: "variant",
    title: "VARIANT",
    fixedLength: 2,
    parser: parseFixedLength,
  },
  // Serial Number
  "21": {
    propertyName: "serial",
    title: "SERIAL",
    parser: parseVariableLength,
  },
  // Product Variant
  "22": {
    propertyName: "hibcc",
    title: "CPV",
    parser: parseVariableLength,
  },
  // Third Party Controlled, Serialised Extension of Global Trade Item Number (GTIN)
  "235": {
    propertyName: "tpx",
    title: "TPX",
    parser: parseVariableLength,
  },
  // Additional Item Identification
  "240": {
    propertyName: "additionalProductID",
    title: "ADDITIONAL ID",
    parser: parseVariableLength,
  },
  // Customer Part Number
  "241": {
    propertyName: "customerPartNumber",
    title: "CUST. PART NO.",
    parser: parseVariableLength,
  },
  // Made-to-Order Variation Number
  "242": {
    propertyName: "madeToOrder",
    title: "MTO VARIANT",
    parser: parseVariableLength,
  },
  // Packaging Component Number
  "243": {
    propertyName: "packaging",
    title: "PCN",
    parser: parseVariableLength,
  },
  // Secondary Serial Number
  "250": {
    propertyName: "secondarySerialNumber",
    title: "SECONDARY SERIAL",
    parser: parseVariableLength,
  },
  // Reference to Source Entity
  "251": {
    propertyName: "refSource",
    title: "REF. TO SOURCE",
    parser: parseVariableLength,
  },
  // Global Document Type Identifier (GDTI)
  "253": {
    propertyName: "gdti",
    title: "GDTI",
    parser: parseVariableLength,
  },
  // GLN Extension Component
  "254": {
    propertyName: "glnExtension",
    title: "GLN EXTENSION COMPONENT",
    parser: parseVariableLength,
  },
  // Global Coupon Number (GCN)
  "255": {
    propertyName: "gcn",
    title: "GCN",
    parser: parseVariableLength,
  },
  // Count of Items (Variable Measure Trade Item)
  "30": {
    propertyName: "variableCount",
    title: "VAR. COUNT",
    parser: parseVariableLength,
  },
  // Net weight, kilograms (Variable Measure Trade Item)
  "310": {
    propertyName: "netWeightKg",
    title: "NET WEIGHT (kg)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Length or first dimension, metres (Variable Measure Trade Item)
  "311": {
    propertyName: "lengthMeters",
    title: "LENGTH (m)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Width, diameter, or second dimension, metres (Variable Measure Trade Item)
  "312": {
    propertyName: "widthMeters",
    title: "WIDTH (m)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Depth, thickness, height, or third dimension, metres (Variable Measure Trade Item)
  "313": {
    propertyName: "heightMeters",
    title: "HEIGHT (m)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Area, square metres (Variable Measure Trade Item)
  "314": {
    propertyName: "areaSquareMeters",
    title: "AREA (m2)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Net volume, litres (Variable Measure Trade Item)
  "315": {
    propertyName: "netVolumeLiters",
    title: "NET VOLUME (l)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Net volume, cubic metres (Variable Measure Trade Item)
  "316": {
    propertyName: "netVolumeCubicMeters",
    title: "NET VOLUME (m3)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Net weight, pounds (Variable Measure Trade Item)
  "320": {
    propertyName: "netWeightLb",
    title: "NET WEIGHT (lb)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Length or first dimension, inches (Variable Measure Trade Item)
  "321": {
    propertyName: "lengthInches",
    title: "LENGTH (i)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Length or first dimension, feet (Variable Measure Trade Item)
  "322": {
    propertyName: "lengthFeet",
    title: "LENGTH (f)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Length or first dimension, yards (Variable Measure Trade Item)
  "323": {
    propertyName: "lengthYards",
    title: "LENGTH (y)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Width, diameter, or second dimension, inches (Variable Measure Trade Item)
  "324": {
    propertyName: "widthInches",
    title: "WIDTH (i)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Width, diameter, or second dimension, feet (Variable Measure Trade Item)
  "325": {
    propertyName: "widthFeet",
    title: "WIDTH (f)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Width, diameter, or second dimension, yards (Variable Measure Trade Item
  "326": {
    propertyName: "widthYards",
    title: "WIDTH (y)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Depth, thickness, height, or third dimension, inches (Variable Measure Trade Item)
  "327": {
    propertyName: "heightInches",
    title: "HEIGHT (i)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Depth, thickness, height, or third dimension, feet (Variable Measure Trade Item)
  "328": {
    propertyName: "heightFeet",
    title: "HEIGHT (f)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Depth, thickness, height, or third dimension, yards (Variable Measure Trade Item)
  "329": {
    propertyName: "heightYards",
    title: "HEIGHT (y)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Logistic weight, kilograms
  "330": {
    propertyName: "grossWeightKg",
    title: "GROSS WEIGHT (kg)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Length or first dimension, metres
  "331": {
    propertyName: "lengthMetersLog",
    title: "LENGTH (m), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Width, diameter, or second dimension, metres
  "332": {
    propertyName: "widthMetersLog",
    title: "WIDTH (m), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Depth, thickness, height, or third dimension, metres
  "333": {
    propertyName: "heightMetersLog",
    title: "HEIGHT (m), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Area, square metres
  "334": {
    propertyName: "areaSquareMetersLog",
    title: "AREA (m2), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Logistic volume, litres
  "335": {
    propertyName: "volumeLitresLog",
    title: "VOLUME (l), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Logistic volume, cubic metres
  "336": {
    propertyName: "volumeCubicMetersLog",
    title: "VOLUME (m3), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Kilograms per square metre, yes, the ISO code for this _is_ "28".
  "337": {
    propertyName: "kgPerSquareMeters",
    title: "KG PER m²",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Logistic weight, pounds
  "340": {
    propertyName: "grossWeightPounds",
    title: "GROSS WEIGHT (lb)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Length or first dimension, inches
  "341": {
    propertyName: "lengthInchesLog",
    title: "LENGTH (i), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Length or first dimension, feet
  "342": {
    propertyName: "lengthFeetLog",
    title: "LENGTH (f), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Length or first dimension, yards
  "343": {
    propertyName: "lengthYardsLog",
    title: "LENGTH (y), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Width, diameter, or second dimension, inches
  "344": {
    propertyName: "widthInchesLog",
    title: "WIDTH (i), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Width, diameter, or second dimension, feet
  "345": {
    propertyName: "widthFeetLog",
    title: "WIDTH (f), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Width, diameter, or second dimension, yard
  "346": {
    propertyName: "widthYardsLog",
    title: "WIDTH (y), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Depth, thickness, height, or third dimension, inches
  "347": {
    propertyName: "heightInchesLog",
    title: "HEIGHT (in), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Depth, thickness, height, or third dimension, feet
  "348": {
    propertyName: "heightFeetLog",
    title: "HEIGHT (ft), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Depth, thickness, height, or third dimension, yards
  "349": {
    propertyName: "heightYardsLog",
    title: "HEIGHT (yd), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Area, square inches (Variable Measure Trade Item)
  "350": {
    propertyName: "areaSquareInches",
    title: "AREA (i2)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Area, square feet (Variable Measure Trade Item)
  "351": {
    propertyName: "areaSquareFeet",
    title: "AREA (f2)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Area, square yards (Variable Measure Trade Item)
  "352": {
    propertyName: "areaSquareYards",
    title: "AREA (y2)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Area, square inches
  "353": {
    propertyName: "areaSquareInchesLog",
    title: "AREA (i2), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Area, square feet
  "354": {
    propertyName: "areaSquareFeetLog",
    title: "AREA (f2), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Area, square yards
  "355": {
    propertyName: "areaSquareYardsLog",
    title: "AREA (y2), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Net weight, troy ounces (Variable Measure Trade Item)
  "356": {
    propertyName: "netWeightTroyOunces",
    title: "NET WEIGHT (t)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Net weight (or volume), ounces (Variable Measure Trade Item)
  "357": {
    propertyName: "netVolumeOunces",
    title: "NET VOLUME (oz)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Net volume, quarts (Variable Measure Trade Item)
  "360": {
    propertyName: "netVolumeQuarts",
    title: "NET VOLUME (q)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Net volume, gallons U.S. (Variable Measure Trade Item)
  "361": {
    propertyName: "netVolumeGallons",
    title: "NET VOLUME (g)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Logistic volume, quarts
  "362": {
    propertyName: "volumeQuartsLog",
    title: "VOLUME (q), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Logistic volume, gallons U.S.
  "363": {
    propertyName: "volumeGallonsLog",
    title: "VOLUME (g), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Net volume, cubic inches (Variable Measure Trade Item)
  "364": {
    propertyName: "volumeCubicInches",
    title: "VOLUME (i3)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Net volume, cubic feet (Variable Measure Trade Item)
  "365": {
    propertyName: "volumeCubicFeet",
    title: "VOLUME (f3)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Net volume, cubic yards (Variable Measure Trade Item)
  "366": {
    propertyName: "volumeCubicYards",
    title: "VOLUME (y3)",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Logistic volume, cubic inches
  "367": {
    propertyName: "volumeCubicInchesLog",
    title: "VOLUME (in3), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Logistic volume, cubic feet
  "368": {
    propertyName: "volumeCubicFeetLog",
    title: "VOLUME (ft3), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Logistic volume, cubic yards
  "369": {
    propertyName: "volumeCubicYardsLog",
    title: "VOLUME (yd3), log",
    dpp: [0, 1, 2, 3, 4, 5],
    fixedLength: 6,
    parser: parseFixedLengthMeasure,
  },
  // Count of Trade Items
  "37": {
    propertyName: "count",
    title: "COUNT",
    parser: parseVariableLength,
  },
  // Applicable Amount Payable, local currency
  "390": {
    propertyName: "amountPayable",
    title: "AMOUNT",
    dpp: [0, 1, 2, 3, 4, 5],
    parser: parseVariableLengthMeasure,
  },
  // Applicable Amount Payable with ISO Currency Code
  "391": {
    propertyName: "amountPayableISO",
    title: "AMOUNT",
    dpp: [0, 1, 2, 3, 4, 5],
    parser: parseVariableLengthWithISONumbers,
  },
  // Applicable Amount Payable, single monetary area (Variable Measure Trade Item)
  "392": {
    propertyName: "price",
    title: "PRICE",
    dpp: [0, 1, 2, 3],
    parser: parseVariableLengthMeasure,
  },
  // Applicable Amount Payable with ISO Currency Code (Variable Measure Trade Item)
  "393": {
    propertyName: "priceISO",
    title: "PRICE",
    dpp: [0, 1, 2, 3],
    parser: parseVariableLengthWithISONumbers,
  },
  // Percentage discount of a coupon
  "394": {
    propertyName: "percentDiscount",
    title: "PRCNT OFF",
    dpp: [0, 1, 2, 3],
    parser: parseVariableLength,
  },
  // Amount payable per unit of measure single monetary area (variable measure trade item)
  "395": {
    propertyName: "pricePerUnitMeasure",
    title: "PRICE/UoM",
    dpp: [0, 1, 2, 3, 4, 5],
    parser: parseVariableLength,
  },
  // Customer's Purchase Order Number
  "400": {
    propertyName: "orderNumber",
    title: "ORDER NUMBER",
    parser: parseVariableLength,
  },
  // Global Identification Number for Consignment (GINC)
  "401": {
    propertyName: "ginc",
    title: "GINC",
    parser: parseVariableLength,
  },
  // Global Shipment Identification Number (GSIN)
  "402": {
    propertyName: "gsin",
    title: "GSIN",
    parser: parseVariableLength,
  },
  // Routing Code
  "403": {
    propertyName: "route",
    title: "ROUTE",
    parser: parseVariableLength,
  },
  // Ship to - Deliver to Global Location Number
  "410": {
    propertyName: "shipTo",
    title: "SHIP TO LOC",
    fixedLength: 13,
    parser: parseFixedLength,
  },
  // Bill to - Invoice to Global Location Number
  "411": {
    propertyName: "billTo",
    title: "BILL TO",
    fixedLength: 13,
    parser: parseFixedLength,
  },
  // Purchased from Global Location Number
  "412": {
    propertyName: "purchaseFrom",
    title: "PURCHASE FROM",
    fixedLength: 13,
    parser: parseFixedLength,
  },
  // Ship for - Deliver for - Forward to Global Location Number
  "413": {
    propertyName: "shipFor",
    title: "SHIP FOR LOC",
    fixedLength: 13,
    parser: parseFixedLength,
  },
  // Identification of a physical location - Global Location Number (GLN)
  "414": {
    propertyName: "locNo",
    title: "LOC NO",
    fixedLength: 13,
    parser: parseFixedLength,
  },
  // Global Location Number (GLN) of the invoicing party
  "415": {
    propertyName: "payTo",
    title: "PAY TO",
    fixedLength: 13,
    parser: parseFixedLength,
  },
  // Global Location Number (GLN) of the production or service location
  "416": {
    propertyName: "prodServLoc",
    title: "PROD/SERV LOC",
    fixedLength: 13,
    parser: parseFixedLength,
  },
  // Party Global Location Number (GLN)
  "417": {
    propertyName: "party",
    title: "PARTY",
    fixedLength: 13,
    parser: parseFixedLength,
  },
  // Ship to - Deliver to Postal Code Within a Single Postal Authority
  "420": {
    propertyName: "shipToPost",
    title: "SHIP TO POST",
    parser: parseVariableLength,
  },
  // Ship to - Deliver to Postal Code with ISO Country Code
  "421": {
    propertyName: "shipToPostISO",
    title: "SHIP TO POST",
    parser: parseVariableLengthWithISOChars,
  },
  // Country of Origin of a Trade Item
  "422": {
    propertyName: "origin",
    title: "ORIGIN",
    parser: parseFixedLength,
  },
  // Country of Initial Processing
  "423": {
    propertyName: "countryInitialProcess",
    title: "COUNTRY - INITIAL PROCESS.",
    parser: parseVariableLength,
  },
  // Country of Processing
  "424": {
    propertyName: "countryProcess",
    title: "COUNTRY - PROCESS.",
    parser: parseFixedLength,
  },
  // Country of Disassembly
  "425": {
    propertyName: "countryDisassembly",
    title: "COUNTRY - DISASSEMBLY",
    parser: parseFixedLength,
  },
  // Country Covering full Process Chain
  "426": {
    propertyName: "countryFullProcess",
    title: "COUNTRY - FULL PROCESS",
    parser: parseFixedLength,
  },
  // Country Subdivision of Origin
  "427": {
    propertyName: "originSubdivision",
    title: "ORIGIN SUBDIVISION",
    parser: parseVariableLength,
  },
  // National Healthcare Reimbursement Number (NHRN) – Germany PZN
  "710": {
    propertyName: "nhrnPzn",
    title: "NHRN PZN",
    parser: parseVariableLength,
  },
  // National Healthcare Reimbursement Number (NHRN) – France CIP
  "711": {
    propertyName: "nhrnCip",
    title: "NHRN CIP",
    parser: parseVariableLength,
  },
  // National Healthcare Reimbursement Number (NHRN) – Spain CN
  "712": {
    propertyName: "nhrnCn",
    title: "NHRN CN",
    parser: parseVariableLength,
  },
  // National Healthcare Reimbursement Number (NHRN) – Brasil DRN
  "713": {
    propertyName: "nhrnDrn",
    title: "NHRN DRN",
    parser: parseVariableLength,
  },
  // National Healthcare Reimbursement Number (NHRN) – Portugal AIM
  "714": {
    propertyName: "nhrnAim",
    title: "NHRN AIM",
    parser: parseVariableLength,
  },
  // National Healthcare Reimbursement Number (NHRN) – United States of America NDC
  "715": {
    propertyName: "nhrnDnc",
    title: "NHRN NDC",
    parser: parseVariableLength,
  },
  // National Healthcare Reimbursement Number (NHRN) – Italy AIC
  "716": {
    propertyName: "nhrnAic",
    title: "NHRN AIC",
    parser: parseVariableLength,
  },
  // Ship-to / Deliver-to Company name
  "4300": {
    propertyName: "shipToComp",
    title: "SHIP TO COMP",
    parser: parseVariableLength,
  },
  // Ship-to / Deliver-to contact name
  "4301": {
    propertyName: "shipToName",
    title: "SHIP TO NAME",
    parser: parseVariableLength,
  },
  // Ship-to / Deliver-to address line 1
  "4302": {
    propertyName: "shipToAdd1",
    title: "SHIP TO ADD1",
    parser: parseVariableLength,
  },
  // Ship-to / Deliver-to address line 2
  "4303": {
    propertyName: "shipToAdd2",
    title: "SHIP TO ADD2",
    parser: parseVariableLength,
  },
  // Ship-to / Deliver-to suburb
  "4304": {
    propertyName: "shipToSub",
    title: "SHIP TO SUB",
    parser: parseVariableLength,
  },
  // Ship-to / Deliver-to locality
  "4305": {
    propertyName: "shipToLoc",
    title: "SHIP TO LOC",
    parser: parseVariableLength,
  },
  // Ship-to / Deliver-to region
  "4306": {
    propertyName: "shipToReg",
    title: "SHIP TO REG",
    parser: parseVariableLength,
  },
  // Ship-to / Deliver-to country code
  "4307": {
    propertyName: "shipToCountry",
    title: "SHIP TO COUNTRY",
    parser: parseVariableLength,
  },
  // Ship-to / Deliver-to telephone number
  "4308": {
    propertyName: "shipToPhone",
    title: "SHIP TO PHONE",
    parser: parseVariableLength,
  },
  // Ship-to / Deliver-to GEO location
  "4309": {
    propertyName: "shipToGeo",
    title: "SHIP TO GEO",
    parser: parseVariableLength,
  },
  // Return-to / Deliver-to Company name
  "4310": {
    propertyName: "rtnToComp",
    title: "RTN TO COMP",
    parser: parseVariableLength,
  },
  // Return-to / Deliver-to contact name
  "4311": {
    propertyName: "rtnToName",
    title: "RTN TO NAME",
    parser: parseVariableLength,
  },
  // Return-to / Deliver-to address line 1
  "4312": {
    propertyName: "rtnToAdd1",
    title: "RTN TO ADD1",
    parser: parseVariableLength,
  },
  // Return-to / Deliver-to address line 2
  "4313": {
    propertyName: "rtnToAdd2",
    title: "RTN TO ADD2",
    parser: parseVariableLength,
  },
  // Return-to / Deliver-to suburb
  "4314": {
    propertyName: "rtnToSub",
    title: "RTN TO SUB",
    parser: parseVariableLength,
  },
  // Return-to / Deliver-to locality
  "4315": {
    propertyName: "rtnToLoc",
    title: "RTN TO LOC",
    parser: parseVariableLength,
  },
  // Return-to / Deliver-to region
  "4316": {
    propertyName: "rtnToReg",
    title: "RTN TO REG",
    parser: parseVariableLength,
  },
  // Return-to / Deliver-to country code
  "4317": {
    propertyName: "rtnToCountry",
    title: "RTN TO COUNTRY",
    parser: parseVariableLength,
  },
  // Return-to / Deliver-to postal code
  "4318": {
    propertyName: "rtnToPost",
    title: "RTN TO POST",
    parser: parseVariableLength,
  },
  // Return-to / Deliver-to telephone number
  "4319": {
    propertyName: "rtnToPhone",
    title: "RTN TO PHONE",
    parser: parseVariableLength,
  },
  // Service code description
  "4320": {
    propertyName: "srvDescription",
    title: "SRV DESCRIPTION",
    parser: parseVariableLength,
  },
  // Dangerous goods flag
  "4321": {
    propertyName: "dangerousGoods",
    title: "DANGEROUS GOODS",
    parser: parseVariableLength,
  },
  // Authority to leave flag
  "4322": {
    propertyName: "authLeave",
    title: "AUTH LEAVE",
    parser: parseVariableLength,
  },
  // Signature required flag
  "4323": {
    propertyName: "sigRequired",
    title: "SIG REQUIRED",
    parser: parseVariableLength,
  },
  // Not before delivery date/time
  "4324": {
    propertyName: "nbefDelDt",
    title: "NBEF DEL DT",
    parser: parseVariableLength,
  },
  // Not after delivery date/time
  "4325": {
    propertyName: "naftDelDt",
    title: "NAFT DEL DT",
    parser: parseVariableLength,
  },
  // Release date
  "4326": {
    propertyName: "relDate",
    title: "REL DATE",
    parser: parseVariableLength,
  },
  // Maximum temperature in Fahrenheit
  "4330": {
    propertyName: "maxTempF",
    title: "MAX TEMP F",
    parser: parseTemperature,
  },
  // Maximum temperature in Celsius
  "4331": {
    propertyName: "maxTempC",
    title: "MAX TEMP C",
    parser: parseTemperature,
  },
  // Minimum temperature in Fahrenheit
  "4332": {
    propertyName: "minTempF",
    title: "MIN TEMP F",
    parser: parseTemperature,
  },
  // Minimum temperature in Celsius
  "4333": {
    propertyName: "minTempC",
    title: "MIN TEMP C",
    parser: parseTemperature,
  },
  // NATO Stock Number (NSN)
  "7001": {
    propertyName: "nsn",
    title: "NSN",
    parser: parseVariableLength,
  },
  // UN/ECE Meat Carcasses and Cuts Classification
  "7002": {
    propertyName: "meatCut",
    title: "MEAT CUT",
    parser: parseVariableLength,
  },
  // Expiration Date and Time
  "7003": {
    propertyName: "expirationDateTime",
    title: "EXPIRY TIME",
    parser: parseVariableLength,
  },
  // Active Potency
  "7004": {
    propertyName: "activePotency",
    title: "ACTIVE POTENCY",
    parser: parseVariableLength,
  },
  // Catch area
  "7005": {
    propertyName: "catchArea",
    title: "CATCH AREA",
    parser: parseVariableLength,
  },
  // First freeze date
  "7006": {
    propertyName: "firstFreezeDate",
    title: "FIRST FREEZE DATE",
    parser: parseDate,
  },
  // Harvest date
  "7007": {
    propertyName: "harvestDate",
    title: "HARVEST DATE",
    parser: parseVariableLength,
  },
  // Species for fishery purposes
  "7008": {
    propertyName: "aquaticSpecies",
    title: "AQUATIC SPECIES",
    parser: parseVariableLength,
  },
  // Fishing gear type
  "7009": {
    propertyName: "fishingGearType",
    title: "FISHING GEAR TYPE",
    parser: parseVariableLength,
  },
  // Production method
  "7010": {
    propertyName: "prodMethod",
    title: "PROD METHOD",
    parser: parseVariableLength,
  },
  // Test by date
  "7011": {
    propertyName: "testBy",
    title: "TEST BY DATE",
    parser: parseVariableLength,
  },
  // Refurbishment lot ID
  "7020": {
    propertyName: "refurbLot",
    title: "REFURB LOT",
    parser: parseVariableLength,
  },
  // Functional status
  "7021": {
    propertyName: "funcStat",
    title: "FUNC STAT",
    parser: parseVariableLength,
  },
  // Revision status
  "7022": {
    propertyName: "revStat",
    title: "REV STAT",
    parser: parseVariableLength,
  },
  // Global Individual Asset Identifier of an assembly
  "7023": {
    propertyName: "giaiAssembly",
    title: "GIAI - ASSEMBLY",
    parser: parseVariableLength,
  },
  // Approval Number of Processor with ISO Country Code
  "703": {
    propertyName: "processor",
    title: "PROCESSOR # s",
    serial: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    parser: parseVariableLengthWithISOChars,
  },
  // GS1 UIC with Extension 1 and Importer index
  "7040": {
    propertyName: "uicExt",
    title: "UIC+EXT",
    parser: parseFixedLength,
  },
  // UN/CEFACT freight unit type
  "7041": {
    propertyName: "ufrgtUnitType",
    title: "UFRGT UNIT TYPE",
    parser: parseVariableLength,
  },
  // Approval Number of Processor with ISO Country Code family (placeholder)
  "723": {
    propertyName: "certificationRef",
    title: "CERT # s",
    serial: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    parser: parseVariableLengthWithISOChars,
  },
  // PROTOCOL
  "7240": {
    propertyName: "protocol",
    title: "PROTOCOL",
    parser: parseVariableLength,
  },
  // AIDC MEDIA TYPE
  "7241": {
    propertyName: "aidcMediaType",
    title: "AIDC MEDIA TYPE",
    parser: parseVariableLength,
  },
  // VCN
  "7242": {
    propertyName: "vcn",
    title: "VCN",
    parser: parseVariableLength,
  },
  // DOB
  "7250": {
    propertyName: "dob",
    title: "DOB",
    parser: parseVariableLength,
  },
  // DOB TIME
  "7251": {
    propertyName: "dobTime",
    title: "DOB TIME",
    parser: parseVariableLength,
  },
  // BIO SEX
  "7252": {
    propertyName: "bioSex",
    title: "BIO SEX",
    parser: parseVariableLength,
  },
  // FAMILY NAME
  "7253": {
    propertyName: "familyName",
    title: "FAMILY NAME",
    parser: parseVariableLength,
  },
  // GIVEN NAME
  "7254": {
    propertyName: "givenName",
    title: "GIVEN NAME",
    parser: parseVariableLength,
  },
  // SUFFIX
  "7255": {
    propertyName: "suffix",
    title: "SUFFIX",
    parser: parseVariableLength,
  },
  // FULL NAME
  "7256": {
    propertyName: "fullName",
    title: "FULL NAME",
    parser: parseVariableLength,
  },
  // PERSON ADDR
  "7257": {
    propertyName: "personAddr",
    title: "PERSON ADDR",
    parser: parseVariableLength,
  },
  // BIRTH SEQUENCE
  "7258": {
    propertyName: "birthSeq",
    title: "BIRTH SEQUENCE",
    parser: parseVariableLength,
  },
  // BABY
  "7259": {
    propertyName: "baby",
    title: "BABY",
    parser: parseVariableLength,
  },
  // Roll Products (Width, Length, Core Diameter, Direction, Splices)
  "8001": {
    propertyName: "rollProducts",
    title: "DIMENSIONS",
    parser: parseVariableLength,
  },
  // Cellular Mobile Telephone Identifier
  "8002": {
    propertyName: "cmtNo",
    title: "CMT No",
    parser: parseVariableLength,
  },
  // Global Returnable Asset Identifier (GRAI)
  "8003": {
    propertyName: "grai",
    title: "GRAI",
    parser: parseVariableLength,
  },
  // Global Individual Asset Identifier (GIAI)
  "8004": {
    propertyName: "giai",
    title: "GIAI",
    parser: parseVariableLength,
  },
  // Price Per Unit of Measure
  "8005": {
    propertyName: "pricePerUnit",
    title: "PRICE PER UNIT",
    parser: parseVariableLength,
  },
  // Identification of the Components of a Trade Item (GCTIN)
  "8006": {
    propertyName: "itip",
    title: "GCTIN",
    parser: parseVariableLength,
  },
  // International Bank Account Number (IBAN)
  "8007": {
    propertyName: "iban",
    title: "IBAN",
    parser: parseVariableLength,
  },
  // Date and Time of Production
  "8008": {
    propertyName: "prodTime",
    title: "PROD TIME",
    parser: parseVariableLength,
  },
  // OPTSEN
  "8009": {
    propertyName: "opticalSensor",
    title: "OPTSEN",
    parser: parseVariableLength,
  },
  // Component / Part Identifier (CPID)
  "8010": {
    propertyName: "cpid",
    title: "CPID",
    parser: parseVariableLength,
  },
  // Component / Part Identifier Serial Number (CPID SERIAL)
  "8011": {
    propertyName: "cpidSerial",
    title: "CPID SERIAL",
    parser: parseVariableLength,
  },
  // VERSION
  "8012": {
    propertyName: "version",
    title: "VERSION",
    parser: parseVariableLength,
  },
  // GMN
  "8013": {
    propertyName: "gmn",
    title: "GMN",
    parser: parseVariableLength,
  },
  // Healthcare item reference identifier
  "8014": {
    propertyName: "hidri",
    title: "HIDRI",
    parser: parseVariableLength,
  },
  // Global Service Relation Number - Provider
  "8017": {
    propertyName: "gsrnProvider",
    title: "GSRN - PROVIDER",
    parser: parseVariableLength,
  },
  // Global Service Relation Number - Recipient
  "8018": {
    propertyName: "gsrnRecipient",
    title: "GSRN - RECIPIENT",
    parser: parseVariableLength,
  },
  // Service Relation Instance Number (SRIN)
  "8019": {
    propertyName: "srin",
    title: "SRIN",
    parser: parseVariableLength,
  },
  // Payment Slip Reference Number
  "8020": {
    propertyName: "refNo",
    title: "REF No",
    parser: parseVariableLength,
  },
  // Identification of pieces of a trade item (ITIP) contained in a logistic unit
  "8026": {
    propertyName: "itipContent",
    title: "ITIP CONTENT",
    parser: parseVariableLength,
  },
  // Digital Signature (DigSig)
  "8030": {
    propertyName: "digSig",
    title: "DIGSIG",
    parser: parseVariableLength,
  },
  // Coupon Code Identification for Use in North America
  "8110": {
    propertyName: "coupon",
    title: "-",
    parser: parseVariableLength,
  },
  // Loyalty points of a coupon
  "8111": {
    propertyName: "points",
    title: "POINTS",
    parser: parseVariableLength,
  },
  // Positive offer file coupon code identification for use in North America
  "8112": {
    propertyName: "couponExtended",
    title: "-",
    parser: parseVariableLength,
  },
  // Extended Packaging URL
  "8200": {
    propertyName: "productURL",
    title: "PRODUCT URL",
    parser: parseVariableLength,
  },
  // Information Mutually Agreed Between Trading Partners
  "90": {
    propertyName: "internal1",
    title: "INTERNAL",
    parser: parseVariableLength,
  },
  // Company Internal Information
  "91": {
    propertyName: "internal2",
    title: "INTERNAL",
    parser: parseVariableLength,
  },
  // Company Internal Information
  "92": {
    propertyName: "internal3",
    title: "INTERNAL",
    parser: parseVariableLength,
  },
  // Company Internal Information
  "93": {
    propertyName: "internal4",
    title: "INTERNAL",
    parser: parseVariableLength,
  },
  // Company Internal Information
  "94": {
    propertyName: "internal5",
    title: "INTERNAL",
    parser: parseVariableLength,
  },
  // Company Internal Information
  "95": {
    propertyName: "internal6",
    title: "INTERNAL",
    parser: parseVariableLength,
  },
  // Company Internal Information
  "96": {
    propertyName: "internal7",
    title: "INTERNAL",
    parser: parseVariableLength,
  },
  // Company Internal Information
  "97": {
    propertyName: "internal8",
    title: "INTERNAL",
    parser: parseVariableLength,
  },
  // Company Internal Information
  "98": {
    propertyName: "internal9",
    title: "INTERNAL",
    parser: parseVariableLength,
  },
  // Company Internal Information
  "99": {
    propertyName: "internal10",
    title: "INTERNAL",
    parser: parseVariableLength,
  },
};
