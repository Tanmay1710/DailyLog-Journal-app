// User types
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  timezone: string;
  reminderTime: string; // 24h format: "09:00"
  reminderEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Journal custom field types
export type FieldType = 'text' | 'date' | 'rating' | 'multiChoice';

export interface JournalFieldDefinition {
  id: string; // UUID
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // for multiChoice only
}

// Journal types
export interface Journal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  color: string; // hex color: #FF5733
  /** Emoji icon displayed on journal cards (e.g., "🌿", "💪") */
  emoji?: string;
  /** Whether the journal is pinned to the top of the list */
  pinned?: boolean;
  fieldSchema: JournalFieldDefinition[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

// Entry types
export interface Entry {
  id: string;
  journalId: string;
  userId: string;
  entryDate: string; // YYYY-MM-DD
  fieldValues: Record<string, unknown>; // fieldId -> value
  createdAt: Date;
  updatedAt: Date;
}

// Template types (Phase 2)
export interface JournalTemplate {
  id: string;
  title: string;
  description: string;
  fieldSchema: JournalFieldDefinition[];
  category: string; // "Gratitude", "Health", "Work", etc.
  createdAt: Date;
}
