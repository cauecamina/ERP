import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";

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
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <div className="text-gray-500 text-sm uppercase">Clientes</div>
                    <div className="text-3xl font-bold">{stats.clients}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                    <div className="text-gray-500 text-sm uppercase">Produtos</div>
                    <div className="text-3xl font-bold">{stats.products}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
                    <div className="text-gray-500 text-sm uppercase">Pedidos</div>
                    <div className="text-3xl font-bold">{stats.orders}</div>
                </div>
            </div>
        </Layout>
    );
};
