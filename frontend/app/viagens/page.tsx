"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Edit, Trash2, Plus, X } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface Viagem {
  id: number;
  id_rota: number;
  id_onibus: number;
  id_motorista: number;
  horario_saida: string;
  lotacao_atual: number;
  codigo_rota?: string;
  onibus_placa?: string;
  motorista_nome?: string;
}

interface Rota {
  id: number;
  codigo_rota: string;
  nome_rota: string;
}

interface Onibus {
  id: number;
  placa: string;
}

interface Motorista {
  id: number;
  nome_completo: string;
}

export default function ViagensPage() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [onibus, setOnibus] = useState<Onibus[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const [idRota, setIdRota] = useState("");
  const [idOnibus, setIdOnibus] = useState("");
  const [idMotorista, setIdMotorista] = useState("");
  const [horario, setHorario] = useState("");
  const [lotacao, setLotacao] = useState("0");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [viagensRes, rotasRes, onibusRes, motoristasRes] = await Promise.all([
        api.get("/viagens"),
        api.get("/rotas"),
        api.get("/onibus"),
        api.get("/motoristas")
      ]);

      setViagens(viagensRes.data);
      setRotas(rotasRes.data);
      setOnibus(onibusRes.data);
      setMotoristas(motoristasRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarViagem(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      id_rota: parseInt(idRota),
      id_onibus: parseInt(idOnibus),
      id_motorista: parseInt(idMotorista),
      horario_saida: horario,
      lotacao_atual: parseInt(lotacao)
    };

    try {
      if (editingId) {
        await api.put(`/viagens/${editingId}`, payload);
      } else {
        await api.post("/viagens", payload);
      }

      resetForm();
      carregarDados();
    } catch (error) {
      alert("Erro ao salvar");
    }
  }

  async function confirmarDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/viagens/${deleteTarget}`);
      carregarDados();
    } catch (error) {
      alert("Erro ao deletar");
    } finally {
      setDeleteTarget(null);
    }
  }

  function editarViagem(v: Viagem) {
    setIdRota(v.id_rota.toString());
    setIdOnibus(v.id_onibus.toString());
    setIdMotorista(v.id_motorista.toString());
    setHorario(v.horario_saida);
    setLotacao(v.lotacao_atual.toString());
    setEditingId(v.id);
    setShowModal(true);
  }

  function resetForm() {
    setIdRota("");
    setIdOnibus("");
    setIdMotorista("");
    setHorario("");
    setLotacao("0");
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
          <h1 className="text-2xl font-semibold text-slate-800">Viagens</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie as viagens do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Viagem
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Editar Viagem" : "Nova Viagem"}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarViagem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Rota *</label>
                <select
                  value={idRota}
                  onChange={(e) => setIdRota(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma rota</option>
                  {rotas.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.codigo_rota} - {r.nome_rota}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ônibus *</label>
                <select
                  value={idOnibus}
                  onChange={(e) => setIdOnibus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um ônibus</option>
                  {onibus.map((o) => (
                    <option key={o.id} value={o.id}>{o.placa}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Motorista *</label>
                <select
                  value={idMotorista}
                  onChange={(e) => setIdMotorista(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um motorista</option>
                  {motoristas.map((m) => (
                    <option key={m.id} value={m.id}>{m.nome_completo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Horário de Saída *</label>
                <input
                  type="time"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lotação Atual</label>
                <input
                  type="number"
                  value={lotacao}
                  onChange={(e) => setLotacao(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  min="0"
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
        message="Tem certeza que deseja excluir esta viagem?"
        onConfirm={confirmarDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Rota</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ônibus</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Motorista</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Horário</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Lotação</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {viagens.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 text-sm text-slate-700 font-mono">
                  {v.codigo_rota || v.id_rota}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">
                  {v.onibus_placa || v.id_onibus}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-700">
                  {v.motorista_nome || v.id_motorista}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500">
                  {v.horario_saida}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                    v.lotacao_atual > 50 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {v.lotacao_atual} pass.
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => editarViagem(v)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(v.id)}
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
