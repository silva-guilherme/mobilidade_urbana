"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Map, Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";

interface Rota {
  id: number;
  codigo_rota: string;
  nome_rota: string;
}

export default function RotasPage() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");

  useEffect(() => {
    carregarRotas();
  }, []);

  async function carregarRotas() {
    try {
      const res = await api.get("/rotas");
      setRotas(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarRota(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      codigo_rota: codigo,
      nome_rota: nome,
    };

    try {
      if (editingId) {
        await api.put(`/rotas/${editingId}`, payload);
      } else {
        await api.post("/rotas", payload);
      }

      resetForm();
      carregarRotas();
    } catch (error) {
      alert("Erro ao salvar");
    }
  }

  async function deletarRota(id: number) {
    if (!confirm("Tem certeza?")) return;

    try {
      await api.delete(`/rotas/${id}`);
      carregarRotas();
    } catch (error) {
      alert("Erro ao deletar");
    }
  }

  function editarRota(r: Rota) {
    setCodigo(r.codigo_rota);
    setNome(r.nome_rota);
    setEditingId(r.id);
    setShowModal(true);
  }

  function resetForm() {
    setCodigo("");
    setNome("");
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
          <h1 className="text-2xl font-bold text-gray-800">Rotas</h1>
          <p className="text-gray-600">Gerencie as rotas do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Rota
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {editingId ? "Editar Rota" : "Nova Rota"}
            </h2>

            <form onSubmit={salvarRota} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código da Rota *
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  placeholder="COR001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Rota *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  placeholder="Centro - Tatuapé"
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
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rotas.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {r.codigo_rota}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {r.nome_rota}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {/* BOTÃO DO MAPA  */}
                  <Link href={`/rotas/${r.id}/mapa`}>
                    <button className="text-green-600 hover:text-green-900 mr-3">
                      <Map className="w-4 h-4" />
                    </button>
                  </Link>

                  <button
                    onClick={() => editarRota(r)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deletarRota(r.id)}
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