import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { DollarSign, Search, Calendar, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fluxo Financeiro</h1>
                    <p className="text-slate-500 mt-1">Acompanhe suas contas a receber e recebimentos.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                            <ArrowUpRight size={16} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Total</div>
                            <div className="text-lg font-black text-slate-900">R$ {receivables.reduce((acc, r: any) => r.status === 'paid' ? acc + Number(r.amount) : acc, 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-900">Lançamentos Gerados</h2>
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar lançamento..."
                            className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl w-full md:w-64 text-sm font-medium outline-none"
                        />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 italic">
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Origem / Cliente</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Valor</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Vencimento</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receivables.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-slate-400 font-medium italic">Nenhum lançamento financeiro encontrado.</td>
                            </tr>
                        ) : (
                            receivables.map((r: any) => (
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
                                            <span className="text-sm font-bold text-slate-700">{new Date(r.due_date).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight flex items-center mt-1">
                                                <Calendar size={10} className="mr-1" /> Vencimento
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
