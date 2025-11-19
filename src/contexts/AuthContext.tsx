import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface Profile {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  location?: {
    address: string;
    lat: number;
    lng: number;
  };
  hourlyRate?: number;
  yearsExperience?: number;
  availability?: string;
  profileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, roles?: string[]) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Extract user info from token
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          console.log('Token expired, clearing session');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoading(false);
          return;
        }

        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        setUser({
          id: tokenPayload.userId,
          email: userData.email || '',
          roles: userData.roles || ['worker']
        });

        // Try to get profile, but don't logout if it fails
        try {
          const profileData = await api.getMyProfile();
          setProfile(profileData);
        } catch (profileError: any) {
          // Only log if it's not a 401 (which means token is invalid)
          if (profileError.message?.includes('401') || profileError.message?.includes('Unauthorized')) {
            console.log('Session expired, please login again');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setProfile(null);
          } else {
            console.log('Profile not found, creating basic profile');
            // Create a basic profile if none exists
            setProfile({
              userId: tokenPayload.userId,
              fullName: userData.email || 'User',
              profileComplete: false
            });
          }
        }
      } catch (tokenError) {
        console.log('Invalid token format, clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Fetch profile after login
    const profileData = await api.getMyProfile();
    setProfile(profileData);
  };

  const register = async (email: string, password: string, fullName: string, roles: string[] = ['worker']) => {
    const response = await api.register(email, password, fullName, roles);
    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Fetch profile after registration
    const profileData = await api.getMyProfile();
    setProfile(profileData);
  };

  const logout = () => {
    api.logout();
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const updatedProfile = await api.updateProfile(data);
    setProfile(updatedProfile);
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await api.getMyProfile();
      setProfile(profileData);
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};