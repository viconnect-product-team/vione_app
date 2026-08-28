import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';


type AuthContextType = {
  user: User | null;
  status: 'loading' | 'in' | 'out';
  session: Session | null;
  logout: () => Promise<void>;
  setAuthData: (session: Session) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'in' | 'out'>('loading');

  useEffect(() => {
    // Helper to set cookie
    const setCookie = (sess: Session | null) => {
      if (sess) {
        const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; secure' : '';
        document.cookie = `sb-access-token=${sess.access_token}; path=/; max-age=${sess.expires_in}; SameSite=Lax${secure}`;
        document.cookie = `sb-refresh-token=${sess.refresh_token || ''}; path=/; max-age=${sess.expires_in}; SameSite=Lax${secure}`;
      } else {
        document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    };

    const checkLocalToken = (): boolean => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vibe_token') : null;
      if (token) {
        const decoded = decodeJwt(token);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          const userObj = {
            id: decoded.sub,
            email: decoded.username,
            user_metadata: {
              full_name: decoded.name || '',
              avatar_url: decoded.avatar_url || '',
            }
          } as any;
          setUser(userObj);
          const mockSession = {
            access_token: token,
            refresh_token: localStorage.getItem('vibe_refresh_token') || '',
            expires_in: 3600,
            token_type: 'bearer',
            user: userObj
          } as any;
          setSession(mockSession);
          setStatus('in');
          setCookie(mockSession);
          
          // Sync session to Supabase Client for storage RLS permission checks
          void supabase.auth.setSession({
            access_token: token,
            refresh_token: mockSession.refresh_token,
          });

          return true;
        }
      }
      return false;
    };

    const hasLocal = checkLocalToken();
    if (!hasLocal) {
      setStatus('out');
    }
  }, []);

  const logout = async () => {
    localStorage.removeItem('vibe_token');
    localStorage.removeItem('vibe_refresh_token');
    document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    setUser(null);
    setSession(null);
    setStatus('out');
    // Clear session on Supabase Client
    void supabase.auth.signOut();
  };

  const setAuthData = (newSession: any) => {
    if (newSession.user && newSession.user.id) {
      // Custom backend session
      const mappedUser = {
        id: newSession.user.id,
        email: newSession.user.email || newSession.user.username,
        user_metadata: {
          full_name: newSession.user.name || '',
          avatar_url: newSession.user.avatar_url || '',
        },
      } as any;
      
      localStorage.setItem('vibe_token', newSession.access_token);
      if (newSession.refresh_token) {
        localStorage.setItem('vibe_refresh_token', newSession.refresh_token);
      }
      
      setUser(mappedUser);
      const mockSession = {
        access_token: newSession.access_token,
        refresh_token: newSession.refresh_token || '',
        expires_in: 3600,
        token_type: 'bearer',
        user: mappedUser
      } as any;
      setSession(mockSession);

      // Sync session to Supabase Client for storage RLS permission checks
      void supabase.auth.setSession({
        access_token: newSession.access_token,
        refresh_token: mockSession.refresh_token,
      });
    } else {
      // Supabase session
      setSession(newSession);
      setUser(newSession.user);
    }
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
