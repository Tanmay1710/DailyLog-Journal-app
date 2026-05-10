import { create } from 'zustand';
import type { Entry, Journal } from '@app-types';

interface DraftState {
  entryDate: string;
  fieldValues: Record<string, string>;
}

interface JournalState {
  journals: Journal[];
  entries: Entry[];
  isLoading: boolean;
  drafts: Record<string, DraftState>;
  setJournals: (journals: Journal[]) => void;
  setEntries: (entries: Entry[]) => void;
  addJournal: (journal: Journal) => void;
  updateJournal: (journal: Journal) => void;
  deleteJournal: (journalId: string) => void;
  addEntry: (entry: Entry) => void;
  updateEntry: (entry: Entry) => void;
  deleteEntry: (entryId: string) => void;
  setLoading: (loading: boolean) => void;
  setDraft: (journalId: string, draft: DraftState) => void;
  getDraft: (journalId: string) => DraftState | undefined;
  clearDraft: (journalId: string) => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  journals: [],
  entries: [],
  isLoading: false,
  drafts: {},
  setJournals: (journals) => set({ journals }),
  setEntries: (entries) => set({ entries }),
  addJournal: (journal) =>
    set((state) => ({ journals: [...state.journals, journal] })),
  updateJournal: (journal) =>
    set((state) => ({
      journals: state.journals.map((j) => (j.id === journal.id ? journal : j)),
    })),
  deleteJournal: (journalId) =>
    set((state) => ({
      journals: state.journals.filter((j) => j.id !== journalId),
    })),
  addEntry: (entry) =>
    set((state) => ({ entries: [...state.entries, entry] })),
  updateEntry: (entry) =>
    set((state) => ({
      entries: state.entries.map((e) => (e.id === entry.id ? entry : e)),
    })),
  deleteEntry: (entryId) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== entryId),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setDraft: (journalId, draft) =>
    set((state) => ({
      drafts: { ...state.drafts, [journalId]: draft },
    })),
  getDraft: (journalId) => get().drafts[journalId],
  clearDraft: (journalId) =>
    set((state) => {
      const { [journalId]: _, ...remainingDrafts } = state.drafts;
      return { drafts: remainingDrafts };
    }),
}));
