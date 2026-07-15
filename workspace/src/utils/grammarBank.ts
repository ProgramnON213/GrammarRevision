import type { ParseIssue, ParsedQuestion, Question } from "@/types/grammar";

const bundledQuestionModules = import.meta.glob(
  ["../data/**/*.json", "../../../exercise/**/*.json"],
  {
    eager: true,
    import: "default",
  }
) as Record<string, unknown>;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function normalizeText(s: string) {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

function safePreview(value: unknown) {
  try {
    const text = JSON.stringify(value);
    if (!text) return String(value);
    return text.length > 240 ? `${text.slice(0, 240)}...` : text;
  } catch {
    return String(value);
  }
}

function fnv1aBase36(input: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function buildQuestionId(q: Question) {
  const key = `${normalizeText(q.category)}|${normalizeText(q.subcategory)}|${normalizeText(q.question)}`;
  return `q_${fnv1aBase36(key)}`;
}

function getQuestionValidationError(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return "Item is not an object.";
  const v = raw as Record<string, unknown>;
  if (!isNonEmptyString(v.category)) return 'Missing or invalid "category".';
  if (!isNonEmptyString(v.subcategory)) return 'Missing or invalid "subcategory".';
  if (!isNonEmptyString(v.question)) return 'Missing or invalid "question".';
  if (!isNonEmptyString(v.explanation)) return 'Missing or invalid "explanation".';
  if (!Array.isArray(v.options)) return 'Missing or invalid "options" array.';
  const opts = v.options;
  if (opts.length < 2) return '"options" must contain at least 2 choices.';
  if (!opts.every(isNonEmptyString)) return 'Every value in "options" must be a non-empty string.';
  if (!isNonEmptyString(v.correctAnswer)) return 'Missing or invalid "correctAnswer".';
  if (!opts.includes(v.correctAnswer)) return '"correctAnswer" must match one of the "options".';
  return null;
}

function parseJsonUnknown(text: string): unknown {
  return JSON.parse(text);
}

function parseNdjson(text: string): unknown[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  return lines.map((l) => JSON.parse(l));
}

export function parseQuestionsText(fileName: string, text: string) {
  const issues: ParseIssue[] = [];
  let payload: unknown;

  try {
    payload = parseJsonUnknown(text);
  } catch (error) {
    try {
      payload = parseNdjson(text);
    } catch {
      const message = error instanceof Error ? error.message : "Unknown JSON parse error.";
      return {
        parsed: [] as ParsedQuestion[],
        issues: [{ fileName, itemIndex: -1, message: `File is not valid JSON. ${message}`.trim() }],
      };
    }
  }

  return parseQuestionsValue(fileName, payload, issues);
}

export function parseQuestionsValue(fileName: string, payload: unknown, initialIssues: ParseIssue[] = []) {
  const issues: ParseIssue[] = [...initialIssues];
  const items: unknown[] = Array.isArray(payload) ? payload : [payload];
  const parsed: ParsedQuestion[] = [];

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const validationError = getQuestionValidationError(item);
    if (validationError) {
      issues.push({
        fileName,
        itemIndex: i,
        message: validationError,
        rawPreview: safePreview(item),
      });
      continue;
    }
    const question = item as Question;
    parsed.push({ id: buildQuestionId(question), question });
  }

  return { parsed, issues };
}

export async function parseQuestionsFiles(files: File[]) {
  const texts = await Promise.all(files.map(async (f) => ({ file: f, text: await f.text() })));
  const combinedIssues: ParseIssue[] = [];
  const combinedParsed: ParsedQuestion[] = [];

  for (const t of texts) {
    const r = parseQuestionsText(t.file.name, t.text);
    combinedIssues.push(...r.issues);
    combinedParsed.push(...r.parsed);
  }

  const byId = new Map<string, ParsedQuestion>();
  for (const pq of combinedParsed) {
    if (!byId.has(pq.id)) byId.set(pq.id, pq);
  }

  return { parsed: [...byId.values()], issues: combinedIssues };
}

export function parseBundledQuestionBank() {
  const combinedIssues: ParseIssue[] = [];
  const combinedParsed: ParsedQuestion[] = [];

  for (const [path, payload] of Object.entries(bundledQuestionModules)) {
    const fileName = path.split("/").pop() ?? path;
    const result = parseQuestionsValue(fileName, payload);
    combinedIssues.push(...result.issues);
    combinedParsed.push(...result.parsed);
  }

  const byId = new Map<string, ParsedQuestion>();
  for (const item of combinedParsed) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }

  return { parsed: [...byId.values()], issues: combinedIssues };
}

export function groupByCategory(items: ParsedQuestion[]) {
  const map = new Map<string, Map<string, ParsedQuestion[]>>();
  for (const it of items) {
    const cat = it.question.category;
    const sub = it.question.subcategory;
    const catMap = map.get(cat) ?? new Map<string, ParsedQuestion[]>();
    const subArr = catMap.get(sub) ?? [];
    subArr.push(it);
    catMap.set(sub, subArr);
    map.set(cat, catMap);
  }
  return map;
}
