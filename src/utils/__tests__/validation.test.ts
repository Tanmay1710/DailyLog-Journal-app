import { validateHexColor, validateJournalTitle } from '@utils/validation';

describe('journal validation', () => {
  describe('validateJournalTitle', () => {
    it('rejects empty title', () => {
      expect(validateJournalTitle('')).toEqual({ valid: false, error: 'Journal title is required' });
    });

    it('rejects too-short title', () => {
      expect(validateJournalTitle('A')).toEqual({
        valid: false,
        error: 'Journal title must be at least 2 characters long',
      });
    });

    it('accepts valid title', () => {
      expect(validateJournalTitle('Daily Reflections')).toEqual({ valid: true });
    });
  });

  describe('validateHexColor', () => {
    it('rejects invalid color', () => {
      expect(validateHexColor('blue')).toEqual({
        valid: false,
        error: 'Color must be a valid hex code (e.g., #FF5733)',
      });
    });

    it('accepts valid 6-digit hex color', () => {
      expect(validateHexColor('#FF5733')).toEqual({ valid: true });
    });

    it('accepts valid 3-digit hex color', () => {
      expect(validateHexColor('#ABC')).toEqual({ valid: true });
    });
  });
});
