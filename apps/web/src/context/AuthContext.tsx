import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  status: 'loading' | 'in' | 'out';
  session: Session | null;
  logout: () => Promise<void>;
  setAuthData: (session: Session) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'in' | 'out'>('loading');

  useEffect(() => {
    // Helper to set cookie
    const setCookie = (session: Session | null) => {
      if (session) {
        const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; secure' : '';
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax${secure}`;
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${session.expires_in}; SameSite=Lax${secure}`;
      } else {
        document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setStatus(session ? 'in' : 'out');
      setCookie(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setStatus(session ? 'in' : 'out');
      setCookie(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const setAuthData = (newSession: Session) => {
    setSession(newSession);
    setUser(newSession.user);
    setStatus('in');
  };

  return (
    <AuthContext.Provider value={{ user, status, session, logout, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
