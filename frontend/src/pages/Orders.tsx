import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { ShoppingBag, Plus, Trash2, CheckCircle2, User, Calendar, ArrowUpRight, X, Filter } from "lucide-react";

function toLocalDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
const today = toLocalDate(new Date());
const yesterday = toLocalDate(new Date(new Date().setDate(new Date().getDate() - 1)));
const weekAgo = toLocalDate(new Date(new Date().setDate(new Date().getDate() - 6)));

export const Orders: React.FC = () => {
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);

    const [selectedClient, setSelectedClient] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [items, setItems] = useState<{ product_id: string, name: string, quantity: number }[]>([]);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

    // Date filter
    const [dateFrom, setDateFrom] = useState(today);
    const [dateTo, setDateTo] = useState(today);

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
            setOrders((prev: any) => prev.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o));
            setSelectedOrderDetails((prev: any) => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar status do pedido.");
        }
    }

    // Filter orders by date range
    const filteredOrders = [...orders]
        .filter((o: any) => {
            const d = toLocalDate(new Date(o.created_at));
            return d >= dateFrom && d <= dateTo;
        })
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
                    {/* Filter bar */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        {/* Quick-select buttons */}
                        <div className="flex items-center space-x-1">
                            <Filter size={14} className="text-slate-400 mr-1" />
                            <button
                                onClick={() => { setDateFrom(today); setDateTo(today); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${dateFrom === today && dateTo === today ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                            >
                                Hoje
                            </button>
                            <button
                                onClick={() => { setDateFrom(yesterday); setDateTo(yesterday); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${dateFrom === yesterday && dateTo === yesterday ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                            >
                                Ontem
                            </button>
                            <button
                                onClick={() => { setDateFrom(yesterday); setDateTo(today); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${dateFrom === yesterday && dateTo === today ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                            >
                                Ontem + Hoje
                            </button>
                            <button
                                onClick={() => { setDateFrom(weekAgo); setDateTo(today); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${dateFrom === weekAgo && dateTo === today ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                            >
                                Últimos 7 dias
                            </button>
                            <button
                                onClick={() => { setDateFrom("2000-01-01"); setDateTo(today); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${dateFrom === "2000-01-01" ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                            >
                                Todos
                            </button>
                        </div>

                        {/* Free date range */}
                        <div className="flex items-center space-x-2 ml-auto">
                            <span className="text-xs text-slate-400 font-medium">De</span>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 bg-white"
                            />
                            <span className="text-xs text-slate-400 font-medium">até</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 bg-white"
                            />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <Calendar size={20} className="mr-2 text-indigo-600" /> Pedidos
                        <span className="ml-3 text-sm font-medium text-slate-400">
                            {filteredOrders.length} de {orders.length} registros
                        </span>
                    </h2>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {filteredOrders.length === 0 ? (
                            <div className="p-16 text-center text-slate-400 italic font-medium">
                                <ShoppingBag size={40} className="mx-auto mb-3 opacity-10" />
                                Nenhum pedido encontrado para o período selecionado.
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50">
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((o: any, idx: number) => {

                                        const statusMap: Record<string, { label: string; cls: string }> = {
                                            pending: { label: "Pendente", cls: "bg-amber-50 text-amber-700 border-amber-200" },
                                            picking: { label: "Separando", cls: "bg-orange-50 text-orange-700 border-orange-200" },
                                            to_invoice: { label: "A Faturar", cls: "bg-purple-50 text-purple-700 border-purple-200" },
                                            invoiced: { label: "Faturado", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                                            delivery: { label: "Em Entrega", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
                                            delivered: { label: "Entregue", cls: "bg-blue-50 text-blue-700 border-blue-200" },
                                            canceled: { label: "Cancelado", cls: "bg-red-50 text-red-600 border-red-200" },
                                        };
                                        const s = statusMap[o.status] ?? { label: o.status, cls: "bg-slate-50 text-slate-500 border-slate-200" };
                                        return (
                                            <tr
                                                key={o.id}
                                                className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                                            >
                                                <td className="px-6 py-4 font-mono text-[11px] text-slate-400 font-bold">#{o.id.substring(0, 6).toUpperCase()}</td>
                                                <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                                                    {new Date(o.created_at).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 overflow-hidden flex-shrink-0">
                                                            {o.client?.avatar ? (
                                                                <img src={`${api.defaults.baseURL}/files/${o.client.avatar}`} alt="" className="w-full h-full object-cover" />
                                                            ) : <User size={14} />}
                                                        </div>
                                                        <span className="font-bold text-slate-800">{o.client?.name ?? '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 font-medium">{o.items?.length ?? 0} item(s)</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${s.cls}`}>
                                                        {s.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-slate-900">
                                                    R$ {Number(o.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedOrderDetails(o)}
                                                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                                                    >
                                                        <ArrowUpRight size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrderDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedOrderDetails(null)}></div>
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl z-10 overflow-hidden">
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

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Itens do Pedido</label>
                                {selectedOrderDetails.items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
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
                                        <div className="font-black text-slate-900 tracking-tight">R$ {(item.quantity * Number(item.unit_price)).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status do Pedido</div>
                                    <select
                                        value={selectedOrderDetails.status}
                                        onChange={(e) => handleStatusUpdate(selectedOrderDetails.id, e.target.value)}
                                        className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest outline-none border border-slate-200 bg-slate-50 cursor-pointer"
                                    >
                                        <option value="pending">Pendente</option>
                                        <option value="picking">Separando Estoque</option>
                                        <option value="to_invoice">A Faturar</option>
                                        <option value="invoiced">Faturado</option>
                                        <option value="delivery">Em Entrega</option>
                                        <option value="delivered">Entregue</option>
                                        <option value="canceled">Cancelado</option>
                                    </select>
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
