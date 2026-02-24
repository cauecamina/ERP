import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { ShoppingBag, Plus, Trash2, CheckCircle2, User, Calendar, ArrowUpRight, X } from "lucide-react";

export const Orders: React.FC = () => {
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);

    const [selectedClient, setSelectedClient] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [items, setItems] = useState<{ product_id: string, name: string, quantity: number }[]>([]);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

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

    async function handleStatusUpdate(orderId: string, newStatus: string) {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            // Update local state
            setOrders((prev: any) => prev.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o));
            setSelectedOrderDetails((prev: any) => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar status do pedido.");
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
                                <div key={o.id} className={`p-8 rounded-[32px] shadow-sm border-2 transition-all duration-300 group text-left hover:shadow-xl ${o.status === 'pending' ? 'bg-amber-50 border-amber-200 hover:shadow-amber-500/10' :
                                    o.status === 'paid' ? 'bg-emerald-50 border-emerald-200 hover:shadow-emerald-500/10' :
                                        o.status === 'shipped' ? 'bg-indigo-50 border-indigo-200 hover:shadow-indigo-500/10' :
                                            o.status === 'delivered' ? 'bg-blue-50 border-blue-200 hover:shadow-blue-500/10' :
                                                'bg-white border-slate-200 hover:shadow-slate-500/10'
                                    }`}>
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded leading-none uppercase tracking-widest">#{o.id.substring(0, 6)}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString()}</span>
                                            </div>

                                            <div className="flex items-start space-x-3 mb-6">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 shadow-sm border-2 ${o.status === 'pending' ? 'bg-white text-amber-600 border-amber-200 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600' :
                                                        o.status === 'paid' ? 'bg-white text-emerald-600 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600' :
                                                            o.status === 'shipped' ? 'bg-white text-indigo-600 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600' :
                                                                o.status === 'delivered' ? 'bg-white text-blue-600 border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600' :
                                                                    'bg-white text-slate-500 border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
                                                    }`}>
                                                    {o.client?.avatar ? (
                                                        <img src={`${api.defaults.baseURL}/files/${o.client.avatar}`} alt={o.client.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={22} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-lg text-slate-900 leading-tight mb-1">{o.client?.name}</div>
                                                    <div className={`text-[10px] font-black uppercase tracking-widest italic ${o.status === 'pending' ? 'text-amber-600' :
                                                        o.status === 'paid' ? 'text-emerald-600' :
                                                            o.status === 'shipped' ? 'text-indigo-600' :
                                                                o.status === 'delivered' ? 'text-blue-600' :
                                                                    'text-slate-500'
                                                        }`}>
                                                        {o.status === 'pending' ? 'Pendente' :
                                                            o.status === 'paid' ? 'Pago' :
                                                                o.status === 'shipped' ? 'Em Rota' :
                                                                    o.status === 'delivered' ? 'Entregue' :
                                                                        o.status === 'canceled' ? 'Cancelado' : o.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total</div>
                                                <div className="text-2xl font-black text-slate-900 tracking-tighter">R$ {Number(o.total_value).toFixed(2)}</div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedOrderDetails(o)}
                                                className={`p-3 rounded-xl transition-all shadow-sm border ${o.status === 'pending' ? 'bg-white text-amber-600 border-amber-200 hover:bg-amber-600 hover:text-white hover:border-amber-600' :
                                                        o.status === 'paid' ? 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600' :
                                                            o.status === 'shipped' ? 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600' :
                                                                o.status === 'delivered' ? 'bg-white text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600' :
                                                                    'bg-white text-slate-400 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900'
                                                    }`}
                                            >
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

            {/* Order Details Modal */}
            {selectedOrderDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedOrderDetails(null)}></div>
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <div className="flex items-center space-x-3 mb-1">
                                    <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded uppercase tracking-widest">PEDIDO #{selectedOrderDetails.id.substring(0, 8)}</span>
                                    <span className="text-xs text-slate-400 font-bold">{new Date(selectedOrderDetails.created_at).toLocaleDateString()}</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Detalhes da Venda</h2>
                            </div>
                            <button onClick={() => setSelectedOrderDetails(null)} className="p-2 hover:bg-white rounded-full text-slate-400 border border-slate-100 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center space-x-4 mb-8 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm overflow-hidden">
                                    {selectedOrderDetails.client?.avatar ? (
                                        <img src={`${api.defaults.baseURL}/files/${selectedOrderDetails.client.avatar}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={28} />
                                    )}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Cliente</div>
                                    <div className="text-xl font-black text-slate-900">{selectedOrderDetails.client?.name}</div>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Itens do Pedido</label>
                                {selectedOrderDetails.items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                                                {item.product?.image ? (
                                                    <img src={`${api.defaults.baseURL}/files/${item.product.image}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ShoppingBag size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{item.product?.name}</div>
                                                <div className="text-xs text-slate-400 font-medium">{item.quantity} x R$ {Number(item.unit_price).toFixed(2)}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-slate-900 tracking-tight">R$ {(item.quantity * Number(item.unit_price)).toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status do Pedido</div>
                                    <div className="relative inline-block w-48">
                                        <select
                                            value={selectedOrderDetails.status}
                                            onChange={(e) => handleStatusUpdate(selectedOrderDetails.id, e.target.value)}
                                            className={`w-full px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic outline-none border transition-all appearance-none cursor-pointer ${selectedOrderDetails.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300' :
                                                selectedOrderDetails.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300' :
                                                    selectedOrderDetails.status === 'shipped' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300' :
                                                        selectedOrderDetails.status === 'delivered' ? 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300' :
                                                            'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-300'
                                                }`}
                                        >
                                            <option value="pending">Pendente</option>
                                            <option value="paid">Pago (Financeiro)</option>
                                            <option value="shipped">Em Rota (Enviado)</option>
                                            <option value="delivered">Entregue / Finalizado</option>
                                            <option value="canceled">Cancelado</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                            <div className="border-t-2 border-r-2 border-current w-1.5 h-1.5 rotate-[135deg]"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Total</div>
                                    <div className="text-4xl font-black text-indigo-600 tracking-tighter">R$ {Number(selectedOrderDetails.total_value).toFixed(2)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-50">
                            <button
                                onClick={() => setSelectedOrderDetails(null)}
                                className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold tracking-wide hover:bg-black transition-all duration-200"
                            >
                                FECHAR DETALHES
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
