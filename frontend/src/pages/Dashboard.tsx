import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { Users, Box, ShoppingCart } from "lucide-react";

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({ clients: 0, products: 0, orders: 0 });

    useEffect(() => {
        async function loadStats() {
            try {
                const [c, p, o] = await Promise.all([
                    api.get("/clients"),
                    api.get("/products"),
                    api.get("/orders")
                ]);
                setStats({
                    clients: c.data.length,
                    products: p.data.length,
                    orders: o.data.length
                });
            } catch (err) {
                console.error(err);
            }
        }
        loadStats();
    }, []);

    return (
        <Layout>
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Dashboard Gestão</h1>
                <p className="mt-2 text-slate-500">Acompanhe os principais indicadores do seu negócio em tempo real.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats Cards */}
                <div className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 bg-indigo-50 rounded-bl-3xl group-hover:bg-indigo-600 transition-colors duration-300">
                        <Users size={24} className="text-indigo-600 group-hover:text-white" />
                    </div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total de Clientes</div>
                    <div className="text-4xl font-black text-slate-900">{stats.clients}</div>
                    <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                        <span>Base de dados ativa</span>
                    </div>
                </div>

                <div className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 bg-emerald-50 rounded-bl-3xl group-hover:bg-emerald-600 transition-colors duration-300">
                        <Box size={24} className="text-emerald-600 group-hover:text-white" />
                    </div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Itens em Estoque</div>
                    <div className="text-4xl font-black text-slate-900">{stats.products}</div>
                    <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
                        <span>Produtos cadastrados</span>
                    </div>
                </div>

                <div className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 bg-amber-50 rounded-bl-3xl group-hover:bg-amber-600 transition-colors duration-300">
                        <ShoppingCart size={24} className="text-amber-600 group-hover:text-white" />
                    </div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Vendas Realizadas</div>
                    <div className="text-4xl font-black text-slate-900">{stats.orders}</div>
                    <div className="mt-4 flex items-center text-sm text-amber-600 font-medium">
                        <span>Histórico de pedidos</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Info Section */}
            <div className="mt-12 p-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl text-white shadow-lg shadow-indigo-500/20">
                <div className="max-w-2xl">
                    <h3 className="text-2xl font-bold mb-4">Novo Pedido?</h3>
                    <p className="text-indigo-100 mb-8 leading-relaxed">Prepare uma nova venda rapidamente. O sistema irá gerenciar automaticamente o estoque e as contas a receber para você.</p>
                    <button className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-bold shadow-md hover:bg-slate-50 transition-colors duration-200">
                        Criar Novo Pedido
                    </button>
                </div>
            </div>
        </Layout>
    );
};
