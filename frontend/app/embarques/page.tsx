"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Trash2, Eye, Plus, X } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

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

  const [deleteTarget, setDeleteTarget] = useState<{ viagem: number; passageiro: number } | null>(null);

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

  async function confirmarDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/embarques/${deleteTarget.viagem}/${deleteTarget.passageiro}`);
      carregarDados();
    } catch (error) {
      alert("Erro ao deletar embarque");
    } finally {
      setDeleteTarget(null);
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
      case "cartao_estudante": return "bg-sky-50 text-sky-700";
      case "vale_transporte": return "bg-emerald-50 text-emerald-700";
      case "integracao": return "bg-violet-50 text-violet-700";
      case "gratuito": return "bg-amber-50 text-amber-700";
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
          <h1 className="text-2xl font-semibold text-slate-800">Embarques</h1>
          <p className="text-sm text-slate-500 mt-1">Registre e acompanhe os embarques de passageiros</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Embarque
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">Registrar Embarque</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarEmbarque} className="space-y-4">
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
                    <option key={v.id} value={v.id}>
                      {v.codigo_rota || `Viagem ${v.id}`} - {v.horario_saida}
                    </option>
                  ))}
                </select>
              </div>

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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tipo de Pagamento *</label>
                <select
                  value={tipoPagamento}
                  onChange={(e) => setTipoPagamento(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="cartao_estudante">Cartão Estudante</option>
                  <option value="vale_transporte">Vale Transporte</option>
                  <option value="integracao">Integração</option>
                  <option value="gratuito">Gratuito</option>
                </select>
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

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">ID da Parada de Origem</label>
                <input
                  type="number"
                  value={idParada}
                  onChange={(e) => setIdParada(e.target.value)}
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
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetails && selectedEmbarque && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">Detalhes do Embarque</h2>
              <button onClick={() => setShowDetails(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Viagem</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{selectedEmbarque.id_viagem}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Passageiro</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{selectedEmbarque.passageiro_nome || selectedEmbarque.id_passageiro}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Data e Hora</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{formatarData(selectedEmbarque.data_hora)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Tipo de Pagamento</p>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded mt-1 ${getPagamentoColor(selectedEmbarque.tipo_pagamento)}`}>
                  {selectedEmbarque.tipo_pagamento}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Parada de Origem</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{selectedEmbarque.id_parada_origem || "Não informada"}</p>
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
        message="Tem certeza que deseja excluir este embarque?"
        onConfirm={confirmarDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Viagem</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Passageiro</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Data/Hora</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Pagamento</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {embarques.map((e) => (
                <tr key={`${e.id_viagem}-${e.id_passageiro}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-slate-700">
                    {e.id_viagem}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">
                    {e.passageiro_nome || e.id_passageiro}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {formatarData(e.data_hora)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getPagamentoColor(e.tipo_pagamento)}`}>
                      {e.tipo_pagamento}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => verDetalhes(e)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ viagem: e.id_viagem, passageiro: e.id_passageiro })}
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

        {embarques.length === 0 && (
          <div className="text-center py-12 text-sm text-slate-400">
            Nenhum embarque registrado
          </div>
        )}
      </div>
    </div>
  );
}
