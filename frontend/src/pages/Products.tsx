import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";

export const Products: React.FC = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ name: "", price: 0, stock: 0 });

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        const response = await api.get("/products");
        setProducts(response.data);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await api.post("/products", formData);
        setFormData({ name: "", price: 0, stock: 0 });
        loadProducts();
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-8">Produtos</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8 grid grid-cols-3 gap-4">
                <input
                    placeholder="Nome do Produto"
                    className="p-2 border rounded"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <input
                    placeholder="Preço"
                    type="number"
                    step="0.01"
                    className="p-2 border rounded"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                />
                <input
                    placeholder="Estoque"
                    type="number"
                    className="p-2 border rounded"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    required
                />
                <button className="bg-indigo-600 text-white p-2 rounded col-span-3">Cadastrar Produto</button>
            </form>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Preço</th>
                            <th className="p-4">Estoque</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p: any) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-4">{p.name}</td>
                                <td className="p-4">R$ {Number(p.price).toFixed(2)}</td>
                                <td className="p-4">{p.stock}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};
