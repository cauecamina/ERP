import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { ShoppingBag, Plus, Trash2, CheckCircle2, User, Calendar, ArrowUpRight } from "lucide-react";

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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 text-left">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pedidos de Venda</h1>
                    <p className="text-slate-500 mt-1">Crie novos pedidos e acompanhe o histórico.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* New Order Section */}
                <div className="xl:col-span-12 xxl:col-span-5">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <ShoppingBag size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Novo Pedido</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">Cliente</label>
                                <select
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none"
                                    value={selectedClient}
                                    onChange={e => setSelectedClient(e.target.value)}
                                >
                                    <option value="">Selecionar Cliente...</option>
                                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-left">Adicionar Itens</label>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <select
                                        className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium outline-none appearance-none"
                                        value={selectedProduct}
                                        onChange={e => setSelectedProduct(e.target.value)}
                                    >
                                        <option value="">Buscar produto...</option>
                                        {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} - R$ {Number(p.price).toFixed(2)}</option>)}
                                    </select>
                                    <div className="flex gap-4">
                                        <input
                                            type="number"
                                            placeholder="Qtd"
                                            className="w-24 p-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium outline-none text-center"
                                            value={quantity}
                                            onChange={e => setQuantity(Number(e.target.value))}
                                        />
                                        <button
                                            onClick={addItem}
                                            className="px-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/10"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {items.length > 0 && (
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">Itens Selecionados</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-left">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{item.name}</span>
                                                    <span className="text-xs text-indigo-600 font-bold">{item.quantity} unidade(s)</span>
                                                </div>
                                                <button
                                                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleOrder}
                                disabled={!selectedClient || items.length === 0}
                                className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold italic tracking-wide disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black transition-all duration-200 shadow-xl"
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <CheckCircle2 size={20} />
                                    <span>FINALIZAR PEDIDO AGORA</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Orders List Section */}
                <div className="xl:col-span-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <Calendar size={20} className="mr-2 text-indigo-600" /> Histórico Recente
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.length === 0 ? (
                            <div className="col-span-full bg-white p-20 rounded-3xl shadow-sm border border-slate-100 text-center text-slate-400 italic font-medium">
                                <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
                                Nenhum pedido realizado até o momento.
                            </div>
                        ) : (
                            orders.map((o: any) => (
                                <div key={o.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group text-left">
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded leading-none uppercase tracking-widest">#{o.id.substring(0, 6)}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString()}</span>
                                            </div>

                                            <div className="flex items-start space-x-3 mb-6">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                                    {o.client?.avatar ? (
                                                        <img src={`${api.defaults.baseURL}/files/${o.client.avatar}`} alt={o.client.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-lg text-slate-900 leading-tight mb-1">{o.client?.name}</div>
                                                    <div className="text-emerald-600 text-[10px] font-black uppercase tracking-widest italic">{o.status}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total</div>
                                                <div className="text-2xl font-black text-slate-900 tracking-tighter">R$ {Number(o.total_value).toFixed(2)}</div>
                                            </div>
                                            <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                                <ArrowUpRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
