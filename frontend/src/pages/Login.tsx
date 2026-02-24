import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Box } from "lucide-react";

export const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { signIn } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await signIn({ email, password });
            navigate("/");
        } catch (error) {
            alert("Erro ao fazer login. Verifique suas credenciais.");
        }
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white font-sans overflow-hidden">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex flex-col justify-center px-16 bg-gradient-to-br from-indigo-600 to-indigo-900 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 border border-white/20">
                        <Box size={32} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white mb-6 leading-tight">
                        Gestão simplificada,<br />
                        <span className="text-indigo-300">resultados reais.</span>
                    </h1>
                    <p className="text-xl text-indigo-100 max-w-md leading-relaxed">
                        Controle seus clientes, estoque e financeiro em um só lugar com o MiniERP Pro.
                    </p>
                </div>

                <div className="absolute bottom-12 left-16 flex items-center space-x-2 text-indigo-300/60 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span>Versão Profissional 1.0</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center px-10 py-20 bg-slate-50 lg:bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Acesse sua conta</h2>
                        <p className="text-slate-500 font-medium">Bem-vindo de volta ao seu painel administrativo.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Seu email</label>
                            <input
                                type="email"
                                placeholder="exemplo@empresa.com"
                                className="w-full p-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all duration-200 outline-none text-slate-900 font-medium"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-700">Sua senha</label>
                                <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Esqueceu a senha?</a>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all duration-200 outline-none text-slate-900 font-medium"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all duration-200 active:scale-[0.98]"
                            >
                                Entrar no sistema
                            </button>
                        </div>
                    </form>

                    <p className="mt-12 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
                        powered by <span className="text-slate-900 font-black">MINIERP PRO</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
