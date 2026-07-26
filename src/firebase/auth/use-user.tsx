'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

/**
 * Hook to access the current authenticated user.
 * Returns the user object and a loading state.
 */
export function useUser() {
  const auth = useAuth();
  
  // Extremely defensive initialization for SSR and missing config cases
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is not available, we can't listen for state changes
    if (!auth) {
      setLoading(false);
      return;
    }

    // Set initial user if auth is already populated
    setUser(auth.currentUser);

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  return { user, loading };
}
