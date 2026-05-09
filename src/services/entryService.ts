/**
 * Entry Service
 * Handles CRUD operations for journal entries
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@config/firebaseConfig';
import type { Entry } from '@app-types';

export const entryService = {
  async createEntry(entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entry> {
    try {
      const docRef = await addDoc(collection(db, 'entries'), {
        ...entry,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return {
        id: docRef.id,
        ...entry,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('[entryService.createEntry] Error:', error);
      throw error;
    }
  },

  async getEntries(journalId: string): Promise<Entry[]> {
    try {
      const q = query(
        collection(db, 'entries'),
        where('journalId', '==', journalId),
        orderBy('entryDate', 'desc'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as Entry[];
    } catch (error) {
      console.error('[entryService.getEntries] Error:', error);
      throw error;
    }
  },

  async getEntriesByDate(journalId: string, date: string): Promise<Entry[]> {
    try {
      const q = query(
        collection(db, 'entries'),
        where('journalId', '==', journalId),
        where('entryDate', '==', date),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as Entry[];
    } catch (error) {
      console.error('[entryService.getEntriesByDate] Error:', error);
      throw error;
    }
  },

  async getEntry(entryId: string): Promise<Entry> {
    try {
      const docRef = doc(db, 'entries', entryId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Entry not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Entry;
    } catch (error) {
      console.error('[entryService.getEntry] Error:', error);
      throw error;
    }
  },

  async updateEntry(entryId: string, updates: Partial<Entry>): Promise<Entry> {
    try {
      const docRef = doc(db, 'entries', entryId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(docRef, updateData);

      // Return updated entry
      return await this.getEntry(entryId);
    } catch (error) {
      console.error('[entryService.updateEntry] Error:', error);
      throw error;
    }
  },

  async deleteEntry(entryId: string): Promise<void> {
    try {
      const docRef = doc(db, 'entries', entryId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('[entryService.deleteEntry] Error:', error);
      throw error;
    }
  },
};
