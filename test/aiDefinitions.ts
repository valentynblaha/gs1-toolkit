import { describe, it, expect } from "vitest";
import { AIDefinitions } from "../src/aiDefinitions";

// Returns map: first2Digits -> expected AI length
function getAiLengthMap(): Record<string, number> {
  return {
    "00": 2,
    "01": 2,
    "02": 2,
    "03": 2,
    "10": 2,
    "11": 2,
    "12": 2,
    "13": 2,
    "15": 2,
    "16": 2,
    "17": 2,
    "20": 2,
    "21": 2,
    "22": 2,
    "23": 3,
    "24": 3,
    "25": 3,
    "30": 2,
    "31": 4,
    "32": 4,
    "33": 4,
    "34": 4,
    "35": 4,
    "36": 4,
    "37": 2,
    "39": 4,
    "40": 3,
    "41": 3,
    "42": 3,
    "43": 4,
    "70": 4,
    "71": 3,
    "72": 4,
    "80": 4,
    "81": 4,
    "82": 4,
    "90": 2,
    "91": 2,
    "92": 2,
    "93": 2,
    "94": 2,
    "95": 2,
    "96": 2,
    "97": 2,
    "98": 2,
    "99": 2,
  };
}

// Returns set of prefixes (first 2 digits) that have fixed data length
function buildFixedLengthPrefixSet(): Set<string> {
  const fixedAisLength = {
    "00": 20,
    "01": 16,
    "02": 16,
    "03": 16,
    "04": 18,
    "11": 8,
    "12": 8,
    "13": 8,
    "14": 8,
    "15": 8,
    "16": 8,
    "17": 8,
    "18": 8,
    "19": 8,
    "20": 4,
    "31": 10,
    "32": 10,
    "33": 10,
    "34": 10,
    "35": 10,
    "36": 10,
    "41": 16,
  };

  return new Set(Object.keys(fixedAisLength));
}

describe("AIDefinitions", () => {
  const aiLengthMap = getAiLengthMap();
  const fixedLengthPrefixSet = buildFixedLengthPrefixSet();

  describe("1) No AI should start with another AI", () => {
    it("no AI in the map is a prefix of another AI", () => {
      const ais = Object.keys(AIDefinitions);
      const violations: string[] = [];

      for (const shorter of ais) {
        for (const longer of ais) {
          if (shorter !== longer && shorter.length < longer.length) {
            if (longer.startsWith(shorter)) {
              violations.push(`"${shorter}" is a prefix of "${longer}"`);
            }
          }
        }
      }

      expect(
        violations,
        violations.length ? `Prefix violations:\n${violations.join("\n")}` : "",
      ).toHaveLength(0);
    });
  });

  describe("2) Each AI length matches gs1_fixed_ais.csv", () => {
    it("every AI has the expected length from gs1_fixed_ais.csv", () => {
      const violations: string[] = [];

      for (const [ai, def] of Object.entries(AIDefinitions)) {
        const first2 = ai.slice(0, 2);
        const expectedLen = aiLengthMap[first2];

        if (expectedLen === undefined) {
          violations.push(`AI "${ai}": no entry in gs1_fixed_ais.csv for first 2 digits "${first2}"`);
          continue;
        }

        let expectedKeyLen: number;
        if (def.dpp || def.serial) {
          // Consolidated AI: key + 1 digit = full AI, so key length = expectedLen - 1
          expectedKeyLen = expectedLen - 1;
        } else {
          expectedKeyLen = expectedLen;
        }

        if (ai.length !== expectedKeyLen) {
          violations.push(
            `AI "${ai}": expected length ${expectedKeyLen} (from gs1_fixed_ais: ${expectedLen}${
              def.dpp || def.serial ? " - 1 for dpp/serial" : ""
            }), got ${ai.length}`,
          );
        }
      }

      expect(
        violations,
        violations.length ? `Length violations:\n${violations.join("\n")}` : "",
      ).toHaveLength(0);
    });
  });

  describe("3) AIs with fixed-length prefix must have fixedLength property", () => {
    it("every AI whose first 2 digits are in fixed_ais_length.csv has fixedLength", () => {
      const violations: string[] = [];

      for (const [ai, def] of Object.entries(AIDefinitions)) {
        const first2 = ai.slice(0, 2);
        if (fixedLengthPrefixSet.has(first2)) {
          if (def.fixedLength === undefined) {
            violations.push(
              `AI "${ai}" begins with fixed-length prefix "${first2}" but has no fixedLength property`,
            );
          }
        }
      }

      expect(
        violations,
        violations.length ? `Missing fixedLength:\n${violations.join("\n")}` : "",
      ).toHaveLength(0);
    });
  });
});
