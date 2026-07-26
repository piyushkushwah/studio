
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase App and services.
 * Uses explicit config and ensures singleton initialization.
 */
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let firebaseAuth: Auth | null = null;

export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
} {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    if (!app) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      db = getFirestore(app);
      firebaseAuth = getAuth(app);
    }

    return { 
      firebaseApp: app, 
      firestore: db, 
      auth: firebaseAuth 
    };
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
    return { firebaseApp: null, firestore: null, auth: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
