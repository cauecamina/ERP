import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { UserPlus, Mail, Phone, CreditCard, Search, MoreVertical, Edit2, Trash2, X } from "lucide-react";

export const Clients: React.FC = () => {
    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({ name: "", cpf_cnpj: "", email: "", phone: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    useEffect(() => {
        loadClients();
    }, []);

    async function loadClients() {
        const response = await api.get("/clients");
        setClients(response.data);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/clients/${editingId}`, formData);
                setEditingId(null);
            } else {
                await api.post("/clients", formData);
            }
            setFormData({ name: "", cpf_cnpj: "", email: "", phone: "" });
            loadClients();
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar cliente.");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
        try {
            await api.delete(`/clients/${id}`);
            loadClients();
            setActiveMenuId(null);
        } catch (err) {
            console.error(err);
            alert("Erro ao excluir cliente.");
        }
    }

    function handleEdit(c: any) {
        setFormData({ name: c.name, cpf_cnpj: c.cpf_cnpj, email: c.email, phone: c.phone });
        setEditingId(c.id);
        setActiveMenuId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData({ name: "", cpf_cnpj: "", email: "", phone: "" });
    }

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestão de Clientes</h1>
                    <p className="text-slate-500 mt-1">Cadastre e gerencie sua base de contatos.</p>
                </div>
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar clientes..."
                        className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Form Column */}
                <div className="xl:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <UserPlus size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingId ? "Editar Cliente" : "Novo Cliente"}
                            </h2>
                            {editingId && (
                                <button
                                    onClick={cancelEdit}
                                    className="ml-auto p-1 hover:bg-slate-100 rounded-full text-slate-400"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome Completo</label>
                                <input
                                    placeholder="João Silva"
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CPF / CNPJ</label>
                                <div className="relative">
                                    <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        placeholder="000.000.000-00"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                        value={formData.cpf_cnpj}
                                        onChange={e => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        placeholder="email@exemplo.com"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Telefone</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        placeholder="(00) 00000-0000"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button className={`w-full text-white p-5 rounded-2xl font-bold shadow-lg transition-all duration-200 mt-4 ${editingId ? 'bg-amber-600 shadow-amber-600/20 hover:bg-amber-700' : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700'}`}>
                                {editingId ? "Salvar Alterações" : "Cadastrar Cliente"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table Column */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-visible">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 italic">
                                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Informações do Cliente</th>
                                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Documento</th>
                                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-10 text-center text-slate-400 font-medium italic">Nenhum cliente cadastrado ainda.</td>
                                    </tr>
                                ) : (
                                    clients.map((c: any) => (
                                        <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-150 group">
                                            <td className="p-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                        {c.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{c.name}</div>
                                                        <div className="text-slate-500 text-xs">{c.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full inline-block">{c.cpf_cnpj}</div>
                                                <div className="text-slate-400 text-xs mt-1">{c.phone}</div>
                                            </td>
                                            <td className="p-6 text-right relative">
                                                <button
                                                    onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    <MoreVertical size={20} />
                                                </button>

                                                {activeMenuId === c.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                                                        <div className="absolute right-6 top-14 bg-white border border-slate-100 shadow-2xl rounded-2xl py-2 w-48 z-20 animate-in fade-in zoom-in duration-200">
                                                            <button
                                                                onClick={() => handleEdit(c)}
                                                                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all"
                                                            >
                                                                <Edit2 size={16} />
                                                                <span>Editar Cliente</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(c.id)}
                                                                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                                <span>Excluir Cadastro</span>
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
