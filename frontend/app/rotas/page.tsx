"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Edit, Trash2, Plus, X } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface Rota {
  id: number;
  codigo_rota: string;
  nome_rota: string;
}

export default function RotasPage() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");

  useEffect(() => {
    carregarRotas();
  }, []);

  async function carregarRotas() {
    try {
      const res = await api.get("/rotas");
      setRotas(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarRota(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      codigo_rota: codigo,
      nome_rota: nome
    };

    try {
      if (editingId) {
        await api.put(`/rotas/${editingId}`, payload);
      } else {
        await api.post("/rotas", payload);
      }

      resetForm();
      carregarRotas();
    } catch (error) {
      alert("Erro ao salvar");
    }
  }

  async function confirmarDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/rotas/${deleteTarget}`);
      carregarRotas();
    } catch (error) {
      alert("Erro ao deletar");
    } finally {
      setDeleteTarget(null);
    }
  }

  function editarRota(r: Rota) {
    setCodigo(r.codigo_rota);
    setNome(r.nome_rota);
    setEditingId(r.id);
    setShowModal(true);
  }

  function resetForm() {
    setCodigo("");
    setNome("");
    setEditingId(null);
    setShowModal(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Rotas</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie as rotas do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Rota
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Editar Rota" : "Nova Rota"}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarRota} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Código da Rota *
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  placeholder="COR001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Nome da Rota *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  placeholder="Centro - Tatuapé"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition-colors"
                >
                  {editingId ? "Atualizar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        message="Tem certeza que deseja excluir esta rota?"
        onConfirm={confirmarDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Código
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Nome
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rotas.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 text-sm text-slate-700 font-mono">
                  {r.codigo_rota}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-700">
                  {r.nome_rota}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => editarRota(r)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(r.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}