import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import {
    UserPlus, Phone, Search, MoreVertical,
    Edit2, Trash2, X, Info, MapPin, Building2, History, Settings, Save, AtSign, Download, Upload, FileSpreadsheet
} from "lucide-react";

export const Clients: React.FC = () => {
    const [clients, setClients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("endereco");
    const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importPreviewData, setImportPreviewData] = useState<any[] | null>(null);

    const initialFormData = {
        name: "",
        cpf_cnpj: "",
        email: "",
        phone: "",
        fantasy_name: "",
        contact_name: "",
        ddd: "",
        street: "",
        number: "",
        neighborhood: "",
        complement: "",
        city: "",
        state: "",
        zip_code: "",
        active: true
    };

    const [formData, setFormData] = useState(initialFormData);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredClients = clients.filter((c: any) => {
        const term = searchTerm.toLowerCase();
        return (
            c.name.toLowerCase().includes(term) ||
            c.cpf_cnpj.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term)
        );
    });

    useEffect(() => {
        loadClients();
    }, []);

    async function loadClients() {
        try {
            const response = await api.get("/clients");
            setClients(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (isModalOpen && editingId && activeTab === "historico") {
            loadHistory();
        }
    }, [isModalOpen, editingId, activeTab]);

    async function loadHistory() {
        try {
            const response = await api.get(`/clients/${editingId}/history`);
            setPurchaseHistory(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, (formData as any)[key]);
            });

            if (avatarFile) {
                data.append("avatar", avatarFile);
            }

            if (editingId) {
                await api.put(`/clients/${editingId}`, data);
                setEditingId(null);
            } else {
                await api.post("/clients", data);
            }

            setFormData(initialFormData);
            setAvatarFile(null);
            setAvatarPreview(null);
            setIsModalOpen(false);
            loadClients();
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar cliente.");
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
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
        setFormData({
            name: c.name,
            cpf_cnpj: c.cpf_cnpj,
            email: c.email,
            phone: c.phone,
            fantasy_name: c.fantasy_name || "",
            contact_name: c.contact_name || "",
            ddd: c.ddd || "",
            street: c.street || "",
            number: c.number || "",
            neighborhood: c.neighborhood || "",
            complement: c.complement || "",
            city: c.city || "",
            state: c.state || "",
            zip_code: c.zip_code || "",
            active: c.active ?? true
        });
        setAvatarPreview(c.avatar ? `${api.defaults.baseURL}/files/${c.avatar}` : null);
        setEditingId(c.id);
        setIsModalOpen(true);
        setActiveMenuId(null);
    }

    function openNewClientModal() {
        setFormData(initialFormData);
        setAvatarPreview(null);
        setAvatarFile(null);
        setEditingId(null);
        setIsModalOpen(true);
    }

    function handleExportCSV() {
        if (filteredClients.length === 0) {
            alert("Não há dados para exportar com os filtros atuais.");
            return;
        }

        const headers = ["ID", "Nome/Razão Social", "Fantasia", "CNPJ/CPF", "E-mail", "Telefone", "Cidade", "Estado", "Status"];
        const rows = filteredClients.map((c: any) => [
            c.id,
            c.name,
            c.fantasy_name || "",
            c.cpf_cnpj,
            c.email,
            `(${c.ddd}) ${c.phone}`,
            c.city || "",
            c.state || "",
            c.active ? "Ativo" : "Inativo"
        ]);

        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `clientes_${new Date().toLocaleDateString('en-CA')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    function handleDownloadTemplate() {
        const headers = [
            "Nome/Razão Social", "Nome Fantasia", "CPF/CNPJ", "E-mail", "DDD", "Telefone",
            "Endereço", "Número", "Bairro", "Cidade", "Estado", "CEP"
        ];
        const csvContent = headers.join(";");
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "modelo_clientes_caueerp.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
            if (lines.length === 0) return;

            // Auto-detect separator
            const firstLine = lines[0];
            const semicolonCount = (firstLine.match(/;/g) || []).length;
            const commaCount = (firstLine.match(/,/g) || []).length;
            const separator = semicolonCount >= commaCount ? ";" : ",";

            const headers = lines[0].replace("\r", "").split(separator).map(h => h.trim());

            const mapping: { [key: string]: string } = {
                "Nome/Razão Social": "name",
                "Nome Fantasia": "fantasy_name",
                "CPF/CNPJ": "cpf_cnpj",
                "E-mail": "email",
                "DDD": "ddd",
                "Telefone": "phone",
                "Endereço": "street",
                "Número": "number",
                "Bairro": "neighborhood",
                "Cidade": "city",
                "Estado": "state",
                "CEP": "zip_code"
            };

            const data = lines.slice(1).map(line => {
                const values = line.split(separator);
                const obj: any = {};
                headers.forEach((header, index) => {
                    const internalKey = mapping[header];
                    if (internalKey) {
                        obj[internalKey] = values[index]?.trim();
                    }
                });
                return obj;
            }).filter(obj => obj.name);

            if (data.length === 0) {
                alert("Nenhum dado válido encontrado. Verifique se os nomes das colunas estão corretos e use o modelo sugerido.");
                return;
            }

            setImportPreviewData(data);
        };
        reader.readAsText(file);
        e.target.value = "";
    }

    async function confirmImport() {
        if (!importPreviewData) return;
        try {
            await api.post("/clients/bulk", importPreviewData);
            alert(`${importPreviewData.length} clientes importados com sucesso!`);
            setImportPreviewData(null);
            setIsImportModalOpen(false);
            loadClients();
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "Verifique o formato do arquivo.";
            alert(`Erro ao importar: ${errorMsg}`);
        }
    }

    return (
        <Layout>
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 text-left">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Clientes</h1>
                    <p className="text-slate-500 mt-1 font-medium">Gestão estratégica da sua carteira de parceiros.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleExportCSV}
                        className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:bg-slate-50 transition-all group"
                    >
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Download size={20} />
                        </div>
                        <div className="text-left hidden md:block">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Exportar</div>
                            <div className="text-[11px] font-black text-slate-900 leading-none">PLANILHA</div>
                        </div>
                    </button>

                    <div className="hidden lg:flex items-center space-x-6 px-10 border-r border-slate-200">
                        <div className="text-center">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Clientes</div>
                            <div className="text-2xl font-black text-slate-900">{clients.length}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ativos</div>
                            <div className="text-2xl font-black text-emerald-600">{clients.filter((c: any) => c.active).length}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:bg-slate-50 transition-all group"
                    >
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <Upload size={20} />
                        </div>
                        <div className="text-left hidden md:block">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Lote</div>
                            <div className="text-[11px] font-black text-slate-900 leading-none">IMPORTAR</div>
                        </div>
                    </button>

                    <button
                        onClick={openNewClientModal}
                        className="flex items-center space-x-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                    >
                        <UserPlus size={18} />
                        <span>Novo Cliente</span>
                    </button>
                </div>
            </div>

            {/* List and Search Area */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center space-x-4 flex-1 max-w-xl">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome, CPF/CNPJ ou email..."
                                className="pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl w-full text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center space-x-2">
                            <Search size={14} />
                            <span>Buscar</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto pb-32">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 italic">
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest px-10">Parceiro de Negócio</th>
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">CPF / CNPJ</th>
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Contato Principal</th>
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center px-10">Status</th>
                                <th className="p-8"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-slate-400 font-medium italic">Nenhum cliente encontrado na base.</td>
                                </tr>
                            ) : (
                                filteredClients.map((c: any) => (
                                    <tr key={c.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-150 group ${!c.active ? 'opacity-50 grayscale' : ''}`}>
                                        <td className="p-8 px-10">
                                            <div className="flex items-center space-x-5">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                    {c.avatar ? (
                                                        <img src={`${api.defaults.baseURL}/files/${c.avatar}`} alt={c.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserPlus size={22} className="opacity-50" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="font-black text-slate-900 text-base">{c.name}</div>
                                                        {!c.active && <span className="bg-slate-200 text-slate-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Inativo</span>}
                                                    </div>
                                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">{c.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono bg-slate-100 inline-block px-3 py-1 rounded-lg">
                                                {c.cpf_cnpj}
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="text-sm font-black text-slate-900">{c.phone}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">{c.city || 'Cidade N/A'} - {c.state || 'UF'}</div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center px-10">
                                            <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block ${c.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {c.active ? 'Regular' : 'Inativo'}
                                            </div>
                                        </td>
                                        <td className="p-8 text-right relative px-10">
                                            <button
                                                onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                                                className="p-3 text-slate-300 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl"
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            {activeMenuId === c.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                                                    <div className="absolute right-10 top-12 bg-white border border-slate-100 shadow-2xl rounded-2xl py-3 w-56 z-20 animate-in fade-in zoom-in duration-200 overflow-hidden">
                                                        <button
                                                            onClick={() => handleEdit(c)}
                                                            className="w-full flex items-center space-x-3 px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left"
                                                        >
                                                            <Edit2 size={16} />
                                                            <span className="text-[10px]">Alterar</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(c.id)}
                                                            className="w-full flex items-center space-x-3 px-6 py-4 text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all text-left border-t border-slate-50"
                                                        >
                                                            <Trash2 size={16} />
                                                            <span className="text-[10px]">Apagar</span>
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

            {/* Professional Omie-Style Registration Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-[#fafafa] w-full max-w-6xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white"
                    >
                        {/* Modal Header */}
                        <div className="p-10 pb-6 bg-white flex justify-between items-start border-b border-slate-100">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                        <UserPlus size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Clientes</h2>
                                </div>
                                <div className="flex-1 max-w-2xl">
                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Razão Social / Nome Completo</label>
                                    <input
                                        placeholder="Nome Principal do Cliente"
                                        className="w-full text-xl font-black text-slate-800 bg-slate-100/50 px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400 transition-all shadow-inner"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-4 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-hidden flex bg-white/50">
                            <div className="flex-1 overflow-y-auto p-10 pt-6 space-y-10 custom-scrollbar">
                                {/* Top Grid: Fantasy Name, Contact Person, CPF/CNPJ */}
                                <div className="grid grid-cols-12 gap-6 items-end">
                                    <div className="col-span-5">
                                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Nome Fantasia / Nome Abreviado</label>
                                        <input
                                            className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                            value={formData.fantasy_name}
                                            onChange={e => setFormData({ ...formData, fantasy_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Nome do Contato</label>
                                        <input
                                            className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                            value={formData.contact_name}
                                            onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">CNPJ / CPF</label>
                                        <input
                                            className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-600/30 transition-all"
                                            value={formData.cpf_cnpj}
                                            onChange={e => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Tabs Section */}
                                <div>
                                    <div className="flex items-center space-x-6 border-b border-slate-100 mb-8 overflow-x-auto">
                                        {[
                                            { id: 'endereco', label: 'Endereço', icon: <MapPin size={14} /> },
                                            { id: 'contato', label: 'Telefones e E-mail', icon: <Phone size={14} /> },
                                            { id: 'historico', label: 'Histórico de Compra', icon: <History size={14} /> },
                                            { id: 'extra', label: 'CNAE e Outros', icon: <Info size={14} /> },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`pb-4 text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {tab.icon}
                                                <span>{tab.label}</span>
                                                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 min-h-[300px]">
                                        {activeTab === 'endereco' && (
                                            <div className="grid grid-cols-12 gap-6">
                                                <div className="col-span-9">
                                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Endereço</label>
                                                    <input
                                                        className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                                        value={formData.street}
                                                        onChange={e => setFormData({ ...formData, street: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Número</label>
                                                    <input
                                                        className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                                        value={formData.number}
                                                        onChange={e => setFormData({ ...formData, number: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-span-6">
                                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Bairro</label>
                                                    <input
                                                        className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                                        value={formData.neighborhood}
                                                        onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-span-6">
                                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Complemento</label>
                                                    <input
                                                        className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                                        value={formData.complement}
                                                        onChange={e => setFormData({ ...formData, complement: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Estado</label>
                                                    <input
                                                        maxLength={2}
                                                        className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all uppercase placeholder:text-slate-400"
                                                        value={formData.state}
                                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-span-7">
                                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Cidade</label>
                                                    <input
                                                        className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                                        value={formData.city}
                                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">CEP</label>
                                                    <input
                                                        className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                                        value={formData.zip_code}
                                                        onChange={e => setFormData({ ...formData, zip_code: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'contato' && (
                                            <div className="grid grid-cols-2 gap-10">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4 ml-1 italic">Canais de Comunicação</label>
                                                    <div className="space-y-6">
                                                        <div className="flex items-center space-x-4 p-4 bg-indigo-50/30 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-600/10">
                                                            <AtSign size={18} className="text-indigo-600" />
                                                            <input
                                                                placeholder="E-mail principal"
                                                                className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-700 placeholder:text-slate-400"
                                                                value={formData.email}
                                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-20 p-4 bg-slate-100/50 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-2 focus-within:ring-2 focus-within:ring-indigo-600/10 transition-all">
                                                                <Phone size={14} className="text-slate-400" />
                                                                <input
                                                                    placeholder="DDD"
                                                                    maxLength={2}
                                                                    className="w-full bg-transparent border-none outline-none font-bold text-sm text-center placeholder:text-slate-400"
                                                                    value={formData.ddd}
                                                                    onChange={e => setFormData({ ...formData, ddd: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="flex-1 p-4 bg-slate-100/50 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-600/10 transition-all">
                                                                <input
                                                                    placeholder="Número do Telefone"
                                                                    className="w-full bg-transparent border-none outline-none font-bold text-sm placeholder:text-slate-400"
                                                                    value={formData.phone}
                                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center justify-center border-l border-slate-200 pl-10 text-center">
                                                    <div className="w-28 h-28 bg-white border border-slate-100 rounded-full mb-4 p-1 relative group overflow-hidden shadow-inner">
                                                        {avatarPreview ? (
                                                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                                                        ) : (
                                                            <UserPlus className="w-full h-full p-6 text-slate-200" />
                                                        )}
                                                        <input
                                                            type="file"
                                                            onChange={handleFileChange}
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                            accept="image/*"
                                                        />
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px] font-black uppercase tracking-widest text-center px-2">
                                                            Alterar Avatar
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Foto do Parceiro</p>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'historico' && (
                                            <div className="space-y-6">
                                                <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1 italic">Linha do Tempo de Pedidos</label>
                                                {purchaseHistory.length === 0 ? (
                                                    <div className="p-10 text-center py-20 flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 border border-slate-50">
                                                            <History size={30} />
                                                        </div>
                                                        <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Nenhum pedido vinculado a este cliente ainda.</p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
                                                        <table className="w-full text-left text-xs">
                                                            <thead>
                                                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                                                    <th className="p-4 font-black text-slate-400 uppercase tracking-widest px-6">Emissão</th>
                                                                    <th className="p-4 font-black text-slate-400 uppercase tracking-widest">Itens do Pedido</th>
                                                                    <th className="p-4 font-black text-slate-400 uppercase tracking-widest text-right px-6">Valor Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {purchaseHistory.map((order: any) => (
                                                                    <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                                        <td className="p-4 px-6 font-medium text-slate-500">
                                                                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                                                        </td>
                                                                        <td className="p-4">
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {order.items?.map((item: any) => (
                                                                                    <span key={item.id} className="bg-slate-100 text-[10px] font-bold text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200">
                                                                                        {item.quantity}x {item.product?.name}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-4 text-right px-6 font-black text-indigo-600">
                                                                            R$ {Number(order.total_value).toFixed(2)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'extra' && (
                                            <div className="p-10 text-center py-20 flex flex-col items-center">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 border border-slate-50">
                                                    <Building2 size={30} />
                                                </div>
                                                <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Configuração Fiscal Disponível no Próximo Módulo</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Actions */}
                            <div className="w-[340px] bg-slate-50/30 p-10 border-l border-slate-100 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-[11px] font-black text-slate-900 tracking-widest uppercase mb-8 ml-1 flex items-center justify-between border-b border-slate-100 pb-2">
                                        Controle de Cadastro <Settings size={14} className="opacity-20" />
                                    </h3>

                                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm mb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Status do Cliente</div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{formData.active ? 'Parceiro Ativo' : 'Bloqueado / Inativo'}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, active: !formData.active })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${formData.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-10">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center space-x-3 bg-indigo-600 text-white p-5 rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-95 group"
                                    >
                                        <Save size={18} />
                                        <span>Confirmar Dados</span>
                                    </button>
                                    <p className="text-[9px] text-slate-400 text-center font-bold italic opacity-60">As informações fiscais e tributárias são validadas automaticamente.</p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}
            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Importação em Lote</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Clientes via CSV</p>
                            </div>
                            <button
                                onClick={() => {
                                    setImportPreviewData(null);
                                    setIsImportModalOpen(false);
                                }}
                                className="p-3 bg-white text-slate-400 hover:text-red-500 rounded-2xl shadow-sm border border-slate-100 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            {importPreviewData ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-slate-900 text-sm uppercase">Prévia da Importação ({importPreviewData.length} itens)</h4>
                                        <button
                                            onClick={() => setImportPreviewData(null)}
                                            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                        >
                                            Limpar / Trocar Arquivo
                                        </button>
                                    </div>
                                    <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50/30">
                                        <div className="max-h-[300px] overflow-y-auto">
                                            <table className="w-full text-left text-[10px]">
                                                <thead className="bg-white border-b border-slate-100 sticky top-0">
                                                    <tr>
                                                        <th className="p-4 font-black uppercase text-slate-400">Nome</th>
                                                        <th className="p-4 font-black uppercase text-slate-400">CPF/CNPJ</th>
                                                        <th className="p-4 font-black uppercase text-slate-400">Cidade</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100/50">
                                                    {importPreviewData.slice(0, 10).map((item, idx) => (
                                                        <tr key={idx} className="bg-white/40">
                                                            <td className="p-4 font-bold text-slate-700">{item.name}</td>
                                                            <td className="p-4 font-medium text-slate-500">{item.cpf_cnpj}</td>
                                                            <td className="p-4 font-medium text-slate-500">{item.city}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {importPreviewData.length > 10 && (
                                            <div className="p-4 text-center bg-white/60 text-[9px] font-bold text-slate-400 uppercase italic">
                                                ...e mais {importPreviewData.length - 10} registros
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={confirmImport}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-3"
                                    >
                                        <Save size={18} />
                                        <span>Confirmar Importação</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                                            <FileSpreadsheet size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-sm uppercase">1. Baixe o Modelo</h4>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Use nossa planilha padrão para garantir que os dados sejam importados corretamente.</p>
                                            <button
                                                onClick={handleDownloadTemplate}
                                                className="mt-4 flex items-center space-x-2 text-indigo-600 font-black text-[10px] tracking-widest uppercase hover:underline"
                                            >
                                                <Download size={14} />
                                                <span>Download Template.csv</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm shrink-0">
                                            <Upload size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 text-sm uppercase">2. Envie o Arquivo</h4>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Após preencher, selecione o arquivo CSV para processar o cadastro.</p>

                                            <label className="mt-4 block cursor-pointer">
                                                <div className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-white hover:border-indigo-400 transition-all bg-slate-100/30">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar CSV</span>
                                                    <input
                                                        type="file"
                                                        accept=".csv"
                                                        className="hidden"
                                                        onChange={handleImportCSV}
                                                    />
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => {
                                    setImportPreviewData(null);
                                    setIsImportModalOpen(false);
                                }}
                                className="px-8 py-4 font-black text-slate-400 uppercase text-[11px] tracking-widest hover:text-slate-600 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
