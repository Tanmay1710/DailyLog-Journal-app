/**
 * Authentication Service
 * Handles user authentication (sign up, login, logout, session management)
 */

import {
  createUserWithEmailAndPassword,
  deleteUser,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@config/firebaseConfig';
import type { User } from '@app-types';
import { AuthError } from '@utils/errorHandler';

const buildDefaultUserProfile = (firebaseUser: FirebaseUser, emailFallback?: string): Omit<User, 'id'> => ({
  email: firebaseUser.email || emailFallback || '',
  name: '',
  timezone: 'UTC',
  reminderTime: '09:00',
  reminderEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mapUserFromDoc = (userId: string, userData: Record<string, unknown>): User => ({
  id: userId,
  email: (userData.email as string) || '',
  name: (userData.name as string) || '',
  timezone: (userData.timezone as string) || 'UTC',
  reminderTime: (userData.reminderTime as string) || '09:00',
  reminderEnabled: (userData.reminderEnabled as boolean) ?? true,
  profilePicture: userData.profilePicture as string | undefined,
  createdAt: (userData.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
  updatedAt: (userData.updatedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
});

/**
 * Sign up with email and password
 * Creates Firebase Auth user and Firestore user profile
 */
export const signUp = async (email: string, password: string): Promise<User> => {
  let firebaseUser: FirebaseUser | null = null;

  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    firebaseUser = userCredential.user;

    // Create user profile in Firestore
    const userProfile: Omit<User, 'id'> = buildDefaultUserProfile(firebaseUser, email);

    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

    return {
      id: firebaseUser.uid,
      ...userProfile,
    };
  } catch (error: unknown) {
    // Prevent partial/orphan signups if Auth user creation succeeded but Firestore profile failed.
    if (firebaseUser) {
      try {
        await deleteUser(firebaseUser);
      } catch {
        // Best effort cleanup only.
      }
    }

    const firebaseError = error as FirebaseError;
    throw new AuthError(firebaseError.code, firebaseError.message);
  }
};

/**
 * Login with email and password
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch user profile from Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      const defaultProfile = buildDefaultUserProfile(firebaseUser, email);
      await setDoc(userDocRef, defaultProfile);
      return {
        id: firebaseUser.uid,
        ...defaultProfile,
      };
    }

    return mapUserFromDoc(firebaseUser.uid, userDocSnap.data() as Record<string, unknown>);
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    throw new AuthError(firebaseError.code, firebaseError.message);
  }
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    throw new AuthError(firebaseError.code, firebaseError.message);
  }
};

/**
 * Get current Firebase user (unauthenticated user object from Auth)
 * Use setupAuthStateListener for real-time auth state updates
 */
export const getCurrentFirebaseUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Set up Firebase auth state listener
 * Calls callback whenever auth state changes
 * Returns unsubscribe function
 */
export const setupAuthStateListener = (
  callback: (user: User | null) => void | Promise<void>
): (() => void) => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          callback(mapUserFromDoc(firebaseUser.uid, userDocSnap.data() as Record<string, unknown>));
        } else {
          const defaultProfile = buildDefaultUserProfile(firebaseUser);
          await setDoc(userDocRef, defaultProfile);
          callback({
            id: firebaseUser.uid,
            ...defaultProfile,
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};

/**
 * Create or update user profile in Firestore
 */
export const createUserProfile = async (
  userId: string,
  name: string,
  timezone: string,
  reminderTime: string,
  reminderEnabled: boolean = true
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      name,
      timezone,
      reminderTime,
      reminderEnabled,
      updatedAt: Timestamp.now(),
    });
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    throw new AuthError(firebaseError.code, firebaseError.message);
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const updateData: Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>> & { updatedAt: Timestamp } = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(userDocRef, updateData);
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    throw new AuthError(firebaseError.code, firebaseError.message);
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return {
        id: userId,
        email: userData.email,
        name: userData.name,
        timezone: userData.timezone,
        reminderTime: userData.reminderTime,
        reminderEnabled: userData.reminderEnabled,
        profilePicture: userData.profilePicture,
        createdAt: userData.createdAt?.toDate?.() || new Date(),
        updatedAt: userData.updatedAt?.toDate?.() || new Date(),
      } as User;
    }

    return null;
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    throw new AuthError(firebaseError.code, firebaseError.message);
  }
};

export const authService = {
  signUp,
  login,
  logout,
  getCurrentFirebaseUser,
  setupAuthStateListener,
  createUserProfile,
  updateUserProfile,
  getUserProfile,
};
