"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { TrendingUp, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface Embarque {
  id_viagem: number;
  id_passageiro: number;
  id_parada_origem?: number;
  data_hora: string;
  tipo_pagamento: string;
  passageiro_nome?: string;
  viagem_horario?: string;
}

interface Viagem {
  id: number;
  horario_saida: string;
  codigo_rota?: string;
}

interface Passageiro {
  id: number;
  nome_completo: string;
}

export default function EmbarquesPage() {
  const [embarques, setEmbarques] = useState<Embarque[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEmbarque, setSelectedEmbarque] = useState<Embarque | null>(null);
  
  // Form state
  const [idViagem, setIdViagem] = useState("");
  const [idPassageiro, setIdPassageiro] = useState("");
  const [idParada, setIdParada] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [tipoPagamento, setTipoPagamento] = useState("cartao_estudante");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [embarquesRes, viagensRes, passageirosRes] = await Promise.all([
        api.get("/embarques"),
        api.get("/viagens"),
        api.get("/passageiros")
      ]);

      setEmbarques(embarquesRes.data);
      setViagens(viagensRes.data);
      setPassageiros(passageirosRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarEmbarque(e: React.FormEvent) {
    e.preventDefault();
    
    const payload = {
      id_viagem: parseInt(idViagem),
      id_passageiro: parseInt(idPassageiro),
      id_parada_origem: idParada ? parseInt(idParada) : null,
      data_hora: dataHora || new Date().toISOString(),
      tipo_pagamento: tipoPagamento
    };

    try {
      await api.post("/embarques", payload);
      resetForm();
      carregarDados();
      alert("Embarque registrado com sucesso!");
    } catch (error) {
      alert("Erro ao registrar embarque");
    }
  }

  async function deletarEmbarque(viagemId: number, passageiroId: number) {
    if (!confirm("Tem certeza que deseja deletar este embarque?")) return;
    
    try {
      await api.delete(`/embarques/${viagemId}/${passageiroId}`);
      carregarDados();
      alert("Embarque deletado com sucesso!");
    } catch (error) {
      alert("Erro ao deletar embarque");
    }
  }

  function verDetalhes(embarque: Embarque) {
    setSelectedEmbarque(embarque);
    setShowDetails(true);
  }

  function resetForm() {
    setIdViagem("");
    setIdPassageiro("");
    setIdParada("");
    setDataHora("");
    setTipoPagamento("cartao_estudante");
    setShowModal(false);
  }

  const getPagamentoColor = (tipo: string) => {
    switch(tipo) {
      case "cartao_estudante": return "bg-blue-100 text-blue-800";
      case "vale_transporte": return "bg-green-100 text-green-800";
      case "integracao": return "bg-purple-100 text-purple-800";
      case "gratuito": return "bg-yellow-100 text-yellow-800";
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
          <h1 className="text-2xl font-bold text-gray-800">Embarques</h1>
          <p className="text-gray-600">Registre e acompanhe os embarques de passageiros</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Novo Embarque
        </button>
      </div>

      {/* Modal de Novo Embarque */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Registrar Embarque</h2>
            
            <form onSubmit={salvarEmbarque} className="space-y-4">
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
                      {v.codigo_rota || `Viagem ${v.id}`} - {v.horario_saida}
                    </option>
                  ))}
                </select>
              </div>

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
                  Tipo de Pagamento *
                </label>
                <select
                  value={tipoPagamento}
                  onChange={(e) => setTipoPagamento(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="cartao_estudante" className="text-gray-900">Cartão Estudante</option>
                  <option value="vale_transporte" className="text-gray-900">Vale Transporte</option>
                  <option value="integracao" className="text-gray-900">Integração</option>
                  <option value="gratuito" className="text-gray-900">Gratuito</option>
                </select>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID da Parada de Origem
                </label>
                <input
                  type="number"
                  value={idParada}
                  onChange={(e) => setIdParada(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Opcional"
                />
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
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetails && selectedEmbarque && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Detalhes do Embarque</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Viagem</p>
                <p className="font-medium text-gray-900">{selectedEmbarque.id_viagem}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passageiro</p>
                <p className="font-medium text-gray-900">{selectedEmbarque.passageiro_nome || selectedEmbarque.id_passageiro}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data e Hora</p>
                <p className="font-medium text-gray-900">{formatarData(selectedEmbarque.data_hora)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo de Pagamento</p>
                <span className={`px-2 py-1 text-xs rounded-full inline-block ${getPagamentoColor(selectedEmbarque.tipo_pagamento)}`}>
                  {selectedEmbarque.tipo_pagamento}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Parada de Origem</p>
                <p className="font-medium text-gray-900">{selectedEmbarque.id_parada_origem || "Não informada"}</p>
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

      {/* Tabela de Embarques */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Viagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Passageiro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {embarques.map((e) => (
                <tr key={`${e.id_viagem}-${e.id_passageiro}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {e.id_viagem}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {e.passageiro_nome || e.id_passageiro}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatarData(e.data_hora)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPagamentoColor(e.tipo_pagamento)}`}>
                      {e.tipo_pagamento}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => verDetalhes(e)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletarEmbarque(e.id_viagem, e.id_passageiro)}
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
        
        {embarques.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum embarque registrado
          </div>
        )}
      </div>
    </div>
  );
}