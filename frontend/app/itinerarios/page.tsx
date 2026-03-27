"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Trash2, Plus, X, ArrowUp } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

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
  const [filtroRota, setFiltroRota] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<{ rota: number; parada: number } | null>(null);

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

  async function confirmarDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/itinerarios/${deleteTarget.rota}/${deleteTarget.parada}`);
      carregarItinerarios(filtroRota ? parseInt(filtroRota) : undefined);
    } catch (error) {
      alert("Erro ao remover parada");
    } finally {
      setDeleteTarget(null);
    }
  }

  function resetForm() {
    setIdRota("");
    setIdParada("");
    setOrdem("");
    setTempo("");
    setShowModal(false);
  }

  const getStatusColor = (status?: string) => {
    switch(status) {
      case "acessivel": return "bg-emerald-50 text-emerald-700";
      case "inacessivel": return "bg-red-50 text-red-700";
      case "manutencao": return "bg-amber-50 text-amber-700";
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
          <h1 className="text-2xl font-semibold text-slate-800">Itinerários</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie as paradas de cada rota</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Parada à Rota
        </button>
      </div>

      {/* Filtro */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          Filtrar por Rota
        </label>
        <select
          value={filtroRota}
          onChange={(e) => setFiltroRota(e.target.value)}
          className="w-full md:w-96 px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">Todas as rotas</option>
          {rotas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.codigo_rota} - {r.nome_rota}
            </option>
          ))}
        </select>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">Adicionar Parada à Rota</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarItinerario} className="space-y-4">
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Parada *</label>
                <select
                  value={idParada}
                  onChange={(e) => setIdParada(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma parada</option>
                  {paradas.map((p) => (
                    <option key={p.id} value={p.id}>
                      Parada #{p.id} - {p.status_acessibilidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ordem na Rota *</label>
                <input
                  type="number"
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  min="1"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tempo Estimado (minutos)</label>
                <input
                  type="number"
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Opcional"
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
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        message="Remover esta parada da rota?"
        onConfirm={confirmarDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Rota</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Parada</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ordem</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Tempo Est.</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status Parada</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itinerarios.map((item, index) => (
                <tr key={`${item.id_rota}-${item.id_parada}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-slate-700 font-mono">
                    {item.codigo_rota || item.id_rota}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    Parada #{item.id_parada}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">
                    <div className="flex items-center gap-1">
                      {item.ordem_parada}
                      {index > 0 && itinerarios[index-1]?.id_rota === item.id_rota && (
                        <ArrowUp className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {item.tempo_estimado || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(item.parada_status)}`}>
                      {item.parada_status || "N/A"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setDeleteTarget({ rota: item.id_rota, parada: item.id_parada })}
                      className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
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
          <div className="text-center py-12 text-sm text-slate-400">
            Nenhum itinerário encontrado
          </div>
        )}
      </div>
    </div>
  );
}
