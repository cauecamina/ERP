import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { PackagePlus, BarChart3, Search, MoreVertical, Package, Edit2, Trash2, X } from "lucide-react";

export const Products: React.FC = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ name: "", price: 0, stock: 0 });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        const response = await api.get("/products");
        setProducts(response.data);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("price", String(formData.price));
            data.append("stock", String(formData.stock));

            if (imageFile) {
                data.append("image", imageFile);
            }

            if (editingId) {
                await api.put(`/products/${editingId}`, data);
                setEditingId(null);
            } else {
                await api.post("/products", data);
            }

            setFormData({ name: "", price: 0, stock: 0 });
            setImageFile(null);
            setImagePreview(null);
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
        } catch (err) {
            console.error(err);
            alert("Erro ao excluir produto.");
        }
    }

    function handleEdit(p: any) {
        setFormData({ name: p.name, price: Number(p.price), stock: Number(p.stock) });
        setImagePreview(p.image ? `${api.defaults.baseURL}/files/${p.image}` : null);
        setEditingId(p.id);
        setActiveMenuId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData({ name: "", price: 0, stock: 0 });
        setImageFile(null);
        setImagePreview(null);
    }

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Catálogo de Produtos</h1>
                    <p className="text-slate-500 mt-1">Gerencie seu inventário e preços.</p>
                </div>
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar produtos..."
                        className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Form Column */}
                <div className="xl:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <PackagePlus size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingId ? "Editar Produto" : "Novo Produto"}
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
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Imagem do Produto</label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="text-slate-300" size={24} />
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Clique no quadro ao lado para selecionar uma foto do produto.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descrição do Produto</label>
                                <input
                                    placeholder="Ex: Teclado Mecânico RGB"
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preço Un.</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estoque</label>
                                    <div className="relative">
                                        <BarChart3 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button className={`w-full text-white p-5 rounded-2xl font-bold shadow-lg transition-all duration-200 mt-4 ${editingId ? 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700' : 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700'}`}>
                                {editingId ? "Salvar Alterações" : "Adicionar ao Estoque"}
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
                                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Produto</th>
                                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Price</th>
                                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center text-slate-400 font-medium italic">Nenhum produto cadastrado.</td>
                                    </tr>
                                ) : (
                                    products.map((p: any) => (
                                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-150 group">
                                            <td className="p-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm overflow-hidden">
                                                        {p.image ? (
                                                            <img src={`${api.defaults.baseURL}/files/${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={20} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{p.name}</div>
                                                        <div className="text-slate-400 text-xs font-mono">ID: {p.id.substring(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="text-sm font-black text-slate-900">R$ {Number(p.price).toFixed(2)}</div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-emerald-100 text-emerald-700' : p.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                    {p.stock} em estoque
                                                </span>
                                            </td>
                                            <td className="p-6 text-right relative">
                                                <button
                                                    onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                                >
                                                    <MoreVertical size={20} />
                                                </button>

                                                {activeMenuId === p.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                                                        <div className="absolute right-6 top-14 bg-white border border-slate-100 shadow-2xl rounded-2xl py-2 w-48 z-20 animate-in fade-in zoom-in duration-200">
                                                            <button
                                                                onClick={() => handleEdit(p)}
                                                                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all"
                                                            >
                                                                <Edit2 size={16} />
                                                                <span>Editar Produto</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(p.id)}
                                                                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                                <span>Excluir Permanentemente</span>
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
