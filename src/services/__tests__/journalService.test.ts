import { journalService } from '@services/journalService';

const mockAddDoc = jest.fn();
const mockCollection = jest.fn();
const mockDeleteDoc = jest.fn();
const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockOrderBy = jest.fn();
const mockQuery = jest.fn();
const mockUpdateDoc = jest.fn();
const mockWhere = jest.fn();

jest.mock('firebase/firestore', () => ({
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  where: (...args: unknown[]) => mockWhere(...args),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date('2026-05-09T00:00:00.000Z') })),
  },
}));

jest.mock('@config/firebaseConfig', () => ({
  db: { app: 'mock-db' },
}));

describe('journalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates journal successfully', async () => {
    mockCollection.mockReturnValue('journals-collection');
    mockAddDoc.mockResolvedValue({ id: 'journal-1' });

    const result = await journalService.createJournal({
      userId: 'user-1',
      title: 'My Journal',
      description: 'test',
      color: '#FF5733',
      fieldSchema: [],
      isArchived: false,
    });

    expect(mockAddDoc).toHaveBeenCalled();
    expect(result.id).toBe('journal-1');
    expect(result.title).toBe('My Journal');
  });

  it('gets non-archived journals for a user', async () => {
    const createdAt = { toDate: () => new Date('2026-05-09T00:00:00.000Z') };
    const updatedAt = { toDate: () => new Date('2026-05-09T01:00:00.000Z') };

    const docs = [
      {
        id: 'journal-1',
        data: () => ({
          userId: 'user-1',
          title: 'One',
          color: '#FFFFFF',
          fieldSchema: [],
          isArchived: false,
          createdAt,
          updatedAt,
        }),
      },
    ];

    mockGetDocs.mockResolvedValue({ docs });
    mockQuery.mockReturnValue('journals-query');

    const result = await journalService.getJournals('user-1');

    expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user-1');
    expect(mockWhere).toHaveBeenCalledWith('isArchived', '==', false);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('journal-1');
  });

  it('archives journal by updating isArchived=true', async () => {
    mockDoc.mockReturnValue('journal-doc');
    mockUpdateDoc.mockResolvedValue(undefined);
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'journal-1',
      data: () => ({
        userId: 'user-1',
        title: 'One',
        color: '#FFFFFF',
        fieldSchema: [],
        isArchived: true,
        createdAt: { toDate: () => new Date('2026-05-09T00:00:00.000Z') },
        updatedAt: { toDate: () => new Date('2026-05-09T01:00:00.000Z') },
      }),
    });

    await journalService.archiveJournal('journal-1');

    expect(mockUpdateDoc).toHaveBeenCalled();
    const payload = mockUpdateDoc.mock.calls[0][1] as { isArchived?: boolean };
    expect(payload.isArchived).toBe(true);
  });
});
