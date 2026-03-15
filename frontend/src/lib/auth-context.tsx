'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authAPI } from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    wellness_level: number;
    wellness_points: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, role: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('smile_token');
        const savedUser = localStorage.getItem('smile_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const refreshUser = useCallback(async () => {
        if (!token) return;
        try {
            const res = await authAPI.getMe(token);
            setUser(res);
            localStorage.setItem('smile_user', JSON.stringify(res));
        } catch (e) {
            console.error("Failed to refresh user", e);
        }
    }, [token]);

    const login = async (email: string, password: string) => {
        const res = await authAPI.login({ email, password });
        setToken(res.access_token);
        setUser(res.user);
        localStorage.setItem('smile_token', res.access_token);
        localStorage.setItem('smile_user', JSON.stringify(res.user));
    };

    const signup = async (name: string, email: string, password: string, role: string) => {
        const res = await authAPI.signup({ name, email, password, role });
        setToken(res.access_token);
        setUser(res.user);
        localStorage.setItem('smile_token', res.access_token);
        localStorage.setItem('smile_user', JSON.stringify(res.user));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('smile_token');
        localStorage.removeItem('smile_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
