import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from "../api/client";
import { useTranslation } from 'react-i18next';

export type AccountType = "standard" | "professional" | "pharmacist" | "admin" | "commercial";

export interface UserDTO {
  id: number;
  email: string | null;
  phone: string | null;
  type: AccountType;
  name: string;
}

interface AuthContextType {
  user: UserDTO | null;
  isLoading: boolean;
  login: (phone: string, type?: AccountType, pin?: string) => Promise<boolean>;
  register: (phone: string, pin: string, type: AccountType) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: Partial<UserDTO>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const saved = await AsyncStorage.getItem("takymed_user");
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (
    phone: string,
    type?: AccountType,
    pin?: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { phone, type, pin });
      const userData: UserDTO = response.data;
      setUser(userData);
      await AsyncStorage.setItem("takymed_user", JSON.stringify(userData));
      return true;
    } catch (error: any) {
      console.error(error);
      // In RN we'd use Alert or a Toast library
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    phone: string,
    pin: string,
    type: AccountType,
  ): Promise<boolean> => {
    try {
      await apiClient.post("/auth/register", { phone, pin, type });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("takymed_user");
  };

  const updateUser = async (updatedUser: Partial<UserDTO>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      await AsyncStorage.setItem("takymed_user", JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
