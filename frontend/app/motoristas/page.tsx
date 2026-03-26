"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Edit, Trash2, Plus, X, Search } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface Motorista {
  id: number;
  nome_completo: string;
  cnh: string;
  status: string;
  telefones?: { numero: string }[];
}

export default function MotoristasPage() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [cnh, setCnh] = useState("");
  const [status, setStatus] = useState("ativo");
  const [telefone, setTelefone] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  useEffect(() => {
    carregarMotoristas();
  }, [busca, filtroStatus]);

  async function carregarMotoristas() {
    try {
      const params: Record<string, string> = {};
      if (busca) params.search = busca;
      if (filtroStatus) params.status = filtroStatus;
      const res = await api.get("/motoristas", { params });
      setMotoristas(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarMotorista(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      nome_completo: nome,
      cnh,
      status,
      telefones: telefone ? [{ numero: telefone, tipo: "pessoal" }] : []
    };

    try {
      if (editingId) {
        await api.put(`/motoristas/${editingId}`, payload);
      } else {
        await api.post("/motoristas", payload);
      }

      resetForm();
      carregarMotoristas();
    } catch (error) {
      alert("Erro ao salvar");
    }
  }

  async function confirmarDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/motoristas/${deleteTarget}`);
      carregarMotoristas();
    } catch (error) {
      alert("Erro ao deletar");
    } finally {
      setDeleteTarget(null);
    }
  }

  function editarMotorista(m: Motorista) {
    setNome(m.nome_completo);
    setCnh(m.cnh);
    setStatus(m.status);
    setTelefone(m.telefones?.[0]?.numero || "");
    setEditingId(m.id);
    setShowModal(true);
  }

  function resetForm() {
    setNome("");
    setCnh("");
    setStatus("ativo");
    setTelefone("");
    setEditingId(null);
    setShowModal(false);
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case "ativo": return "bg-emerald-50 text-emerald-700";
      case "suspenso": return "bg-red-50 text-red-700";
      case "ferias": return "bg-amber-50 text-amber-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

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
          <h1 className="text-2xl font-semibold text-slate-800">Motoristas</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie os motoristas do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Motorista
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Editar Motorista" : "Novo Motorista"}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarMotorista} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  CNH *
                </label>
                <input
                  type="text"
                  value={cnh}
                  onChange={(e) => setCnh(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  maxLength={11}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="ativo">Ativo</option>
                  <option value="suspenso">Suspenso</option>
                  <option value="ferias">Férias</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Telefone
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="(XX) XXXXX-XXXX"
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
        message="Tem certeza que deseja excluir este motorista?"
        onConfirm={confirmarDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="suspenso">Suspenso</option>
          <option value="ferias">Férias</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Nome
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                CNH
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Telefone
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {motoristas.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 text-sm text-slate-700">
                  {m.nome_completo}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">
                  {m.cnh}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(m.status)}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500">
                  {m.telefones?.[0]?.numero || "—"}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => editarMotorista(m)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(m.id)}
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
