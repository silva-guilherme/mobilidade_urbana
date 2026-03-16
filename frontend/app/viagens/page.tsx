"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Calendar, Edit, Trash2, Plus } from "lucide-react";

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
  
  // Form state
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

  async function deletarViagem(id: number) {
    if (!confirm("Tem certeza?")) return;
    
    try {
      await api.delete(`/viagens/${id}`);
      carregarDados();
    } catch (error) {
      alert("Erro ao deletar");
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Viagens</h1>
          <p className="text-gray-600">Gerencie as viagens do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Viagem
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {editingId ? "Editar Viagem" : "Nova Viagem"}
            </h2>
            
            <form onSubmit={salvarViagem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rota *
                </label>
                <select
                  value={idRota}
                  onChange={(e) => setIdRota(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="" className="text-gray-900">Selecione uma rota</option>
                  {rotas.map((r) => (
                    <option key={r.id} value={r.id} className="text-gray-900">
                      {r.codigo_rota} - {r.nome_rota}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ônibus *
                </label>
                <select
                  value={idOnibus}
                  onChange={(e) => setIdOnibus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="" className="text-gray-900">Selecione um ônibus</option>
                  {onibus.map((o) => (
                    <option key={o.id} value={o.id} className="text-gray-900">
                      {o.placa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motorista *
                </label>
                <select
                  value={idMotorista}
                  onChange={(e) => setIdMotorista(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="" className="text-gray-900">Selecione um motorista</option>
                  {motoristas.map((m) => (
                    <option key={m.id} value={m.id} className="text-gray-900">
                      {m.nome_completo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário de Saída *
                </label>
                <input
                  type="time"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lotação Atual
                </label>
                <input
                  type="number"
                  value={lotacao}
                  onChange={(e) => setLotacao(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  min="0"
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
                  {editingId ? "Atualizar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ônibus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motorista
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lotação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {viagens.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {v.codigo_rota || v.id_rota}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {v.onibus_placa || v.id_onibus}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {v.motorista_nome || v.id_motorista}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {v.horario_saida}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    v.lotacao_atual > 50 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                  }`}>
                    {v.lotacao_atual} lugares
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => editarViagem(v)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletarViagem(v.id)}
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
    </div>
  );
}