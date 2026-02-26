import React, { useEffect, useState, useMemo } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import {
    ShoppingBag, Plus, Trash2, CheckCircle2, User, Calendar,
    ArrowUpRight, X, Filter, Search, TrendingUp, Package,
    Clock, Truck, Tag, ChevronRight, Receipt, UserCheck,
    AlertCircle
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────
function toLocalDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
const today = toLocalDate(new Date());
const yesterday = toLocalDate(new Date(new Date().setDate(new Date().getDate() - 1)));
const weekAgo = toLocalDate(new Date(new Date().setDate(new Date().getDate() - 6)));

const STATUS_MAP: Record<string, { label: string; cls: string; step: number }> = {
    pending: { label: "Pendente", cls: "bg-amber-50 text-amber-700 border-amber-200", step: 0 },
    picking: { label: "Separando", cls: "bg-orange-50 text-orange-700 border-orange-200", step: 1 },
    to_invoice: { label: "A Faturar", cls: "bg-purple-50 text-purple-700 border-purple-200", step: 2 },
    invoiced: { label: "Faturado", cls: "bg-blue-50 text-blue-700 border-blue-200", step: 3 },
    delivery: { label: "Em Entrega", cls: "bg-indigo-50 text-indigo-700 border-indigo-200", step: 4 },
    delivered: { label: "Entregue", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", step: 5 },
    canceled: { label: "Cancelado", cls: "bg-red-50 text-red-600 border-red-200", step: -1 },
};

const STATUS_PIPELINE = [
    { key: "pending", label: "Pendente" },
    { key: "picking", label: "Separando" },
    { key: "to_invoice", label: "A Faturar" },
    { key: "invoiced", label: "Faturado" },
    { key: "delivery", label: "Entrega" },
    { key: "delivered", label: "Entregue" },
];

// ─── types ───────────────────────────────────────────────────────────────────
interface CartItem { product_id: string; name: string; quantity: number; unit_price: number; }

// ─── component ───────────────────────────────────────────────────────────────
export const Orders: React.FC = () => {
    // data
    const [orders, setOrders] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // form
    const [selectedClient, setSelectedClient] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [items, setItems] = useState<CartItem[]>([]);
    const [vendedor, setVendedor] = useState("");
    const [discountValue, setDiscountValue] = useState(0);
    const [billingPreviewDate, setBillingPreviewDate] = useState("");

    // list & filter
    const [dateFrom, setDateFrom] = useState(today);
    const [dateTo, setDateTo] = useState(today);
    const [clientSearch, setClientSearch] = useState("");
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

    // ── fetch ────────────────────────────────────────────────────────────────
    useEffect(() => {
        api.get("/orders").then(res => setOrders(res.data));
        api.get("/clients").then(res => setClients(res.data));
        api.get("/products").then(res => setProducts(res.data));
    }, []);

    // ── computed: price preview ──────────────────────────────────────────────
    const previewProduct = useMemo(
        () => products.find((p: any) => p.id === selectedProduct) as any | undefined,
        [products, selectedProduct]
    );
    const previewLineTotal = previewProduct ? Number(previewProduct.price) * quantity : 0;

    // ── computed: cart subtotal & total ──────────────────────────────────────
    const cartSubtotal = items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);
    const cartTotal = Math.max(0, cartSubtotal - discountValue);

    // ── actions: cart ────────────────────────────────────────────────────────
    function addItem() {
        if (!previewProduct) return;
        const existing = items.find(i => i.product_id === previewProduct.id);
        if (existing) {
            setItems(items.map(i =>
                i.product_id === previewProduct.id
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
            ));
        } else {
            setItems([...items, {
                product_id: previewProduct.id,
                name: previewProduct.name,
                quantity,
                unit_price: Number(previewProduct.price),
            }]);
        }
        setSelectedProduct("");
        setQuantity(1);
    }

    function removeItem(idx: number) {
        setItems(items.filter((_, i) => i !== idx));
    }

    // ── actions: submit ──────────────────────────────────────────────────────
    async function handleOrder() {
        try {
            await api.post("/orders", {
                client_id: selectedClient,
                items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
                vendedor: vendedor || undefined,
                discount_value: discountValue,
                billing_preview_date: billingPreviewDate || undefined,
            });
            // reset form
            setSelectedClient("");
            setItems([]);
            setVendedor("");
            setDiscountValue(0);
            setBillingPreviewDate("");
            // refresh orders
            const res = await api.get("/orders");
            setOrders(res.data);
        } catch {
            alert("Erro ao criar pedido. Verifique o estoque e tente novamente.");
        }
    }

    // ── actions: status update ───────────────────────────────────────────────
    async function handleStatusUpdate(orderId: string, newStatus: string) {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o));
            setSelectedOrderDetails((prev: any) => prev?.id === orderId ? { ...prev, status: newStatus } : prev);
        } catch {
            alert("Erro ao atualizar status do pedido.");
        }
    }

    // ── filtered list ────────────────────────────────────────────────────────
    const filteredOrders = useMemo(() =>
        [...orders]
            .filter((o: any) => {
                const d = toLocalDate(new Date(o.created_at));
                const inRange = d >= dateFrom && d <= dateTo;
                const matchesSearch = clientSearch === "" ||
                    o.client?.name?.toLowerCase().includes(clientSearch.toLowerCase());
                return inRange && matchesSearch;
            })
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        [orders, dateFrom, dateTo, clientSearch]
    );

    // ── KPI cards ────────────────────────────────────────────────────────────
    const kpis = useMemo(() => {
        const revenue = filteredOrders.reduce((s: number, o: any) => s + Number(o.total_value), 0);
        const pending = filteredOrders.filter((o: any) => o.status === "pending").length;
        const delivered = filteredOrders.filter((o: any) => o.status === "delivered").length;
        return { revenue, total: filteredOrders.length, pending, delivered };
    }, [filteredOrders]);

    // ── render ───────────────────────────────────────────────────────────────
    return (
        <Layout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-left">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pedidos de Venda</h1>
                    <p className="text-slate-500 mt-1">Gerencie pedidos, acompanhe o pipeline e monitore receita.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* ── LEFT: New Order Form ──────────────────────────────── */}
                <div className="xl:col-span-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                <ShoppingBag size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Novo Pedido</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Client */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cliente *</label>
                                <select
                                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none text-sm"
                                    value={selectedClient}
                                    onChange={e => setSelectedClient(e.target.value)}
                                >
                                    <option value="">Selecionar cliente...</option>
                                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Vendedor */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vendedor</label>
                                <div className="relative">
                                    <UserCheck size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Nome do vendedor..."
                                        className="w-full pl-9 pr-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                        value={vendedor}
                                        onChange={e => setVendedor(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Billing Preview Date */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Previsão de Faturamento</label>
                                <div className="relative">
                                    <Receipt size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        className="w-full pl-9 pr-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
                                        value={billingPreviewDate}
                                        onChange={e => setBillingPreviewDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Add Item */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Adicionar Produto</label>
                                <select
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium outline-none appearance-none text-sm mb-3"
                                    value={selectedProduct}
                                    onChange={e => setSelectedProduct(e.target.value)}
                                >
                                    <option value="">Buscar produto...</option>
                                    {products.map((p: any) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — R$ {Number(p.price).toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        min={1}
                                        placeholder="Qtd"
                                        className="w-20 p-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium outline-none text-center text-sm"
                                        value={quantity}
                                        onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                                    />
                                    {/* price preview */}
                                    {previewProduct && (
                                        <div className="flex-1 flex items-center justify-between px-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700">
                                            <span>{previewProduct.name}</span>
                                            <span>R$ {previewLineTotal.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {!previewProduct && <div className="flex-1" />}
                                    <button
                                        onClick={addItem}
                                        disabled={!previewProduct}
                                        className="px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Cart Items */}
                            {items.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens ({items.length})</label>
                                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                        {items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                                                    <div className="text-xs text-indigo-600 font-bold">
                                                        {item.quantity} × R$ {item.unit_price.toFixed(2)}
                                                        <span className="ml-2 text-slate-400">= R$ {(item.quantity * item.unit_price).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeItem(idx)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Subtotal / Discount / Total */}
                                    <div className="mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                                            <span>Subtotal</span>
                                            <span>R$ {cartSubtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                                <Tag size={13} />
                                                <span>Desconto R$</span>
                                            </div>
                                            <input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                className="w-28 p-2 text-right bg-white border border-slate-200 rounded-xl text-sm font-bold text-red-600 outline-none"
                                                value={discountValue}
                                                onChange={e => setDiscountValue(Math.max(0, Number(e.target.value)))}
                                            />
                                        </div>
                                        <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
                                            <span>Total</span>
                                            <span className="text-indigo-600">R$ {cartTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleOrder}
                                disabled={!selectedClient || items.length === 0}
                                className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold tracking-wide disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black transition-all duration-200 shadow-lg"
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <CheckCircle2 size={18} />
                                    <span>FINALIZAR PEDIDO</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: KPIs + Filters + List ─────────────────────── */}
                <div className="xl:col-span-8 flex flex-col gap-6">

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            {
                                icon: <TrendingUp size={18} />,
                                label: "Receita",
                                value: `R$ ${kpis.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                                color: "indigo",
                            },
                            {
                                icon: <Package size={18} />,
                                label: "Pedidos",
                                value: String(kpis.total),
                                color: "slate",
                            },
                            {
                                icon: <Clock size={18} />,
                                label: "Pendentes",
                                value: String(kpis.pending),
                                color: "amber",
                            },
                            {
                                icon: <Truck size={18} />,
                                label: "Entregues",
                                value: String(kpis.delivered),
                                color: "emerald",
                            },
                        ].map(kpi => (
                            <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                                <div className={`inline-flex p-2 rounded-xl mb-3 bg-${kpi.color}-50 text-${kpi.color}-600`}>
                                    {kpi.icon}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</div>
                                <div className="text-xl font-black text-slate-900 tracking-tight">{kpi.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Filter size={14} className="text-slate-400" />
                            {[
                                { label: "Hoje", from: today, to: today },
                                { label: "Ontem", from: yesterday, to: yesterday },
                                { label: "Últimos 7 dias", from: weekAgo, to: today },
                                { label: "Todos", from: "2000-01-01", to: today },
                            ].map(btn => (
                                <button
                                    key={btn.label}
                                    onClick={() => { setDateFrom(btn.from); setDateTo(btn.to); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${dateFrom === btn.from && dateTo === btn.to
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                                        }`}
                                >
                                    {btn.label}
                                </button>
                            ))}

                            <div className="flex items-center gap-2 ml-auto">
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 bg-white" />
                                <span className="text-xs text-slate-400">até</span>
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 bg-white" />
                            </div>
                        </div>

                        {/* Search */}
                        <div className="mt-3 relative">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome do cliente..."
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 bg-white"
                                value={clientSearch}
                                onChange={e => setClientSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div>
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Calendar size={14} />
                            {filteredOrders.length} de {orders.length} pedidos
                        </h2>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {filteredOrders.length === 0 ? (
                                <div className="p-16 text-center text-slate-400">
                                    <ShoppingBag size={36} className="mx-auto mb-3 opacity-10" />
                                    <p className="font-medium italic">Nenhum pedido encontrado para o período.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80">
                                            {["#", "Data", "Cliente", "Vendedor", "Itens", "Status", "Total", ""].map(h => (
                                                <th key={h} className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((o: any, idx: number) => {
                                            const s = STATUS_MAP[o.status] ?? { label: o.status, cls: "bg-slate-50 text-slate-500 border-slate-200", step: -1 };
                                            return (
                                                <tr key={o.id} className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${idx % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                                                    <td className="px-5 py-4 font-mono text-[11px] text-slate-400 font-bold">#{o.id.substring(0, 6).toUpperCase()}</td>
                                                    <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                                                        {new Date(o.created_at).toLocaleDateString("pt-BR")}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 overflow-hidden flex-shrink-0">
                                                                {o.client?.avatar
                                                                    ? <img src={`${api.defaults.baseURL}/files/${o.client.avatar}`} alt="" className="w-full h-full object-cover" />
                                                                    : <User size={12} />}
                                                            </div>
                                                            <span className="font-bold text-slate-800 text-sm">{o.client?.name ?? "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-500 text-sm">{o.vendedor || <span className="text-slate-300">—</span>}</td>
                                                    <td className="px-5 py-4 text-slate-500 font-medium text-sm">{o.items?.length ?? 0}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${s.cls}`}>
                                                            {s.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 font-black text-slate-900 text-sm whitespace-nowrap">
                                                        R$ {Number(o.total_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <button
                                                            onClick={() => setSelectedOrderDetails(o)}
                                                            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                                                        >
                                                            <ArrowUpRight size={14} />
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
            </div>

            {/* ── Order Details Modal ────────────────────────────────────── */}
            {selectedOrderDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedOrderDetails(null)} />
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="p-7 border-b border-slate-100 flex items-start justify-between bg-gradient-to-br from-slate-50 to-white">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-[10px] font-black bg-indigo-600 text-white px-2.5 py-1 rounded-lg uppercase tracking-widest">
                                        #{selectedOrderDetails.id.substring(0, 8).toUpperCase()}
                                    </span>
                                    <span className="text-xs text-slate-400 font-bold">
                                        {new Date(selectedOrderDetails.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Detalhes do Pedido</h2>
                            </div>
                            <button onClick={() => setSelectedOrderDetails(null)} className="p-2 hover:bg-white rounded-full text-slate-400 border border-slate-100 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-7 space-y-6">

                            {/* Client info */}
                            <div className="flex items-center space-x-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm overflow-hidden flex-shrink-0">
                                    {selectedOrderDetails.client?.avatar
                                        ? <img src={`${api.defaults.baseURL}/files/${selectedOrderDetails.client.avatar}`} alt="" className="w-full h-full object-cover" />
                                        : <User size={26} />}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">Cliente</div>
                                    <div className="text-xl font-black text-slate-900">{selectedOrderDetails.client?.name}</div>
                                </div>
                                {selectedOrderDetails.vendedor && (
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Vendedor</div>
                                        <div className="font-bold text-slate-700">{selectedOrderDetails.vendedor}</div>
                                    </div>
                                )}
                            </div>

                            {/* Extra meta: billing date */}
                            {selectedOrderDetails.billing_preview_date && (
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-xl">
                                    <AlertCircle size={14} className="text-amber-500" />
                                    Previsão de faturamento:{" "}
                                    <span className="font-black text-amber-700">
                                        {new Date(selectedOrderDetails.billing_preview_date).toLocaleDateString("pt-BR")}
                                    </span>
                                </div>
                            )}

                            {/* Status Pipeline */}
                            {selectedOrderDetails.status !== "canceled" && (
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pipeline do Pedido</div>
                                    <div className="flex items-center gap-1">
                                        {STATUS_PIPELINE.map((step, i) => {
                                            const currentStep = STATUS_MAP[selectedOrderDetails.status]?.step ?? 0;
                                            const isActive = i === currentStep;
                                            const isDone = i < currentStep;
                                            return (
                                                <React.Fragment key={step.key}>
                                                    <div className={`flex-1 py-2 px-2 rounded-xl text-center text-[10px] font-black transition-all border ${isActive ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200" :
                                                            isDone ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                                "bg-slate-50 text-slate-400 border-slate-100"
                                                        }`}>
                                                        {step.label}
                                                    </div>
                                                    {i < STATUS_PIPELINE.length - 1 && (
                                                        <ChevronRight size={12} className={isDone ? "text-emerald-400" : "text-slate-300"} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Items list */}
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Itens do Pedido</div>
                                <div className="space-y-2 max-h-52 overflow-y-auto">
                                    {selectedOrderDetails.items?.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 overflow-hidden flex-shrink-0">
                                                    {item.product?.image
                                                        ? <img src={`${api.defaults.baseURL}/files/${item.product.image}`} alt="" className="w-full h-full object-cover" />
                                                        : <ShoppingBag size={16} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{item.product?.name}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{item.quantity} × R$ {Number(item.unit_price).toFixed(2)}</div>
                                                </div>
                                            </div>
                                            <div className="font-black text-slate-900 text-sm">
                                                R$ {(item.quantity * Number(item.unit_price)).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total box */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                                {Number(selectedOrderDetails.discount_value) > 0 && (
                                    <>
                                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                                            <span>Subtotal</span>
                                            <span>R$ {(Number(selectedOrderDetails.total_value) + Number(selectedOrderDetails.discount_value)).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-red-500">
                                            <span className="flex items-center gap-1"><Tag size={12} /> Desconto</span>
                                            <span>− R$ {Number(selectedOrderDetails.discount_value).toFixed(2)}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                                    <span className="font-black text-slate-700 uppercase tracking-wider text-sm">Total</span>
                                    <span className="text-3xl font-black text-indigo-600 tracking-tighter">
                                        R$ {Number(selectedOrderDetails.total_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Status Selector */}
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alterar Status</div>
                                <select
                                    value={selectedOrderDetails.status}
                                    onChange={e => handleStatusUpdate(selectedOrderDetails.id, e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none border border-slate-200 bg-slate-50 cursor-pointer"
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
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => setSelectedOrderDetails(null)}
                                className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold tracking-wide hover:bg-black transition-all duration-200"
                            >
                                FECHAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
