import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";

export const Clients: React.FC = () => {
    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({ name: "", cpf_cnpj: "", email: "", phone: "" });

    useEffect(() => {
        loadClients();
    }, []);

    async function loadClients() {
        const response = await api.get("/clients");
        setClients(response.data);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await api.post("/clients", formData);
        setFormData({ name: "", cpf_cnpj: "", email: "", phone: "" });
        loadClients();
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-8">Clientes</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8 grid grid-cols-2 gap-4">
                <input
                    placeholder="Nome"
                    className="p-2 border rounded"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <input
                    placeholder="CPF/CNPJ"
                    className="p-2 border rounded"
                    value={formData.cpf_cnpj}
                    onChange={e => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                    required
                />
                <input
                    placeholder="Email"
                    className="p-2 border rounded"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <input
                    placeholder="Telefone"
                    className="p-2 border rounded"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required
                />
                <button className="bg-indigo-600 text-white p-2 rounded col-span-2">Cadastrar Cliente</button>
            </form>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">CPF/CNPJ</th>
                            <th className="p-4">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((c: any) => (
                            <tr key={c.id} className="border-t">
                                <td className="p-4">{c.name}</td>
                                <td className="p-4">{c.cpf_cnpj}</td>
                                <td className="p-4">{c.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};
