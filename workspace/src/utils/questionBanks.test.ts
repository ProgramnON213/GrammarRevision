import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { parseQuestionsText } from "./grammarBank";

describe("Question Banks Schema Validation", () => {
  const dataDir = path.resolve(__dirname, "../data");
  const exerciseDir = path.resolve(__dirname, "../../../exercise");

  const getJsonFiles = (dir: string) => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => ({
        fileName: file,
        filePath: path.join(dir, file),
      }));
  };

  const allFiles = [
    ...getJsonFiles(dataDir),
    ...getJsonFiles(exerciseDir),
  ];

  it("should have at least one question bank to validate", () => {
    expect(allFiles.length).toBeGreaterThan(0);
  });

  allFiles.forEach(({ fileName, filePath }) => {
    it(`validates schema for ${fileName}`, () => {
      const content = fs.readFileSync(filePath, "utf-8");
      const result = parseQuestionsText(fileName, content);
      
      if (result.issues.length > 0) {
        const issuesSummary = result.issues
          .map((issue) => `[Item ${issue.itemIndex}]: ${issue.message}`)
          .join("\n");
        throw new Error(`Validation failed for ${fileName}:\n${issuesSummary}`);
      }

      expect(result.parsed.length).toBeGreaterThan(0);
      expect(result.issues.length).toBe(0);
    });
  });
});
