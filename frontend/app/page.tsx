"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Bus,
  Calendar,
  ArrowRightLeft,
  MessageCircle,
  Route,
  MapPinned,
  UserCheck,
  BarChart3,
  TrendingUp,
  Accessibility,
} from "lucide-react";
import api from "@/lib/api";

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

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    motoristas: 0,
    passageiros: 0,
    onibus: 0,
    rotas: 0,
    itinerarios: 0,
    viagens: 0,
    embarques: 0,
    feedbacks: 0,
  });

  const [info, setInfo] = useState({
    embarquesHoje: 0,
    mediaLotacao: "0",
    motoristasAtivos: 0,
    onibusAcessiveis: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
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
          motoristas: motoristasRes.data.length,
          passageiros: passageirosRes.data.length,
          onibus: onibusRes.data.length,
          rotas: rotasRes.data.length,
          itinerarios: itinerariosRes.data.length,
          viagens: viagensRes.data.length,
          embarques: embarquesRes.data.length,
          feedbacks: feedbacksRes.data.length,
        });

        const motoristasAtivos = motoristasRes.data.filter((m: Motorista) => m.status === "ativo").length;
        const onibusAcessiveis = onibusRes.data.filter((o: Onibus) => o.modelo_acessivel).length;

        const hoje = new Date().toDateString();
        const embarquesHoje = embarquesRes.data.filter((e: Embarque) => {
          return new Date(e.data_hora).toDateString() === hoje;
        }).length;

        const somaLotacao = viagensRes.data.reduce((acc: number, v: Viagem) => acc + (v.lotacao_atual || 0), 0);
        const mediaLotacao = viagensRes.data.length > 0
          ? (somaLotacao / viagensRes.data.length).toFixed(1)
          : "0";

        setInfo({ embarquesHoje, mediaLotacao, motoristasAtivos, onibusAcessiveis });
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
        <div className="w-6 h-6 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Visão geral do transporte público — Juazeiro do Norte
        </p>
      </div>

      {/* Destaques — números grandes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DestaquCard
          label="Viagens"
          valor={stats.viagens}
          detalhe={`${info.mediaLotacao} pass. em média`}
          icon={<Calendar className="w-5 h-5" />}
          href="/viagens"
        />
        <DestaquCard
          label="Embarques"
          valor={stats.embarques}
          detalhe={`${info.embarquesHoje} hoje`}
          icon={<ArrowRightLeft className="w-5 h-5" />}
          href="/embarques"
        />
        <DestaquCard
          label="Passageiros"
          valor={stats.passageiros}
          detalhe="cadastrados"
          icon={<Users className="w-5 h-5" />}
          href="/passageiros"
        />
        <DestaquCard
          label="Feedbacks"
          valor={stats.feedbacks}
          detalhe="recebidos"
          icon={<MessageCircle className="w-5 h-5" />}
          href="/feedbacks"
        />
      </div>

      {/* Grid secundário — cadastros + indicadores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cadastros */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
            Cadastros
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CadastroItem
              href="/motoristas"
              icon={<UserCheck className="w-4 h-4" />}
              label="Motoristas"
              valor={stats.motoristas}
              sub={`${info.motoristasAtivos} ativos`}
            />
            <CadastroItem
              href="/onibus"
              icon={<Bus className="w-4 h-4" />}
              label="Ônibus"
              valor={stats.onibus}
              sub={`${info.onibusAcessiveis} acessíveis`}
            />
            <CadastroItem
              href="/rotas"
              icon={<Route className="w-4 h-4" />}
              label="Rotas"
              valor={stats.rotas}
            />
            <CadastroItem
              href="/itinerarios"
              icon={<MapPinned className="w-4 h-4" />}
              label="Itinerários"
              valor={stats.itinerarios}
              sub="paradas alocadas"
            />
          </div>
        </div>

        {/* Indicadores */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">Lotação média</span>
            </div>
            <p className="text-3xl font-semibold text-slate-800">{info.mediaLotacao}</p>
            <p className="text-xs text-slate-400 mt-1">passageiros por viagem</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-md bg-sky-50 flex items-center justify-center">
                <Accessibility className="w-4 h-4 text-sky-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">Acessibilidade</span>
            </div>
            <p className="text-3xl font-semibold text-slate-800">{info.onibusAcessiveis}</p>
            <p className="text-xs text-slate-400 mt-1">
              de {stats.onibus} ônibus acessíveis
            </p>
          </div>
        </div>
      </div>

      {/* Relatórios */}
      <Link
        href="/relatorios"
        className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-5 group hover:border-emerald-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Relatórios</p>
            <p className="text-xs text-slate-400">
              Acessibilidade, rotas críticas, horários de pico e mais
            </p>
          </div>
        </div>
        <span className="text-sm text-slate-400 group-hover:text-emerald-500 transition-colors">
          Ver todos &rarr;
        </span>
      </Link>
    </div>
  );
}

/* ── Componentes locais ─────────────────────────────── */

function DestaquCard({
  label,
  valor,
  detalhe,
  icon,
  href,
}: {
  label: string;
  valor: number;
  detalhe: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white border border-slate-200 rounded-lg p-4 group-hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </span>
          <span className="text-slate-400">{icon}</span>
        </div>
        <p className="text-2xl font-semibold text-slate-800">{valor}</p>
        <p className="text-xs text-slate-400 mt-1">{detalhe}</p>
      </div>
    </Link>
  );
}

function CadastroItem({
  href,
  icon,
  label,
  valor,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  valor: number;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-3 rounded-md hover:bg-slate-50 transition-colors text-center"
    >
      <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-700">{valor}</p>
        <p className="text-xs text-slate-500">{label}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </Link>
  );
}
