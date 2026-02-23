import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";

export const Orders: React.FC = () => {
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);

    const [selectedClient, setSelectedClient] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [items, setItems] = useState<{ product_id: string, name: string, quantity: number }[]>([]);

    useEffect(() => {
        api.get("/orders").then(res => setOrders(res.data));
        api.get("/clients").then(res => setClients(res.data));
        api.get("/products").then(res => setProducts(res.data));
    }, []);

    function addItem() {
        const product = products.find((p: any) => p.id === selectedProduct) as any;
        if (product) {
            setItems([...items, { product_id: product.id, name: product.name, quantity }]);
        }
    }

    async function handleOrder() {
        try {
            await api.post("/orders", {
                client_id: selectedClient,
                items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
            });
            alert("Pedido criado com sucesso!");
            window.location.reload();
        } catch (err) {
            alert("Erro ao criar pedido. Verifique o estoque.");
        }
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-8">Pedidos</h1>

            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-xl font-bold mb-4">Novo Pedido</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <select
                        className="p-2 border rounded"
                        value={selectedClient}
                        onChange={e => setSelectedClient(e.target.value)}
                    >
                        <option value="">Selecionar Cliente</option>
                        {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="flex gap-4 mb-4">
                    <select
                        className="flex-1 p-2 border rounded"
                        value={selectedProduct}
                        onChange={e => setSelectedProduct(e.target.value)}
                    >
                        <option value="">Selecionar Produto</option>
                        {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input
                        type="number"
                        className="w-24 p-2 border rounded"
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                    />
                    <button onClick={addItem} className="bg-green-600 text-white px-4 rounded">Add</button>
                </div>

                <div className="mb-4">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between p-2 border-b">
                            <span>{item.name} x {item.quantity}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleOrder}
                    disabled={!selectedClient || items.length === 0}
                    className="w-full bg-indigo-600 text-white p-2 rounded disabled:opacity-50"
                >
                    Finalizar Pedido
                </button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o: any) => (
                            <tr key={o.id} className="border-t">
                                <td className="p-4">{o.client?.name}</td>
                                <td className="p-4">R$ {Number(o.total_value).toFixed(2)}</td>
                                <td className="p-4">{new Date(o.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};
