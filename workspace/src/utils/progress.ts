import type { ProgressSnapshotV1, QuestionId } from "@/types/grammar";

const STORAGE_KEY = "grammar-progress-v1";

export function createEmptyProgress(): ProgressSnapshotV1 {
  return { version: 1, answered: {}, missed: {} };
}

export function loadProgress(): ProgressSnapshotV1 {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyProgress();
  try {
    const parsed = JSON.parse(raw) as ProgressSnapshotV1;
    if (parsed?.version !== 1) return createEmptyProgress();
    if (!parsed.answered || !parsed.missed) return createEmptyProgress();
    return parsed;
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(p: ProgressSnapshotV1) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function recordAttempt(p: ProgressSnapshotV1, id: QuestionId, correct: boolean, nowIso: string) {
  const prev = p.answered[id] ?? { attempts: 0, correct: 0, lastAnsweredAt: nowIso };
  p.answered[id] = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
    lastAnsweredAt: nowIso,
  };
  if (!correct) {
    const mPrev = p.missed[id] ?? { count: 0, lastMissedAt: nowIso };
    p.missed[id] = { count: mPrev.count + 1, lastMissedAt: nowIso };
  }
}

export function clearProgressStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

