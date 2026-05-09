/**
 * Journal Service
 * Handles CRUD operations for journals
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
import type { Journal } from '@app-types';

export const journalService = {
  async createJournal(journal: Omit<Journal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Journal> {
    try {
      const docRef = await addDoc(collection(db, 'journals'), {
        ...journal,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return {
        id: docRef.id,
        ...journal,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('[journalService.createJournal] Error:', error);
      throw error;
    }
  },

  async getJournals(userId: string): Promise<Journal[]> {
    try {
      const q = query(
        collection(db, 'journals'),
        where('userId', '==', userId),
        where('isArchived', '==', false),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as Journal[];
    } catch (error) {
      console.error('[journalService.getJournals] Error:', error);
      throw error;
    }
  },

  async getJournal(journalId: string): Promise<Journal> {
    try {
      const docRef = doc(db, 'journals', journalId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Journal not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Journal;
    } catch (error) {
      console.error('[journalService.getJournal] Error:', error);
      throw error;
    }
  },

  async updateJournal(journalId: string, updates: Partial<Journal>): Promise<Journal> {
    try {
      const docRef = doc(db, 'journals', journalId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(docRef, updateData);

      // Return updated journal
      return await this.getJournal(journalId);
    } catch (error) {
      console.error('[journalService.updateJournal] Error:', error);
      throw error;
    }
  },

  async deleteJournal(journalId: string): Promise<void> {
    try {
      const docRef = doc(db, 'journals', journalId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('[journalService.deleteJournal] Error:', error);
      throw error;
    }
  },

  async archiveJournal(journalId: string): Promise<void> {
    try {
      await this.updateJournal(journalId, { isArchived: true });
    } catch (error) {
      console.error('[journalService.archiveJournal] Error:', error);
      throw error;
    }
  },
};
