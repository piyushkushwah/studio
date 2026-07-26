'use client';

import { ReactNode, useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

/**
 * A client-side wrapper that initializes Firebase and provides it to the app.
 * Handles cases where initialization might return null due to missing configuration.
 */
export function FirebaseClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const services = useMemo(() => initializeFirebase(), []);

  // If services are not available, we still want to render the children 
  // but Firebase hooks will return null or error states correctly via context.
  return (
    <FirebaseProvider 
      firebaseApp={services.firebaseApp as any} 
      firestore={services.firestore as any} 
      auth={services.auth as any}
    >
      {children}
    </FirebaseProvider>
  );
}
