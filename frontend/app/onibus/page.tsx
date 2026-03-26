"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Edit, Trash2, Plus, X } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface Onibus {
  id: number;
  placa: string;
  modelo_acessivel: boolean;
  capacidade_maxima: number;
}

export default function OnibusPage() {
  const [onibus, setOnibus] = useState<Onibus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const [placa, setPlaca] = useState("");
  const [acessivel, setAcessivel] = useState(true);
  const [capacidade, setCapacidade] = useState("");

  useEffect(() => {
    carregarOnibus();
  }, []);

  async function carregarOnibus() {
    try {
      const res = await api.get("/onibus");
      setOnibus(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarOnibus(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      placa,
      modelo_acessivel: acessivel,
      capacidade_maxima: parseInt(capacidade)
    };

    try {
      if (editingId) {
        await api.put(`/onibus/${editingId}`, payload);
      } else {
        await api.post("/onibus", payload);
      }

      resetForm();
      carregarOnibus();
    } catch (error) {
      alert("Erro ao salvar");
    }
  }

  async function confirmarDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/onibus/${deleteTarget}`);
      carregarOnibus();
    } catch (error) {
      alert("Erro ao deletar");
    } finally {
      setDeleteTarget(null);
    }
  }

  function editarOnibus(o: Onibus) {
    setPlaca(o.placa);
    setAcessivel(o.modelo_acessivel);
    setCapacidade(o.capacidade_maxima.toString());
    setEditingId(o.id);
    setShowModal(true);
  }

  function resetForm() {
    setPlaca("");
    setAcessivel(true);
    setCapacidade("");
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
          <h1 className="text-2xl font-semibold text-slate-800">Ônibus</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie a frota de ônibus</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Ônibus
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Editar Ônibus" : "Novo Ônibus"}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarOnibus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Placa *
                </label>
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  placeholder="ABC1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Modelo Acessível
                </label>
                <select
                  value={acessivel ? "true" : "false"}
                  onChange={(e) => setAcessivel(e.target.value === "true")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Capacidade Máxima *
                </label>
                <input
                  type="number"
                  value={capacidade}
                  onChange={(e) => setCapacidade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  min="1"
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
        message="Tem certeza que deseja excluir este ônibus?"
        onConfirm={confirmarDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Placa
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Acessível
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Capacidade
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {onibus.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 text-sm text-slate-700 font-mono">
                  {o.placa}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${o.modelo_acessivel ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {o.modelo_acessivel ? "Sim" : "Não"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500">
                  {o.capacidade_maxima} lugares
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => editarOnibus(o)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(o.id)}
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
