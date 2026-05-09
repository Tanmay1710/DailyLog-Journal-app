/**
 * Authentication Service
 * Handles user authentication (sign up, login, logout, session management)
 */

import {
  createUserWithEmailAndPassword,
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

/**
 * Sign up with email and password
 * Creates Firebase Auth user and Firestore user profile
 */
export const signUp = async (email: string, password: string): Promise<User> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Create user profile in Firestore
    const userProfile: Omit<User, 'id'> = {
      email: firebaseUser.email || email,
      name: '',
      timezone: 'UTC',
      reminderTime: '09:00',
      reminderEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

    return {
      id: firebaseUser.uid,
      ...userProfile,
    };
  } catch (error: unknown) {
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
      throw new AuthError('user-profile-not-found', 'User profile not found');
    }

    const userData = userDocSnap.data();
    return {
      id: firebaseUser.uid,
      email: userData.email,
      name: userData.name,
      timezone: userData.timezone,
      reminderTime: userData.reminderTime,
      reminderEnabled: userData.reminderEnabled,
      profilePicture: userData.profilePicture,
      createdAt: userData.createdAt?.toDate?.() || new Date(),
      updatedAt: userData.updatedAt?.toDate?.() || new Date(),
    } as User;
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
          const userData = userDocSnap.data();
          const user: User = {
            id: firebaseUser.uid,
            email: userData.email,
            name: userData.name,
            timezone: userData.timezone,
            reminderTime: userData.reminderTime,
            reminderEnabled: userData.reminderEnabled,
            profilePicture: userData.profilePicture,
            createdAt: userData.createdAt?.toDate?.() || new Date(),
            updatedAt: userData.updatedAt?.toDate?.() || new Date(),
          };
          callback(user);
        } else {
          // User exists in Auth but not in Firestore (shouldn't happen)
          console.warn('User profile not found in Firestore');
          callback(null);
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
