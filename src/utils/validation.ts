/**
 * Email Validation
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    return { valid: false, error: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
};

/**
 * Password Validation
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character (optional but recommended)
 */
export const validatePassword = (
  password: string
): { valid: boolean; strength: 'weak' | 'medium' | 'strong'; error?: string } => {
  if (!password) {
    return { valid: false, strength: 'weak', error: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      valid: false,
      strength: 'weak',
      error: 'Password must be at least 8 characters long',
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUpperCase) {
    return { valid: false, strength: 'weak', error: 'Password must contain at least one uppercase letter' };
  }

  if (!hasLowerCase) {
    return { valid: false, strength: 'weak', error: 'Password must contain at least one lowercase letter' };
  }

  if (!hasNumber) {
    return { valid: false, strength: 'weak', error: 'Password must contain at least one number' };
  }

  let strength: 'weak' | 'medium' | 'strong';
  if (hasSpecialChar && password.length >= 12) {
    strength = 'strong';
  } else if (hasSpecialChar || password.length >= 12) {
    strength = 'medium';
  } else {
    strength = 'medium';
  }

  return { valid: true, strength };
};

/**
 * Name Validation
 */
export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name.trim()) {
    return { valid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }

  if (name.trim().length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' };
  }

  // Allow letters, spaces, and basic punctuation (apostrophes, hyphens)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { valid: true };
};

/**
 * Timezone Validation
 * Valid IANA timezone strings
 */
const VALID_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Bangkok',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'America/Toronto',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Africa/Johannesburg',
  'Middle_East/Dubai',
];

export const validateTimezone = (timezone: string): { valid: boolean; error?: string } => {
  if (!timezone.trim()) {
    return { valid: false, error: 'Timezone is required' };
  }

  if (VALID_TIMEZONES.includes(timezone)) {
    return { valid: true };
  }

  return { valid: false, error: `Invalid timezone: ${timezone}` };
};

/**
 * Time Validation (24h format)
 */
export const validateTime = (time: string): { valid: boolean; error?: string } => {
  if (!time.trim()) {
    return { valid: false, error: 'Time is required' };
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { valid: false, error: 'Please use HH:MM format (e.g., 09:00)' };
  }

  return { valid: true };
};

/**
 * Confirm Password Validation
 */
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } => {
  if (!confirmPassword.trim()) {
    return { valid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }

  return { valid: true };
};

/**
 * Journal Title Validation
 */
export const validateJournalTitle = (title: string): { valid: boolean; error?: string } => {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return { valid: false, error: 'Journal title is required' };
  }

  if (trimmedTitle.length < 2) {
    return { valid: false, error: 'Journal title must be at least 2 characters long' };
  }

  if (trimmedTitle.length > 60) {
    return { valid: false, error: 'Journal title must be less than 60 characters' };
  }

  return { valid: true };
};

/**
 * Hex Color Validation
 */
export const validateHexColor = (color: string): { valid: boolean; error?: string } => {
  const trimmedColor = color.trim();
  if (!trimmedColor) {
    return { valid: false, error: 'Journal color is required' };
  }

  const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
  if (!hexColorRegex.test(trimmedColor)) {
    return { valid: false, error: 'Color must be a valid hex code (e.g., #FF5733)' };
  }

  return { valid: true };
};
