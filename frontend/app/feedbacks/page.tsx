"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { MessageSquare, Edit, Trash2, Plus, Eye } from "lucide-react";

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
  
  // Form state
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

  async function deletarFeedback(id: number) {
    if (!confirm("Tem certeza que deseja deletar este feedback?")) return;
    
    try {
      await api.delete(`/feedbacks/${id}`);
      carregarDados();
      alert("Feedback deletado com sucesso!");
    } catch (error) {
      alert("Erro ao deletar feedback");
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
      case "lotacao": return "bg-yellow-100 text-yellow-800";
      case "mecanica": return "bg-red-100 text-red-800";
      case "conduta": return "bg-green-100 text-green-800";
      case "acessibilidade": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Feedbacks</h1>
          <p className="text-gray-600">Avaliações dos passageiros sobre as viagens</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Feedback
        </button>
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {editingId ? "Editar Feedback" : "Novo Feedback"}
            </h2>
            
            <form onSubmit={salvarFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passageiro *
                </label>
                <select
                  value={idPassageiro}
                  onChange={(e) => setIdPassageiro(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="" className="text-gray-900">Selecione um passageiro</option>
                  {passageiros.map((p) => (
                    <option key={p.id} value={p.id} className="text-gray-900">
                      {p.nome_completo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Viagem *
                </label>
                <select
                  value={idViagem}
                  onChange={(e) => setIdViagem(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="" className="text-gray-900">Selecione uma viagem</option>
                  {viagens.map((v) => (
                    <option key={v.id} value={v.id} className="text-gray-900">
                      Viagem {v.id} - {v.horario_saida}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Ocorrência *
                </label>
                <select
                  value={tipoOcorrencia}
                  onChange={(e) => setTipoOcorrencia(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="lotacao" className="text-gray-900">Lotação</option>
                  <option value="mecanica" className="text-gray-900">Mecânica</option>
                  <option value="conduta" className="text-gray-900">Conduta</option>
                  <option value="acessibilidade" className="text-gray-900">Acessibilidade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Lotação (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={nivelLotacao}
                  onChange={(e) => setNivelLotacao(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data e Hora
                </label>
                <input
                  type="datetime-local"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para usar a data/hora atual
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Detalhes do Feedback</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium text-gray-900">{selectedFeedback.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passageiro</p>
                <p className="font-medium text-gray-900">{selectedFeedback.passageiro_nome || selectedFeedback.id_passageiro}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Viagem</p>
                <p className="font-medium text-gray-900">{selectedFeedback.id_viagem}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo de Ocorrência</p>
                <span className={`px-2 py-1 text-xs rounded-full inline-block ${getOcorrenciaColor(selectedFeedback.tipo_ocorrencia)}`}>
                  {selectedFeedback.tipo_ocorrencia}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nível de Lotação</p>
                <p className="font-medium text-gray-900">{selectedFeedback.nivel_lotacao || "Não informado"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data e Hora</p>
                <p className="font-medium text-gray-900">{formatarData(selectedFeedback.data_hora)}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Feedbacks */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Passageiro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Viagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbacks.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {f.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {f.passageiro_nome || f.id_passageiro}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {f.id_viagem}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getOcorrenciaColor(f.tipo_ocorrencia)}`}>
                      {f.tipo_ocorrencia}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatarData(f.data_hora)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => verDetalhes(f)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editarFeedback(f)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletarFeedback(f.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {feedbacks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum feedback registrado
          </div>
        )}
      </div>
    </div>
  );
}