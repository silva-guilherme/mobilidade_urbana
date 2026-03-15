"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Bus, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  Map,
  MapPin,
  AlertTriangle,
  Clock,
  PieChart,
  BarChart3
} from "lucide-react";
import api from "@/lib/api";

// Interfaces para tipagem dos dados
interface Motorista {
  id: number;
  status: string;
}

interface Onibus {
  id: number;
  modelo_acessivel: boolean;
}

interface Embarque {
  id_viagem: number;
  id_passageiro: number;
  data_hora: string;
}

interface Viagem {
  id: number;
  lotacao_atual: number;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, href, color, subtitle }: StatCardProps) {
  return (
    <Link href={href} className="block">
      <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="text-gray-500">{icon}</div>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    motoristas: "0",
    passageiros: "0",
    onibus: "0",
    rotas: "0",
    itinerarios: "0",
    viagens: "0",
    embarques: "0",
    feedbacks: "0"
  });

  const [infoAdicional, setInfoAdicional] = useState({
    totalEmbarquesHoje: "0",
    mediaLotacao: "0",
    motoristasAtivos: "0",
    onibusAcessiveis: "0"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar contagens principais
        const [motoristasRes, passageirosRes, onibusRes, rotasRes, itinerariosRes, viagensRes, embarquesRes, feedbacksRes] = await Promise.all([
          api.get<Motorista[]>("/motoristas"),
          api.get("/passageiros"),
          api.get<Onibus[]>("/onibus"),
          api.get("/rotas"),
          api.get("/itinerarios"),
          api.get<Viagem[]>("/viagens"),
          api.get<Embarque[]>("/embarques"),
          api.get("/feedbacks"),
        ]);

        setStats({
          motoristas: motoristasRes.data.length.toString(),
          passageiros: passageirosRes.data.length.toString(),
          onibus: onibusRes.data.length.toString(),
          rotas: rotasRes.data.length.toString(),
          itinerarios: itinerariosRes.data.length.toString(),
          viagens: viagensRes.data.length.toString(),
          embarques: embarquesRes.data.length.toString(),
          feedbacks: feedbacksRes.data.length.toString()
        });

        // Calcular informações adicionais com tipagem correta
        const motoristasAtivos = motoristasRes.data.filter((m: Motorista) => m.status === "ativo").length;
        const onibusAcessiveis = onibusRes.data.filter((o: Onibus) => o.modelo_acessivel).length;
        
        // Embarques de hoje
        const hoje = new Date().toDateString();
        const embarquesHoje = embarquesRes.data.filter((e: Embarque) => {
          const dataEmbarque = new Date(e.data_hora).toDateString();
          return dataEmbarque === hoje;
        }).length;

        // Média de lotação
        const somaLotacao = viagensRes.data.reduce((acc: number, v: Viagem) => acc + (v.lotacao_atual || 0), 0);
        const mediaLotacao = viagensRes.data.length > 0 
          ? (somaLotacao / viagensRes.data.length).toFixed(1) 
          : "0";

        setInfoAdicional({
          totalEmbarquesHoje: embarquesHoje.toString(),
          mediaLotacao,
          motoristasAtivos: motoristasAtivos.toString(),
          onibusAcessiveis: onibusAcessiveis.toString()
        });

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo ao <span className="font-semibold">SIGA</span> - Sistema Integrado de Gestão da Mobilidade
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Plataforma para gerenciamento de transporte público de Juazeiro do Norte
        </p>
      </div>

      {/* Cards Principais */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Visão Geral do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Motoristas"
            value={stats.motoristas}
            icon={<Users className="w-8 h-8" />}
            href="/motoristas"
            color="border-blue-500"
            subtitle={`${infoAdicional.motoristasAtivos} ativos`}
          />
          <StatCard
            title="Passageiros"
            value={stats.passageiros}
            icon={<Users className="w-8 h-8" />}
            href="/passageiros"
            color="border-green-500"
            subtitle="cadastrados"
          />
          <StatCard
            title="Ônibus"
            value={stats.onibus}
            icon={<Bus className="w-8 h-8" />}
            href="/onibus"
            color="border-purple-500"
            subtitle={`${infoAdicional.onibusAcessiveis} acessíveis`}
          />
          <StatCard
            title="Rotas"
            value={stats.rotas}
            icon={<Map className="w-8 h-8" />}
            href="/rotas"
            color="border-orange-500"
            subtitle="cadastradas"
          />
          <StatCard
            title="Itinerários"
            value={stats.itinerarios}
            icon={<MapPin className="w-8 h-8" />}
            href="/itinerarios"
            color="border-teal-500"
            subtitle="paradas alocadas"
          />
          <StatCard
            title="Viagens"
            value={stats.viagens}
            icon={<Calendar className="w-8 h-8" />}
            href="/viagens"
            color="border-yellow-500"
            subtitle="realizadas"
          />
          <StatCard
            title="Embarques"
            value={stats.embarques}
            icon={<TrendingUp className="w-8 h-8" />}
            href="/embarques"
            color="border-red-500"
            subtitle={`${infoAdicional.totalEmbarquesHoje} hoje`}
          />
          <StatCard
            title="Feedbacks"
            value={stats.feedbacks}
            icon={<MessageSquare className="w-8 h-8" />}
            href="/feedbacks"
            color="border-indigo-500"
            subtitle="recebidos"
          />
        </div>
      </div>

      {/* Indicadores Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Média de Lotação */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-start">
            <BarChart3 className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Média de Lotação</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{infoAdicional.mediaLotacao}</p>
              <p className="text-sm text-gray-600 mt-1">
                passageiros por viagem em média
              </p>
            </div>
          </div>
        </div>

        {/* Acessibilidade */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-start">
            <Users className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Acessibilidade</h3>
              <p className="text-gray-600 mt-1">
                {infoAdicional.onibusAcessiveis} ônibus acessíveis disponíveis
              </p>
              <Link 
                href="/onibus" 
                className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                Ver frota completa →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Link para Relatórios */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <PieChart className="w-8 h-8 mr-4" />
            <div>
              <h3 className="text-xl font-bold">Relatórios Estratégicos</h3>
              <p className="text-blue-100 mt-1">
                Acesse análises detalhadas sobre acessibilidade, rotas críticas, eficiência da frota e mais
              </p>
            </div>
          </div>
          <Link
            href="/relatorios"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition shadow-md"
          >
            Ver Todos os Relatórios
          </Link>
        </div>
      </div>
    </div>
  );
}