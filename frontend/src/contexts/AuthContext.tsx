import React, { createContext, useState, useEffect, useContext } from "react";
import { api } from "../services/api";

interface AuthContextData {
    signed: boolean;
    user: object | null;
    signIn(credentials: object): Promise<void>;
    signOut(): void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<object | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storagedUser = localStorage.getItem("@CaueERP:user");
        const storagedToken = localStorage.getItem("@CaueERP:token");

        if (storagedUser && storagedToken) {
            setUser(JSON.parse(storagedUser));
        }
        setLoading(false);
    }, []);

    async function signIn(credentials: object) {
        const response = await api.post("/users/login", credentials);
        const { user, token } = response.data;

        setUser(user);
        localStorage.setItem("@CaueERP:user", JSON.stringify(user));
        localStorage.setItem("@CaueERP:token", token);
    }

    function signOut() {
        localStorage.removeItem("@CaueERP:token");
        localStorage.removeItem("@CaueERP:user");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}
