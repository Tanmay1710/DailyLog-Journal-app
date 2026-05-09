/**
 * Firebase Error Handler
 * Converts Firebase error codes to user-friendly messages
 */

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Get user-friendly error message from Firebase error code
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMap: Record<string, string> = {
    'auth/email-already-in-use':
      'This email is already registered. Please log in or use a different email.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please try again later.',
    'auth/weak-password': 'Password is too weak. Use at least 8 characters with uppercase, lowercase, and numbers.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests':
      'Too many failed login attempts. Please try again later or reset your password.',
    'auth/account-exists-with-different-credential':
      'An account already exists with a different sign-in method.',
    'auth/invalid-credential': 'Invalid login credentials. Please try again.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/internal-error': 'An internal error occurred. Please try again later.',
    // Firestore errors
    'permission-denied': 'You do not have permission to perform this action.',
    'unavailable': 'Service is temporarily unavailable. Please try again later.',
    'deadline-exceeded': 'Request took too long. Please try again.',
  };

  return errorMap[errorCode] || `An error occurred: ${errorCode}. Please try again.`;
};

/**
 * Extract Firebase error code from error object
 */
export const extractErrorCode = (error: unknown): string => {
  if (error instanceof Error && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return 'unknown-error';
};

/**
 * Handle auth error and return user-friendly message
 */
export const handleAuthError = (error: unknown): string => {
  const errorCode = extractErrorCode(error);
  return getAuthErrorMessage(errorCode);
};
