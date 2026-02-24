import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import {
    PackagePlus, BarChart3, Search, MoreVertical,
    Package, Edit2, Trash2, X, Info,
    Truck, Tag, History, FileText, Settings, Save, Download, Upload, FileSpreadsheet
} from "lucide-react";

export const Products: React.FC = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("estoque");
    const [salesHistory, setSalesHistory] = useState<any[]>([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importPreviewData, setImportPreviewData] = useState<any[] | null>(null);

    const initialFormData = {
        name: "",
        price: 0,
        stock: 0,
        min_stock: 0,
        sku: "",
        ean: "",
        unit: "un",
        ncm: "",
        family: "",
        type: "simple",
        observations: "",
        active: true,
        show_image: true
    };

    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const response = await api.get("/products");
            setProducts(response.data);
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
            const response = await api.get(`/products/${editingId}/history`);
            setSalesHistory(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    const filteredProducts = products.filter((p: any) => {
        const term = searchTerm.toLowerCase();
        return (
            p.name.toLowerCase().includes(term) ||
            (p.sku && p.sku.toLowerCase().includes(term)) ||
            (p.ean && p.ean.toLowerCase().includes(term))
        );
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, (formData as any)[key]);
            });

            if (imageFile) {
                data.append("image", imageFile);
            }

            if (editingId) {
                await api.put(`/products/${editingId}`, data);
                setEditingId(null);
            } else {
                await api.post("/products", data);
            }

            setFormData(initialFormData);
            setImageFile(null);
            setImagePreview(null);
            setIsModalOpen(false);
            loadProducts();
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar produto.");
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        try {
            await api.delete(`/products/${id}`);
            loadProducts();
            setActiveMenuId(null);
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "Erro ao excluir produto.";
            alert(errorMsg);
        }
    }

    function handleEdit(p: any) {
        setFormData({
            name: p.name,
            price: Number(p.price),
            stock: Number(p.stock),
            min_stock: Number(p.min_stock || 0),
            sku: p.sku || "",
            ean: p.ean || "",
            unit: p.unit || "un",
            ncm: p.ncm || "",
            family: p.family || "",
            type: p.type || "simple",
            observations: p.observations || "",
            active: p.active ?? true,
            show_image: p.show_image ?? true
        });
        setImagePreview(p.image ? `${api.defaults.baseURL}/files/${p.image}` : null);
        setEditingId(p.id);
        setIsModalOpen(true);
        setActiveMenuId(null);
    }

    function openNewProductModal() {
        setFormData(initialFormData);
        setImagePreview(null);
        setImageFile(null);
        setEditingId(null);
        setIsModalOpen(true);
    }

    function handleExportCSV() {
        if (filteredProducts.length === 0) {
            alert("Não há dados para exportar com os filtros atuais.");
            return;
        }

        const headers = ["ID", "Nome", "SKU", "EAN", "Preço", "Estoque", "Unidade", "NCM", "Família", "Status"];
        const rows = filteredProducts.map((p: any) => [
            p.id,
            p.name,
            p.sku || "",
            p.ean || "",
            Number(p.price).toFixed(2),
            p.stock,
            p.unit,
            p.ncm || "",
            p.family || "",
            p.active ? "Ativo" : "Inativo"
        ]);

        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `produtos_${new Date().toLocaleDateString('en-CA')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    function handleDownloadTemplate() {
        const headers = [
            "Código do Produto *", "Descrição do Produto *", "Código NCM *", "Código EAN (GTIN)",
            "Preço Unitário de Venda", "Unidade *", "Família de Produto", "Estoque Atual", "Estoque Mínimo"
        ];
        const csvContent = headers.join(";");
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "modelo_produtos_minierp.csv");
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
                "Código do Produto *": "sku",
                "Descrição do Produto *": "name",
                "Código NCM *": "ncm",
                "Código EAN (GTIN)": "ean",
                "Preço Unitário de Venda": "price",
                "Unidade *": "unit",
                "Família de Produto": "family",
                "Estoque Atual": "stock",
                "Estoque Mínimo": "min_stock"
            };

            const data = lines.slice(1).map(line => {
                const values = line.split(separator);
                const obj: any = {};
                headers.forEach((header, index) => {
                    const internalKey = mapping[header];
                    if (internalKey) {
                        const val = values[index]?.trim();
                        if (["price", "stock", "min_stock"].includes(internalKey)) {
                            // Robust number parsing: handle "R$ 1.234,56", "1.234,56", "1234,56"
                            const sanitized = val?.replace(/[R$\s.]/g, "").replace(",", ".") || "0";
                            obj[internalKey] = Number(sanitized);
                        } else {
                            obj[internalKey] = val;
                        }
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
            await api.post("/products/bulk", importPreviewData);
            alert(`${importPreviewData.length} produtos importados com sucesso!`);
            setImportPreviewData(null);
            setIsImportModalOpen(false);
            loadProducts();
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "Verifique o formato do arquivo.";
            alert(`Erro ao importar: ${errorMsg}`);
        }
    }

    return (
        <Layout>
            {/* Header section with Stats and Add button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 text-left">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Produtos</h1>
                    <p className="text-slate-500 mt-1 font-medium">Gerencie seu catálogo profissional de mercadorias.</p>
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
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Itens</div>
                            <div className="text-2xl font-black text-slate-900">{products.length}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vlr. Total Estoque</div>
                            <div className="text-2xl font-black text-emerald-600">R$ {products.reduce((acc, p: any) => acc + (p.price * p.stock), 0).toFixed(2)}</div>
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
                        onClick={openNewProductModal}
                        className="flex items-center space-x-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                    >
                        <PackagePlus size={18} />
                        <span>Novo Produto</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center space-x-4 flex-1 max-w-xl">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Procurar no estoque por nome, SKU ou EAN..."
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
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest px-10">Mercadoria</th>
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Referência / SKU</th>
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Preço de Venda</th>
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center px-10">Status de Estoque</th>
                                <th className="p-8"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-slate-400 font-medium italic">Nenhum produto encontrado no catálogo.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((p: any) => (
                                    <tr key={p.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-150 group ${!p.active ? 'opacity-50 grayscale' : ''}`}>
                                        <td className="p-8 px-10">
                                            <div className="flex items-center space-x-5">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-300 flex items-center justify-center font-bold text-sm overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                    {(p.image && p.show_image) ? (
                                                        <img src={`${api.defaults.baseURL}/files/${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={22} className="opacity-50" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="font-black text-slate-900 text-base">{p.name}</div>
                                                        {!p.active && <span className="bg-slate-200 text-slate-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Inativo</span>}
                                                    </div>
                                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">{p.family || 'Geral'} • {p.unit}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono bg-slate-100 inline-block px-3 py-1 rounded-lg">
                                                {p.sku || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-8 text-center text-indigo-600">
                                            <div className="text-lg font-black tracking-tight">R$ {Number(p.price).toFixed(2)}</div>
                                        </td>
                                        <td className="p-8 text-center px-10">
                                            <div className="flex flex-col items-center">
                                                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${p.stock <= p.min_stock ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {p.stock <= p.min_stock ? 'Crítico / Baixo' : 'Disponível'}
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <span className="text-sm font-black text-slate-900">{p.stock}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{p.unit}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-right relative px-10">
                                            <button
                                                onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                                                className="p-3 text-slate-300 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl"
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            {activeMenuId === p.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                                                    <div className="absolute right-10 top-12 bg-white border border-slate-100 shadow-2xl rounded-2xl py-3 w-56 z-20 animate-in fade-in zoom-in duration-200 overflow-hidden">
                                                        <button
                                                            onClick={() => handleEdit(p)}
                                                            className="w-full flex items-center space-x-3 px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left"
                                                        >
                                                            <Edit2 size={16} />
                                                            <span className="text-[10px]">Alterar</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p.id)}
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

            {/* Professional Registration Modal */}
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
                                        <Package size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Produtos</h2>
                                </div>
                                <div className="flex-1 max-w-2xl">
                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Descrição do Produto</label>
                                    <input
                                        placeholder="Preencha aqui a Descrição do Produto"
                                        className="w-full text-xl font-black text-slate-800 bg-slate-100/50 px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400 transition-all shadow-inner"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                    <p className="text-[10px] font-bold text-red-400 mt-2 ml-1">* A Descrição deve ser preenchida!</p>
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

                        {/* Modal Content - Two Columns */}
                        <div className="flex-1 overflow-hidden flex bg-white/50">
                            {/* Main Form Fields */}
                            <div className="flex-1 overflow-y-auto p-10 pt-6 space-y-10 custom-scrollbar">
                                {/* Top Grid: SKU, EAN, Unit, Price */}
                                <div className="grid grid-cols-12 gap-6 items-end">
                                    <div className="col-span-3">
                                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1 flex items-center">
                                            Código do Produto <Info size={12} className="ml-1 opacity-50" />
                                        </label>
                                        <input
                                            placeholder="SKU"
                                            className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                            value={formData.sku}
                                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Código EAN (GTIN)</label>
                                        <input
                                            placeholder="Opcional"
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all"
                                            value={formData.ean}
                                            onChange={e => setFormData({ ...formData, ean: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Unidade</label>
                                        <select
                                            className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all appearance-none cursor-pointer"
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        >
                                            <option value="un">UN • Unidade</option>
                                            <option value="pc">PC • Peça</option>
                                            <option value="kg">KG • Quilograma</option>
                                            <option value="lt">LT • Litro</option>
                                            <option value="cx">CX • Caixa</option>
                                        </select>
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Preço de Venda</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs uppercase">R$</span>
                                            <input
                                                step="0.01"
                                                type="number"
                                                className="w-full pl-10 pr-4 py-4 bg-indigo-50/30 border border-slate-200 rounded-xl text-right text-lg font-black text-indigo-600 outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-600 transition-all placeholder:text-slate-400"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* NCM and Family */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Código NCM</label>
                                        <input
                                            placeholder="Selecione ou digite aqui o NCM"
                                            className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                            value={formData.ncm}
                                            onChange={e => setFormData({ ...formData, ncm: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1">Família de Produto</label>
                                        <input
                                            placeholder="Opcional"
                                            className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
                                            value={formData.family}
                                            onChange={e => setFormData({ ...formData, family: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Tabs Section */}
                                <div>
                                    <div className="flex items-center space-x-6 border-b border-slate-100 mb-8 overflow-x-auto">
                                        {[
                                            { id: 'estoque', label: 'Estoque', icon: <BarChart3 size={14} /> },
                                            { id: 'fiscal', label: 'Fiscal', icon: <FileText size={14} /> },
                                            { id: 'fornecedores', label: 'Fornecedores', icon: <Truck size={14} /> },
                                            { id: 'historico', label: 'Histórico', icon: <History size={14} /> },
                                            { id: 'extra', label: 'Observações', icon: <Info size={14} /> },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`pb-4 text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {tab.icon}
                                                <span>{tab.label}</span>
                                                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                                        {activeTab === 'estoque' && (
                                            <div className="grid grid-cols-2 gap-10">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4 ml-1 italic">Gestão de Inventário</label>
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between p-4 bg-indigo-50/30 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-600/10 transition-all">
                                                            <div className="flex items-center space-x-3 text-slate-600">
                                                                <Package size={18} className="text-indigo-600" />
                                                                <div className="text-xs font-bold font-mono">Estoque Disponível</div>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                className="w-20 text-right bg-transparent border-none outline-none font-black text-lg text-slate-900"
                                                                value={formData.stock}
                                                                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between p-4 bg-indigo-50/30 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-600/10 transition-all">
                                                            <div className="flex items-center space-x-3 text-slate-600">
                                                                <BarChart3 size={18} className="text-amber-500" />
                                                                <div className="text-xs font-bold font-mono">Estoque Mínimo</div>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                className="w-20 text-right bg-transparent border-none outline-none font-black text-lg text-slate-900"
                                                                value={formData.min_stock}
                                                                onChange={e => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center justify-center border-l border-slate-200 pl-10 text-center">
                                                    <div className="w-28 h-28 bg-white border border-slate-100 rounded-3xl mb-4 p-2 relative group overflow-hidden">
                                                        {imagePreview ? (
                                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <Package className="w-full h-full p-4 opacity-10" />
                                                        )}
                                                        <input
                                                            type="file"
                                                            onChange={handleFileChange}
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                            accept="image/*"
                                                        />
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest text-center">
                                                            Alterar Imagem
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-2">Fotos do Produto</p>
                                                        <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 scale-90">
                                                            <span className="text-[8px] font-black text-slate-500 uppercase">Exibir</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, show_image: !formData.show_image })}
                                                                className={`w-8 h-4 rounded-full transition-all relative ${formData.show_image ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                            >
                                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.show_image ? 'left-4' : 'left-0.5'}`}></div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {activeTab === 'extra' && (
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4 ml-1 italic">Notas e Observações</label>
                                                <textarea
                                                    rows={5}
                                                    placeholder="Informações adicionais para este produto..."
                                                    className="w-full p-6 bg-indigo-50/30 border border-slate-200 rounded-3xl outline-none font-medium text-slate-600 focus:ring-2 focus:ring-indigo-600/10 transition-all resize-none shadow-sm placeholder:text-slate-400"
                                                    value={formData.observations}
                                                    onChange={e => setFormData({ ...formData, observations: e.target.value })}
                                                ></textarea>
                                            </div>
                                        )}
                                        {activeTab === 'historico' && (
                                            <div className="space-y-6">
                                                <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 ml-1 italic">Histórico de Movimentações (Vendas)</label>
                                                {salesHistory.length === 0 ? (
                                                    <div className="p-10 text-center py-20 flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 border border-slate-50">
                                                            <History size={30} />
                                                        </div>
                                                        <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Nenhuma venda registrada para este produto.</p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
                                                        <table className="w-full text-left text-xs">
                                                            <thead>
                                                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                                                    <th className="p-4 font-black text-slate-400 uppercase tracking-widest px-6">Data</th>
                                                                    <th className="p-4 font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                                                                    <th className="p-4 font-black text-slate-400 uppercase tracking-widest text-center">Quant.</th>
                                                                    <th className="p-4 font-black text-slate-400 uppercase tracking-widest text-right px-6">Vlr. Unitário</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {salesHistory.map((item: any) => (
                                                                    <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                                        <td className="p-4 px-6 font-medium text-slate-500 whitespace-nowrap">
                                                                            {new Date(item.order.created_at).toLocaleDateString('pt-BR')}
                                                                        </td>
                                                                        <td className="p-4 font-black text-slate-900">
                                                                            {item.order.client?.name || 'Cliente Geral'}
                                                                        </td>
                                                                        <td className="p-4 text-center font-black text-indigo-600">
                                                                            {item.quantity} {formData.unit}
                                                                        </td>
                                                                        <td className="p-4 text-right px-6 font-black text-slate-900 whitespace-nowrap">
                                                                            R$ {Number(item.unit_price).toFixed(2)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {['fiscal', 'fornecedores'].includes(activeTab) && (
                                            <div className="p-10 text-center py-20 flex flex-col items-center">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 border border-slate-50">
                                                    <Settings size={30} />
                                                </div>
                                                <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Painel Disponível no Próximo Módulo</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Options: Definition and Actions */}
                            <div className="w-[340px] bg-slate-50/30 p-10 border-l border-slate-100 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-[11px] font-black text-slate-900 tracking-widest uppercase mb-8 ml-1 flex items-center justify-between border-b border-slate-100 pb-2">
                                        Definição do Produto <Settings size={14} className="opacity-20" />
                                    </h3>

                                    <div className="space-y-4">
                                        {[
                                            { id: 'simple', label: 'Produto Simples', desc: 'Item unitário sem variações' },
                                            { id: 'kit', label: 'Conjunto / Kit', desc: 'Vendido como pacote de itens' },
                                            { id: 'variation', label: 'Com Variações', desc: 'Cores, tamanhos e modelos' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: opt.id as any })}
                                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${formData.type === opt.id ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-600/5 translate-x-1' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200 opacity-60'}`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className={`mt-1 h-3 w-3 rounded-full border-2 border-white ring-2 transition-all ${formData.type === opt.id ? 'bg-indigo-600 ring-indigo-600' : 'bg-slate-200 ring-slate-200'}`}></div>
                                                    <div>
                                                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{opt.label}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{opt.desc}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-10">
                                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm mb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Status do Produto</div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{formData.active ? 'Ativo no Catálogo' : 'Inativo / Oculto'}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, active: !formData.active })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${formData.active ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center space-x-3 bg-indigo-600 text-white p-5 rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-95 group"
                                    >
                                        <Save size={18} />
                                        <span>Salvar Registro</span>
                                    </button>
                                    <p className="text-[9px] text-slate-400 text-center font-bold italic opacity-60">Todos os campos obrigatórios serão validados ao salvar.</p>
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
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Produtos via CSV</p>
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
                                                        <th className="p-4 font-black uppercase text-slate-400">Descrição</th>
                                                        <th className="p-4 font-black uppercase text-slate-400">SKU</th>
                                                        <th className="p-4 font-black uppercase text-slate-400">Preço</th>
                                                        <th className="p-4 font-black uppercase text-slate-400">Estoque</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100/50">
                                                    {importPreviewData.slice(0, 10).map((item, idx) => (
                                                        <tr key={idx} className="bg-white/40">
                                                            <td className="p-4 font-bold text-slate-700">{item.name}</td>
                                                            <td className="p-4 font-medium text-slate-500">{item.sku}</td>
                                                            <td className="p-4 font-black text-indigo-600">R$ {Number(item.price).toFixed(2)}</td>
                                                            <td className="p-4 font-bold text-slate-700">{item.stock} {item.unit}</td>
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
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Use nossa planilha padrão para garantir que os itens sejam importados corretamente.</p>
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
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Após preencher, selecione o arquivo CSV para processar o inventário.</p>

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
