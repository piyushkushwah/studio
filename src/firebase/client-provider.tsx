'use client';

import { ReactNode, useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

/**
 * A client-side wrapper that initializes Firebase and provides it to the app.
 * This component ensures Firebase is only initialized on the client.
 */
export function FirebaseClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Memoize the initialization so it only happens once on the client
  const { firebaseApp, firestore, auth } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
