"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, Edit, Trash2, Plus } from "lucide-react";

interface Motorista {
  id: number;
  nome_completo: string;
  cnh: string;
  status: string;
  telefones?: { numero: string }[];
}

export default function MotoristasPage() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [nome, setNome] = useState("");
  const [cnh, setCnh] = useState("");
  const [status, setStatus] = useState("ativo");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    carregarMotoristas();
  }, []);

  async function carregarMotoristas() {
    try {
      const res = await api.get("/motoristas");
      setMotoristas(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarMotorista(e: React.FormEvent) {
    e.preventDefault();
    
    const payload = {
      nome_completo: nome,
      cnh,
      status,
      telefones: telefone ? [{ numero: telefone, tipo: "pessoal" }] : []
    };

    try {
      if (editingId) {
        await api.put(`/motoristas/${editingId}`, payload);
      } else {
        await api.post("/motoristas", payload);
      }
      
      resetForm();
      carregarMotoristas();
    } catch (error) {
      alert("Erro ao salvar");
    }
  }

  async function deletarMotorista(id: number) {
    if (!confirm("Tem certeza?")) return;
    
    try {
      await api.delete(`/motoristas/${id}`);
      carregarMotoristas();
    } catch (error) {
      alert("Erro ao deletar");
    }
  }

  function editarMotorista(m: Motorista) {
    setNome(m.nome_completo);
    setCnh(m.cnh);
    setStatus(m.status);
    setTelefone(m.telefones?.[0]?.numero || "");
    setEditingId(m.id);
    setShowModal(true);
  }

  function resetForm() {
    setNome("");
    setCnh("");
    setStatus("ativo");
    setTelefone("");
    setEditingId(null);
    setShowModal(false);
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case "ativo": return "bg-green-100 text-green-800";
      case "suspenso": return "bg-red-100 text-red-800";
      case "ferias": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
          <h1 className="text-2xl font-bold text-gray-800">Motoristas</h1>
          <p className="text-gray-600">Gerencie os motoristas do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Motorista
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {editingId ? "Editar Motorista" : "Novo Motorista"}
            </h2>
            
            <form onSubmit={salvarMotorista} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNH *
                </label>
                <input
                  type="text"
                  value={cnh}
                  onChange={(e) => setCnh(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  maxLength={11}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="ativo" className="text-gray-900">Ativo</option>
                  <option value="suspenso" className="text-gray-900">Suspenso</option>
                  <option value="ferias" className="text-gray-900">Férias</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="(XX) XXXXX-XXXX"
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
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNH
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {motoristas.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {m.nome_completo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {m.cnh}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(m.status)}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {m.telefones?.[0]?.numero || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => editarMotorista(m)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletarMotorista(m.id)}
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