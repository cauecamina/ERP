import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { DollarSign, Search, Calendar, CheckCircle2, AlertCircle, ArrowUpRight, Download, Filter } from "lucide-react";

function toLocal(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
const _today = toLocal(new Date());
const _yesterday = toLocal(new Date(new Date().setDate(new Date().getDate() - 1)));
const _weekAgo = toLocal(new Date(new Date().setDate(new Date().getDate() - 6)));

export const Receivables: React.FC = () => {
    const [receivables, setReceivables] = useState([]);
    const [dateFrom, setDateFrom] = useState(_today);
    const [dateTo, setDateTo] = useState(_today);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadReceivables();
    }, []);

    async function loadReceivables() {
        try {
            const response = await api.get("/receivables");
            setReceivables(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    const filteredReceivables = receivables.filter((r: any) => {
        const matchesSearch = r.order?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.order_id.toLowerCase().includes(searchTerm.toLowerCase());

        const getLocal = (dateStr: string | null) => {
            if (!dateStr) return null;
            return toLocal(new Date(dateStr));
        };

        const orderDate = getLocal(r.order?.created_at || r.created_at);
        const paymentDate = getLocal(r.paid_at);

        const inRange = (d: string | null) => d != null && d >= dateFrom && d <= dateTo;
        const matchesDate = inRange(orderDate) || inRange(paymentDate);

        return matchesSearch && matchesDate;
    });

    const periodBalance = filteredReceivables.reduce((acc, r: any) => r.status === 'paid' ? acc + Number(r.amount) : acc, 0);

    async function handlePay(id: string) {
        try {
            await api.patch(`/receivables/${id}/pay`);
            loadReceivables();
        } catch (err) {
            console.error(err);
            alert("Erro ao baixar título.");
        }
    }

    function handleExportCSV() {
        if (filteredReceivables.length === 0) {
            alert("Não há dados para exportar com os filtros atuais.");
            return;
        }

        // CSV Header
        const headers = ["Cliente", "Valor", "Data do Pedido", "Vencimento", "Status", "Data do Pagamento"];

        // CSV Rows
        const rows = filteredReceivables.map((r: any) => [
            r.order?.client?.name || "N/A",
            Number(r.amount).toFixed(2),
            new Date(r.order?.created_at || r.created_at).toLocaleDateString('pt-BR'),
            new Date(r.due_date).toLocaleDateString('pt-BR'),
            r.status === 'paid' ? "Liquidado" : "Aguardando",
            r.paid_at ? new Date(r.paid_at).toLocaleDateString('pt-BR') : ""
        ]);

        // Build CSV String (using semicolon for better compatibility with Excel BR)
        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\n");

        // Create Blob and trigger download
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `financeiro_${dateFrom}_${dateTo}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fluxo Financeiro</h1>
                    <p className="text-slate-500 mt-1">Acompanhe suas contas a receber e recebimentos.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Quick shortcuts */}
                    <div className="flex items-center space-x-1">
                        <Filter size={14} className="text-slate-400 mr-1" />
                        {[
                            { label: 'Hoje', from: _today, to: _today },
                            { label: 'Ontem', from: _yesterday, to: _yesterday },
                            { label: 'Ontem + Hoje', from: _yesterday, to: _today },
                            { label: 'Últimos 7 dias', from: _weekAgo, to: _today },
                            { label: 'Todos', from: '2000-01-01', to: _today },
                        ].map(({ label, from, to }) => (
                            <button
                                key={label}
                                onClick={() => { setDateFrom(from); setDateTo(to); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${dateFrom === from && dateTo === to
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Free date range */}
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400 font-medium">De</span>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 bg-white" />
                        <span className="text-xs text-slate-400 font-medium">até</span>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 bg-white" />
                    </div>

                    {/* Received in period */}
                    <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
                        <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <ArrowUpRight size={18} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recebido no Período</div>
                            <div className="text-lg font-black text-slate-900 tracking-tight">R$ {periodBalance.toFixed(2)}</div>
                        </div>
                    </div>

                    <button onClick={handleExportCSV}
                        className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-2 hover:bg-slate-50 transition-colors group">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Download size={18} />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Exportar</div>
                            <div className="text-sm font-bold text-slate-900 leading-none">Planilha</div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-visible">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-900">Lançamentos Gerados</h2>
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar lançamento..."
                            className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl w-full md:w-64 text-sm font-medium outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 italic">
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Origem / Cliente</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Valor</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Data Pedido</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Vencimento</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReceivables.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-slate-400 font-medium italic">Nenhum lançamento encontrado para a data selecionada.</td>
                            </tr>
                        ) : (
                            filteredReceivables.map((r: any) => (
                                <tr key={r.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                                <DollarSign size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{r.order?.client?.name || 'Cliente Removido'}</div>
                                                <div className="text-xs text-slate-400 font-mono">PEDIDO: #{r.order_id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 font-black text-slate-900">R$ {Number(r.amount).toFixed(2)}</td>
                                    <td className="p-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-bold text-slate-700">{new Date(r.order?.created_at || r.created_at).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight flex items-center mt-1">
                                                <Calendar size={10} className="mr-1" /> Emissão
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-bold text-slate-700">{new Date(r.due_date).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight flex items-center mt-1">
                                                <AlertCircle size={10} className="mr-1 text-amber-500" /> Vencimento
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider ${r.status === 'paid'
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            : 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm shadow-amber-500/10'
                                            }`}>
                                            {r.status === 'paid' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                            <span>{r.status === 'paid' ? 'Liquidado' : 'Aguardando'}</span>
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        {r.status === 'open' && (
                                            <button
                                                onClick={() => handlePay(r.id)}
                                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/10 active:scale-95"
                                            >
                                                Baixar Título
                                            </button>
                                        )}
                                        {r.status === 'paid' && (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase italic">Confirmado</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};
