import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, Users, Box, ShoppingCart, DollarSign, LogOut } from "lucide-react";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { signOut } = useAuth();

    return (
        <div className="flex h-screen bg-indigo-50/40 font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
                <div className="p-8 flex items-center space-x-3 bg-indigo-600/10">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Box size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Caue<span className="text-indigo-400">ERP</span></span>
                </div>

                <nav className="flex-1 px-6 py-6 space-y-1 overflow-y-auto">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4 px-3">Principal</p>
                    <Link to="/" className="flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group hover:bg-slate-800">
                        <LayoutDashboard size={20} className="text-slate-400 group-hover:text-indigo-400" />
                        <span className="font-medium text-slate-300 group-hover:text-white">Dashboard</span>
                    </Link>

                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-8 mb-4 px-3">Gestão</p>
                    <Link to="/clients" className="flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group hover:bg-slate-800">
                        <Users size={20} className="text-slate-400 group-hover:text-indigo-400" />
                        <span className="font-medium text-slate-300 group-hover:text-white">Clientes</span>
                    </Link>
                    <Link to="/products" className="flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group hover:bg-slate-800">
                        <Box size={20} className="text-slate-400 group-hover:text-indigo-400" />
                        <span className="font-medium text-slate-300 group-hover:text-white">Produtos</span>
                    </Link>
                    <Link to="/orders" className="flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group hover:bg-slate-800">
                        <ShoppingCart size={20} className="text-slate-400 group-hover:text-indigo-400" />
                        <span className="font-medium text-slate-300 group-hover:text-white">Pedidos</span>
                    </Link>

                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-8 mb-4 px-3">Financeiro</p>
                    <Link to="/receivables" className="flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group hover:bg-slate-800">
                        <DollarSign size={20} className="text-slate-400 group-hover:text-indigo-400" />
                        <span className="font-medium text-slate-300 group-hover:text-white">Financeiro</span>
                    </Link>
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <button
                        onClick={signOut}
                        className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-400 transition-all duration-200 font-medium"
                    >
                        <LogOut size={18} />
                        <span>Sair do sistema</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 z-10">
                    <h2 className="text-slate-400 text-sm font-medium">Bem-vindo de volta, <span className="text-slate-900 font-bold">Administrador</span></h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-indigo-600">A</div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-10">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
