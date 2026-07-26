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
  
  // Initialize state safely. auth might be null if Firebase failed to initialize.
  const [user, setUser] = useState<User | null>(auth?.currentUser || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is not available, we can't listen for state changes
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  return { user, loading };
}
