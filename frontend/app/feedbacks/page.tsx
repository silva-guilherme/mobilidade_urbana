"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Edit, Trash2, Plus, Eye, X } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface Feedback {
  id: number;
  id_passageiro: number;
  id_viagem: number;
  tipo_ocorrencia: string;
  nivel_lotacao?: number;
  data_hora: string;
  passageiro_nome?: string;
  viagem_horario?: string;
}

interface Passageiro {
  id: number;
  nome_completo: string;
}

interface Viagem {
  id: number;
  horario_saida: string;
}

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const [idPassageiro, setIdPassageiro] = useState("");
  const [idViagem, setIdViagem] = useState("");
  const [tipoOcorrencia, setTipoOcorrencia] = useState("lotacao");
  const [nivelLotacao, setNivelLotacao] = useState("");
  const [dataHora, setDataHora] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [feedbacksRes, passageirosRes, viagensRes] = await Promise.all([
        api.get("/feedbacks"),
        api.get("/passageiros"),
        api.get("/viagens")
      ]);

      setFeedbacks(feedbacksRes.data);
      setPassageiros(passageirosRes.data);
      setViagens(viagensRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarFeedback(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      id_passageiro: parseInt(idPassageiro),
      id_viagem: parseInt(idViagem),
      tipo_ocorrencia: tipoOcorrencia,
      nivel_lotacao: nivelLotacao ? parseInt(nivelLotacao) : null,
      data_hora: dataHora || new Date().toISOString()
    };

    try {
      if (editingId) {
        await api.put(`/feedbacks/${editingId}`, payload);
        alert("Feedback atualizado com sucesso!");
      } else {
        await api.post("/feedbacks", payload);
        alert("Feedback registrado com sucesso!");
      }

      resetForm();
      carregarDados();
    } catch (error) {
      alert("Erro ao salvar feedback");
    }
  }

  async function confirmarDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/feedbacks/${deleteTarget}`);
      carregarDados();
    } catch (error) {
      alert("Erro ao deletar feedback");
    } finally {
      setDeleteTarget(null);
    }
  }

  function editarFeedback(f: Feedback) {
    setIdPassageiro(f.id_passageiro.toString());
    setIdViagem(f.id_viagem.toString());
    setTipoOcorrencia(f.tipo_ocorrencia);
    setNivelLotacao(f.nivel_lotacao?.toString() || "");
    setDataHora(f.data_hora.slice(0, 16));
    setEditingId(f.id);
    setShowModal(true);
  }

  function verDetalhes(f: Feedback) {
    setSelectedFeedback(f);
    setShowDetails(true);
  }

  function resetForm() {
    setIdPassageiro("");
    setIdViagem("");
    setTipoOcorrencia("lotacao");
    setNivelLotacao("");
    setDataHora("");
    setEditingId(null);
    setShowModal(false);
  }

  const getOcorrenciaColor = (tipo: string) => {
    switch(tipo) {
      case "lotacao": return "bg-amber-50 text-amber-700";
      case "mecanica": return "bg-red-50 text-red-700";
      case "conduta": return "bg-emerald-50 text-emerald-700";
      case "acessibilidade": return "bg-sky-50 text-sky-700";
      default: return "bg-slate-100 text-slate-500";
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
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
          <h1 className="text-2xl font-semibold text-slate-800">Feedbacks</h1>
          <p className="text-sm text-slate-500 mt-1">Avaliações dos passageiros sobre as viagens</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Feedback
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Editar Feedback" : "Novo Feedback"}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Passageiro *</label>
                <select
                  value={idPassageiro}
                  onChange={(e) => setIdPassageiro(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um passageiro</option>
                  {passageiros.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome_completo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Viagem *</label>
                <select
                  value={idViagem}
                  onChange={(e) => setIdViagem(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma viagem</option>
                  {viagens.map((v) => (
                    <option key={v.id} value={v.id}>Viagem {v.id} - {v.horario_saida}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tipo de Ocorrência *</label>
                <select
                  value={tipoOcorrencia}
                  onChange={(e) => setTipoOcorrencia(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="lotacao">Lotação</option>
                  <option value="mecanica">Mecânica</option>
                  <option value="conduta">Conduta</option>
                  <option value="acessibilidade">Acessibilidade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Nível de Lotação (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={nivelLotacao}
                  onChange={(e) => setNivelLotacao(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Deixe em branco para usar a data/hora atual
                </p>
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
                  {editingId ? "Atualizar" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetails && selectedFeedback && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">Detalhes do Feedback</h2>
              <button onClick={() => setShowDetails(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">ID</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{selectedFeedback.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Passageiro</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{selectedFeedback.passageiro_nome || selectedFeedback.id_passageiro}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Viagem</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{selectedFeedback.id_viagem}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Tipo de Ocorrência</p>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded mt-1 ${getOcorrenciaColor(selectedFeedback.tipo_ocorrencia)}`}>
                  {selectedFeedback.tipo_ocorrencia}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Nível de Lotação</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{selectedFeedback.nivel_lotacao || "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Data e Hora</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{formatarData(selectedFeedback.data_hora)}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        message="Tem certeza que deseja excluir este feedback?"
        onConfirm={confirmarDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Passageiro</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Viagem</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Tipo</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Data/Hora</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feedbacks.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">
                    {f.id}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">
                    {f.passageiro_nome || f.id_passageiro}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {f.id_viagem}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getOcorrenciaColor(f.tipo_ocorrencia)}`}>
                      {f.tipo_ocorrencia}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {formatarData(f.data_hora)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => verDetalhes(f)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => editarFeedback(f)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(f.id)}
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

        {feedbacks.length === 0 && (
          <div className="text-center py-12 text-sm text-slate-400">
            Nenhum feedback registrado
          </div>
        )}
      </div>
    </div>
  );
}
