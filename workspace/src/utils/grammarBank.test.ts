import { describe, expect, it } from "vitest";
import { buildQuestionId, parseQuestionsText } from "@/utils/grammarBank";

describe("grammarBank", () => {
  it("builds deterministic ids", () => {
    const id1 = buildQuestionId({
      category: "Tenses",
      subcategory: "Past Simple",
      question: "We _____ (play) soccer at the park yesterday.",
      options: ["play", "played", "playing", "plays"],
      correctAnswer: "played",
      explanation: "ok",
    });
    const id2 = buildQuestionId({
      category: " tenses ",
      subcategory: "past   simple",
      question: "We _____ (play) soccer at the park yesterday.",
      options: ["play", "played", "playing", "plays"],
      correctAnswer: "played",
      explanation: "ok",
    });
    expect(id1).toEqual(id2);
  });

  it("parses an array JSON file", () => {
    const r = parseQuestionsText(
      "a.json",
      JSON.stringify([
        {
          category: "Tenses",
          subcategory: "Past Simple",
          question: "We _____ (play) soccer at the park yesterday.",
          options: ["play", "played", "playing", "plays"],
          correctAnswer: "played",
          explanation: "For regular verbs in the Past Simple, we add '-ed'.",
        },
      ])
    );
    expect(r.parsed.length).toBe(1);
    expect(r.issues.length).toBe(0);
  });

  it("parses NDJSON fallback", () => {
    const r = parseQuestionsText(
      "a.ndjson",
      [
        JSON.stringify({
          category: "Tenses",
          subcategory: "Past Simple",
          question: "We _____ (play) soccer at the park yesterday.",
          options: ["play", "played", "playing", "plays"],
          correctAnswer: "played",
          explanation: "ok",
        }),
        JSON.stringify({
          category: "Tenses",
          subcategory: "Past Simple",
          question: "They _____ (walk) home.",
          options: ["walk", "walked"],
          correctAnswer: "walked",
          explanation: "ok",
        }),
      ].join("\n")
    );
    expect(r.parsed.length).toBe(2);
    expect(r.issues.length).toBe(0);
  });

  it("reports invalid items", () => {
    const r = parseQuestionsText("bad.json", JSON.stringify([{ a: 1 }]));
    expect(r.parsed.length).toBe(0);
    expect(r.issues.length).toBe(1);
    expect(r.issues[0].message).toContain("category");
    expect(r.issues[0].rawPreview).toContain('"a":1');
  });

  it("reports invalid JSON files", () => {
    const r = parseQuestionsText("broken.json", "{not-json");
    expect(r.parsed.length).toBe(0);
    expect(r.issues.length).toBe(1);
    expect(r.issues[0].itemIndex).toBe(-1);
    expect(r.issues[0].message).toContain("File is not valid JSON");
  });
});
