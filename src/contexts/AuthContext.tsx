import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface User {
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: async () => { },
    signOut: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session from localStorage
        const savedToken = localStorage.getItem('voicedots_token');
        const savedEmail = localStorage.getItem('voicedots_email');

        if (savedToken && savedEmail) {
            setToken(savedToken);
            setUser({ email: savedEmail });
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: 'Login failed' }));
            throw new Error(err.detail || 'Invalid credentials');
        }

        const data = await res.json();
        localStorage.setItem('voicedots_token', data.access_token);
        localStorage.setItem('voicedots_email', data.email);
        setToken(data.access_token);
        setUser({ email: data.email });
    };

    const signOut = () => {
        localStorage.removeItem('voicedots_token');
        localStorage.removeItem('voicedots_email');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
