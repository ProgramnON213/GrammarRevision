import { create } from "zustand";
import type {
  ParseIssue,
  ParsedQuestion,
  PracticeConfig,
  PracticeSession,
  ProgressSnapshotV1,
  QuestionId,
} from "@/types/grammar";
import { parseBundledQuestionBank, parseQuestionsFiles } from "@/utils/grammarBank";
import { createEmptyProgress, loadProgress, recordAttempt, saveProgress } from "@/utils/progress";

type GrammarState = {
  bank: ParsedQuestion[];
  issues: ParseIssue[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  config: PracticeConfig;
  session: PracticeSession | null;
  progress: ProgressSnapshotV1;
  lastSessionMissed: QuestionId[];

  loadSample: () => void;
  loadFiles: (files: File[]) => Promise<void>;
  clearBank: () => void;

  setSelectedCategory: (category: string | null) => void;
  setSelectedSubcategory: (subcategory: string | null) => void;
  setConfig: (partial: Partial<PracticeConfig>) => void;

  startSession: () => void;
  answerCurrent: (chosen: string) => void;
  goNext: () => void;
  goPrev: () => void;
  endSession: () => void;

  clearProgress: () => void;
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nowIso() {
  return new Date().toISOString();
}

const bundledQuestionBank = parseBundledQuestionBank();
const SAMPLE_BANK: ParsedQuestion[] = bundledQuestionBank.parsed;
const BUNDLED_ISSUES: ParseIssue[] = bundledQuestionBank.issues;

function createDefaultConfig(): PracticeConfig {
  return {
    category: null,
    subcategory: null,
    questionCount: 10,
    mode: "all",
    revealExplanation: true,
  };
}

function pickQuestionIds(bank: ParsedQuestion[], cfg: PracticeConfig, progress: ProgressSnapshotV1) {
  let filtered = bank;
  if (cfg.category) filtered = filtered.filter((q) => q.question.category === cfg.category);
  if (cfg.subcategory) filtered = filtered.filter((q) => q.question.subcategory === cfg.subcategory);

  if (cfg.mode === "missed") {
    const missed = new Set(Object.keys(progress.missed));
    filtered = filtered.filter((q) => missed.has(q.id));
  }

  if (filtered.length === 0) return [];

  const ids = shuffle(filtered.map((q) => q.id));
  return ids.slice(0, Math.max(1, Math.min(cfg.questionCount, ids.length)));
}

export const useGrammarStore = create<GrammarState>((set, get) => ({
  bank: SAMPLE_BANK,
  issues: BUNDLED_ISSUES,
  selectedCategory: null,
  selectedSubcategory: null,
  config: createDefaultConfig(),
  session: null,
  progress: typeof window === "undefined" ? createEmptyProgress() : loadProgress(),
  lastSessionMissed: [],

  loadSample: () => {
    set({
      bank: SAMPLE_BANK,
      issues: BUNDLED_ISSUES,
      selectedCategory: null,
      selectedSubcategory: null,
      session: null,
      config: createDefaultConfig(),
    });
  },

  loadFiles: async (files: File[]) => {
    const r = await parseQuestionsFiles(files);
    if (r.issues.length > 0) {
      console.groupCollapsed(`[Grammar import] ${r.issues.length} invalid item(s) found`);
      for (const issue of r.issues) {
        const label = issue.itemIndex >= 0 ? `item ${issue.itemIndex}` : "file";
        console.warn(`${issue.fileName} · ${label} · ${issue.message}`);
        if (issue.rawPreview) {
          console.log("Broken object preview:", issue.rawPreview);
        }
      }
      console.groupEnd();
    }
    set((s) => ({
      bank: r.parsed.length > 0 ? r.parsed : s.bank,
      issues: r.issues,
      selectedCategory: null,
      selectedSubcategory: null,
      session: null,
      config: { ...s.config, category: null, subcategory: null },
    }));
  },

  clearBank: () => {
    set({ bank: [], issues: [], selectedCategory: null, selectedSubcategory: null, session: null });
  },

  setSelectedCategory: (category) => {
    set((s) => ({
      selectedCategory: category,
      selectedSubcategory: null,
      config: { ...s.config, category, subcategory: null },
    }));
  },

  setSelectedSubcategory: (subcategory) => {
    set((s) => ({
      selectedSubcategory: subcategory,
      config: { ...s.config, subcategory },
    }));
  },

  setConfig: (partial) => {
    set((s) => ({ config: { ...s.config, ...partial } }));
  },

  startSession: () => {
    const { bank, config, progress } = get();
    const questionIds = pickQuestionIds(bank, config, progress);
    if (questionIds.length === 0) {
      set({ session: null });
      return;
    }
    set({
      session: {
        config,
        questionIds,
        index: 0,
        answered: {},
        finishedAt: null,
      },
      lastSessionMissed: [],
    });
  },

  answerCurrent: (chosen) => {
    const { session, bank } = get();
    if (!session) return;
    const id = session.questionIds[session.index];
    const found = bank.find((q) => q.id === id);
    if (!found) return;
    if (session.answered[id]) return;

    const correct = chosen === found.question.correctAnswer;
    const at = nowIso();

    set((s) => {
      if (!s.session) return s;
      const nextProgress = { ...s.progress, answered: { ...s.progress.answered }, missed: { ...s.progress.missed } };
      recordAttempt(nextProgress, id, correct, at);
      saveProgress(nextProgress);

      const answered = { ...s.session.answered, [id]: { chosen, correct } };
      const lastSessionMissed = correct ? s.lastSessionMissed : [...s.lastSessionMissed, id];

      return { progress: nextProgress, session: { ...s.session, answered }, lastSessionMissed };
    });
  },

  goNext: () => {
    set((s) => {
      if (!s.session) return s;
      const nextIndex = Math.min(s.session.index + 1, s.session.questionIds.length - 1);
      return { session: { ...s.session, index: nextIndex } };
    });
  },

  goPrev: () => {
    set((s) => {
      if (!s.session) return s;
      const nextIndex = Math.max(0, s.session.index - 1);
      return { session: { ...s.session, index: nextIndex } };
    });
  },

  endSession: () => {
    set((s) => {
      if (!s.session) return s;
      return { session: { ...s.session, finishedAt: nowIso() } };
    });
  },

  clearProgress: () => {
    set(() => {
      const cleared = createEmptyProgress();
      saveProgress(cleared);
      return { progress: cleared, lastSessionMissed: [] };
    });
  },
}));
