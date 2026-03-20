"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Edit, Trash2, Plus, X } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface Passageiro {
  id: number;
  nome_completo: string;
  perfil_acessibilidade: string;
  emails?: string[];
}

export default function PassageirosPage() {
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [perfil, setPerfil] = useState("nenhum");
  const [email, setEmail] = useState("");

  useEffect(() => {
    carregarPassageiros();
  }, []);

  async function carregarPassageiros() {
    try {
      const res = await api.get("/passageiros");
      setPassageiros(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarPassageiro(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      nome_completo: nome,
      perfil_acessibilidade: perfil,
      emails: email ? [email] : []
    };

    try {
      if (editingId) {
        await api.put(`/passageiros/${editingId}`, payload);
      } else {
        await api.post("/passageiros", payload);
      }

      resetForm();
      carregarPassageiros();
    } catch (error) {
      alert("Erro ao salvar");
    }
  }

  async function confirmarDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/passageiros/${deleteTarget}`);
      carregarPassageiros();
    } catch (error) {
      alert("Erro ao deletar");
    } finally {
      setDeleteTarget(null);
    }
  }

  function editarPassageiro(p: Passageiro) {
    setNome(p.nome_completo);
    setPerfil(p.perfil_acessibilidade || "nenhum");
    setEmail(p.emails?.[0] || "");
    setEditingId(p.id);
    setShowModal(true);
  }

  function resetForm() {
    setNome("");
    setPerfil("nenhum");
    setEmail("");
    setEditingId(null);
    setShowModal(false);
  }

  const getPerfilColor = (perfil: string) => {
    switch(perfil) {
      case "cadeirante": return "bg-sky-50 text-sky-700";
      case "muletas": return "bg-amber-50 text-amber-700";
      case "visual": return "bg-violet-50 text-violet-700";
      default: return "bg-slate-100 text-slate-500";
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
          <h1 className="text-2xl font-semibold text-slate-800">Passageiros</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie os passageiros do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Passageiro
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Editar Passageiro" : "Novo Passageiro"}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarPassageiro} className="space-y-4">
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
                  Perfil de Acessibilidade
                </label>
                <select
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="nenhum">Nenhum</option>
                  <option value="cadeirante">Cadeirante</option>
                  <option value="muletas">Muletas</option>
                  <option value="visual">Visual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
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
        message="Tem certeza que deseja excluir este passageiro?"
        onConfirm={confirmarDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Nome
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Perfil
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Email
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {passageiros.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 text-sm text-slate-700">
                  {p.nome_completo}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getPerfilColor(p.perfil_acessibilidade)}`}>
                    {p.perfil_acessibilidade || "nenhum"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500">
                  {p.emails?.[0] || "—"}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => editarPassageiro(p)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p.id)}
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
