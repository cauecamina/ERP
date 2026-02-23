import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";

export const Receivables: React.FC = () => {
    const [receivables, setReceivables] = useState([]);

    useEffect(() => {
        loadReceivables();
    }, []);

    async function loadReceivables() {
        const response = await api.get("/receivables");
        setReceivables(response.data);
    }

    async function handlePay(id: string) {
        await api.patch(`/receivables/${id}/pay`);
        loadReceivables();
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-8">Contas a Receber</h1>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Valor</th>
                            <th className="p-4">Vencimento</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receivables.map((r: any) => (
                            <tr key={r.id} className="border-t">
                                <td className="p-4">{r.order?.client?.name}</td>
                                <td className="p-4">R$ {Number(r.amount).toFixed(2)}</td>
                                <td className="p-4">{new Date(r.due_date).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-sm ${r.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {r.status === 'paid' ? 'Pago' : 'Pendente'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {r.status === 'open' && (
                                        <button
                                            onClick={() => handlePay(r.id)}
                                            className="text-indigo-600 hover:underline"
                                        >
                                            Marcar como Pago
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};
