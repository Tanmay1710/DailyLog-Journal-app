import { create } from 'zustand';
import type { Entry, Journal } from '@app-types';

interface JournalState {
  journals: Journal[];
  entries: Entry[];
  isLoading: boolean;
  setJournals: (journals: Journal[]) => void;
  setEntries: (entries: Entry[]) => void;
  addJournal: (journal: Journal) => void;
  updateJournal: (journal: Journal) => void;
  deleteJournal: (journalId: string) => void;
  addEntry: (entry: Entry) => void;
  updateEntry: (entry: Entry) => void;
  deleteEntry: (entryId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  journals: [],
  entries: [],
  isLoading: false,
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
}));
