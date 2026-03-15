"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Map, Edit, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";

interface Itinerario {
  id_rota: number;
  id_parada: number;
  ordem_parada: number;
  tempo_estimado?: string;
  codigo_rota?: string;
  nome_rota?: string;
  parada_lat?: number;
  parada_lon?: number;
  parada_status?: string;
}

interface Rota {
  id: number;
  codigo_rota: string;
  nome_rota: string;
}

interface Parada {
  id: number;
  latitude: number;
  longitude: number;
  status_acessibilidade: string;
}

export default function ItinerariosPage() {
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [rotaSelecionada, setRotaSelecionada] = useState<string>("");
  const [filtroRota, setFiltroRota] = useState<string>("");
  
  // Form state
  const [idRota, setIdRota] = useState("");
  const [idParada, setIdParada] = useState("");
  const [ordem, setOrdem] = useState("");
  const [tempo, setTempo] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (filtroRota) {
      carregarItinerarios(parseInt(filtroRota));
    } else {
      carregarItinerarios();
    }
  }, [filtroRota]);

  async function carregarDados() {
    try {
      const [rotasRes, paradasRes] = await Promise.all([
        api.get("/rotas"),
        api.get("/paradas")
      ]);

      setRotas(rotasRes.data);
      setParadas(paradasRes.data);
      await carregarItinerarios();
    } catch (error) {
      console.error(error);
    }
  }

  async function carregarItinerarios(rotaId?: number) {
    try {
      const params = rotaId ? { rota_id: rotaId } : {};
      const res = await api.get("/itinerarios", { params });
      setItinerarios(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarItinerario(e: React.FormEvent) {
    e.preventDefault();
    
    const payload = {
      id_rota: parseInt(idRota),
      id_parada: parseInt(idParada),
      ordem_parada: parseInt(ordem),
      tempo_estimado: tempo || null
    };

    try {
      await api.post("/itinerarios", payload);
      resetForm();
      carregarItinerarios(filtroRota ? parseInt(filtroRota) : undefined);
      alert("Parada adicionada à rota com sucesso!");
    } catch (error) {
      alert("Erro ao adicionar parada");
    }
  }

  async function deletarItinerario(idRota: number, idParada: number) {
    if (!confirm("Remover esta parada da rota?")) return;
    
    try {
      await api.delete(`/itinerarios/${idRota}/${idParada}`);
      carregarItinerarios(filtroRota ? parseInt(filtroRota) : undefined);
      alert("Parada removida com sucesso!");
    } catch (error) {
      alert("Erro ao remover parada");
    }
  }

  function resetForm() {
    setIdRota("");
    setIdParada("");
    setOrdem("");
    setTempo("");
    setShowModal(false);
  }

  function getNomeRota(id: number): string {
    const rota = rotas.find(r => r.id === id);
    return rota ? `${rota.codigo_rota} - ${rota.nome_rota}` : `Rota ${id}`;
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
          <h1 className="text-2xl font-bold text-gray-800">Itinerários</h1>
          <p className="text-gray-600">Gerencie as paradas de cada rota</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Parada à Rota
        </button>
      </div>

      {/* Filtro por Rota */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por Rota
        </label>
        <select
          value={filtroRota}
          onChange={(e) => setFiltroRota(e.target.value)}
          className="w-full md:w-96 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="" className="text-gray-900">Todas as rotas</option>
          {rotas.map((r) => (
            <option key={r.id} value={r.id} className="text-gray-900">
              {r.codigo_rota} - {r.nome_rota}
            </option>
          ))}
        </select>
      </div>

      {/* Modal de Novo Itinerário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Adicionar Parada à Rota</h2>
            
            <form onSubmit={salvarItinerario} className="space-y-4">
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
                  Parada *
                </label>
                <select
                  value={idParada}
                  onChange={(e) => setIdParada(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="" className="text-gray-900">Selecione uma parada</option>
                  {paradas.map((p) => (
                    <option key={p.id} value={p.id} className="text-gray-900">
                      Parada #{p.id} - {p.status_acessibilidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem na Rota *
                </label>
                <input
                  type="number"
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  min="1"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo Estimado (minutos)
                </label>
                <input
                  type="number"
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
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
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela de Itinerários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tempo Estimado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Parada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {itinerarios.map((item, index) => (
                <tr key={`${item.id_rota}-${item.id_parada}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.codigo_rota || item.id_rota}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Parada #{item.id_parada}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {item.ordem_parada}
                      {index > 0 && itinerarios[index-1]?.id_rota === item.id_rota && (
                        <ArrowUp className="w-4 h-4 ml-2 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.tempo_estimado || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.parada_status === 'acessivel' ? 'bg-green-100 text-green-800' :
                      item.parada_status === 'inacessivel' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.parada_status || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => deletarItinerario(item.id_rota, item.id_parada)}
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
        
        {itinerarios.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum itinerário encontrado
          </div>
        )}
      </div>
    </div>
  );
}