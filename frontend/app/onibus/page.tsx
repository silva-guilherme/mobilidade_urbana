"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Bus, Edit, Trash2, Plus } from "lucide-react";

interface Onibus {
  id: number;
  placa: string;
  modelo_acessivel: boolean;
  capacidade_maxima: number;
}

export default function OnibusPage() {
  const [onibus, setOnibus] = useState<Onibus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [placa, setPlaca] = useState("");
  const [acessivel, setAcessivel] = useState(true);
  const [capacidade, setCapacidade] = useState("");

  useEffect(() => {
    carregarOnibus();
  }, []);

  async function carregarOnibus() {
    try {
      const res = await api.get("/onibus");
      setOnibus(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarOnibus(e: React.FormEvent) {
    e.preventDefault();
    
    const payload = {
      placa,
      modelo_acessivel: acessivel,
      capacidade_maxima: parseInt(capacidade)
    };

    try {
      if (editingId) {
        await api.put(`/onibus/${editingId}`, payload);
      } else {
        await api.post("/onibus", payload);
      }
      
      resetForm();
      carregarOnibus();
    } catch (error) {
      alert("Erro ao salvar");
    }
  }

  async function deletarOnibus(id: number) {
    if (!confirm("Tem certeza?")) return;
    
    try {
      await api.delete(`/onibus/${id}`);
      carregarOnibus();
    } catch (error) {
      alert("Erro ao deletar");
    }
  }

  function editarOnibus(o: Onibus) {
    setPlaca(o.placa);
    setAcessivel(o.modelo_acessivel);
    setCapacidade(o.capacidade_maxima.toString());
    setEditingId(o.id);
    setShowModal(true);
  }

  function resetForm() {
    setPlaca("");
    setAcessivel(true);
    setCapacidade("");
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
          <h1 className="text-2xl font-bold text-gray-800">Ônibus</h1>
          <p className="text-gray-600">Gerencie a frota de ônibus</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Ônibus
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {editingId ? "Editar Ônibus" : "Novo Ônibus"}
            </h2>
            
            <form onSubmit={salvarOnibus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa *
                </label>
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  placeholder="ABC1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo Acessível
                </label>
                <select
                  value={acessivel ? "true" : "false"}
                  onChange={(e) => setAcessivel(e.target.value === "true")}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="true" className="text-gray-900">Sim</option>
                  <option value="false" className="text-gray-900">Não</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidade Máxima *
                </label>
                <input
                  type="number"
                  value={capacidade}
                  onChange={(e) => setCapacidade(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  min="1"
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
                Placa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acessível
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {onibus.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {o.placa}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${o.modelo_acessivel ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {o.modelo_acessivel ? "Sim" : "Não"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {o.capacidade_maxima} lugares
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => editarOnibus(o)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletarOnibus(o.id)}
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