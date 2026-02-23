import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, Users, Box, ShoppingCart, DollarSign, LogOut } from "lucide-react";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { signOut } = useAuth();

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-indigo-700 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold">Mini ERP</div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link to="/" className="flex items-center p-2 hover:bg-indigo-600 rounded">
                        <LayoutDashboard className="mr-2" /> Dashboard
                    </Link>
                    <Link to="/clients" className="flex items-center p-2 hover:bg-indigo-600 rounded">
                        <Users className="mr-2" /> Clientes
                    </Link>
                    <Link to="/products" className="flex items-center p-2 hover:bg-indigo-600 rounded">
                        <Box className="mr-2" /> Produtos
                    </Link>
                    <Link to="/orders" className="flex items-center p-2 hover:bg-indigo-600 rounded">
                        <ShoppingCart className="mr-2" /> Pedidos
                    </Link>
                    <Link to="/receivables" className="flex items-center p-2 hover:bg-indigo-600 rounded">
                        <DollarSign className="mr-2" /> Financeiro
                    </Link>
                </nav>
                <button
                    onClick={signOut}
                    className="flex items-center p-4 hover:bg-indigo-600 text-left"
                >
                    <LogOut className="mr-2" /> Sair
                </button>
            </aside>
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    );
};
