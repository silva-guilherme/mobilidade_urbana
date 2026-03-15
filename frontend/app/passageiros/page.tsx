"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, Edit, Trash2, Plus, Mail } from "lucide-react";

interface Passageiro {
  id: number;
  nome_completo: string;
  perfil_acessibilidade: string;
  emails?: string[];
}

export default function PassageirosPage() {
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [nome, setNome] = useState("");
  const [perfil, setPerfil] = useState("nenhum");
  const [email, setEmail] = useState("");

  useEffect(() => {
    carregarPassageiros();
  }, []);

  async function carregarPassageiros() {
    try {
      const res = await api.get("/passageiros");
      setPassageiros(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarPassageiro(e: React.FormEvent) {
    e.preventDefault();
    
    const payload = {
      nome_completo: nome,
      perfil_acessibilidade: perfil,
      emails: email ? [email] : []
    };

    try {
      if (editingId) {
        await api.put(`/passageiros/${editingId}`, payload);
      } else {
        await api.post("/passageiros", payload);
      }
      
      resetForm();
      carregarPassageiros();
    } catch (error) {
      alert("Erro ao salvar");
    }
  }

  async function deletarPassageiro(id: number) {
    if (!confirm("Tem certeza?")) return;
    
    try {
      await api.delete(`/passageiros/${id}`);
      carregarPassageiros();
    } catch (error) {
      alert("Erro ao deletar");
    }
  }

  function editarPassageiro(p: Passageiro) {
    setNome(p.nome_completo);
    setPerfil(p.perfil_acessibilidade || "nenhum");
    setEmail(p.emails?.[0] || "");
    setEditingId(p.id);
    setShowModal(true);
  }

  function resetForm() {
    setNome("");
    setPerfil("nenhum");
    setEmail("");
    setEditingId(null);
    setShowModal(false);
  }

  const getPerfilColor = (perfil: string) => {
    switch(perfil) {
      case "cadeirante": return "bg-blue-100 text-blue-800";
      case "muletas": return "bg-yellow-100 text-yellow-800";
      case "visual": return "bg-purple-100 text-purple-800";
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
          <h1 className="text-2xl font-bold text-gray-800">Passageiros</h1>
          <p className="text-gray-600">Gerencie os passageiros do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Passageiro
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {editingId ? "Editar Passageiro" : "Novo Passageiro"}
            </h2>
            
            <form onSubmit={salvarPassageiro} className="space-y-4">
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
                  Perfil de Acessibilidade
                </label>
                <select
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="nenhum" className="text-gray-900">Nenhum</option>
                  <option value="cadeirante" className="text-gray-900">Cadeirante</option>
                  <option value="muletas" className="text-gray-900">Muletas</option>
                  <option value="visual" className="text-gray-900">Visual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="email@exemplo.com"
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
                Perfil
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {passageiros.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {p.nome_completo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPerfilColor(p.perfil_acessibilidade)}`}>
                    {p.perfil_acessibilidade || "nenhum"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {p.emails?.[0] || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => editarPassageiro(p)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletarPassageiro(p.id)}
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