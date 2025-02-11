// app/_components/AuthProvider.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchUserClient } from '@/lib/auth-client'; // Importa desde auth-client
import { UserPayload } from '@/types/user';


interface AuthContextProps {
  user: UserPayload | null;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter()


  const fetchUser = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedUser = await fetchUserClient(); // Usa fetchUserClient
      setUser(fetchedUser);
      if (pathname === '/login' && fetchedUser != null) {
        router.push('/')
      }

    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, pathname]);

  const refetchUser = async () => {
    await fetchUser();
  };

  const contextValue: AuthContextProps = {
    user,
    isLoading,
    refetchUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};