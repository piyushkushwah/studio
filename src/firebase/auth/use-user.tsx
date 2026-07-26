
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
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Set initial loading state to true as we wait for onAuthStateChanged
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    }, (error) => {
      console.error("Auth state observer error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  return { user, loading };
}
