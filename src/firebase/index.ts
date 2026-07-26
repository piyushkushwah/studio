'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase App and services.
 * Includes a check for a valid API key to prevent hard crashes during local development
 * or when environment variables are not yet populated.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
} {
  // Prevent initialization if the API key is missing
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === '') {
    console.warn('Firebase API Key is missing. Please check your .env file.');
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, firestore, auth };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return { firebaseApp: null, firestore: null, auth: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
