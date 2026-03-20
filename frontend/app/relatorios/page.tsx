"use client";

import { useState } from "react";
import api from "@/lib/api";
import {
  Accessibility,
  Star,
  AlertTriangle,
  Bus,
  Users,
  Clock,
  MessageCircle,
  TrendingUp,
  PieChart,
  MapPin,
  X,
  ArrowRight,
} from "lucide-react";
import { AxiosError } from "axios";

/* ── Interfaces ─────────────────────────────────────── */

interface RelatorioAcessibilidade {
  perfil_acessibilidade: string;
  total_passageiros: number;
  total_embarques: number;
  embarques_paradas_acessiveis: number;
  percentual_acessivel: number;
}

interface MotoristaDestaque {
  id: number;
  nome_completo: string;
  cnh: string;
  total_viagens: number;
  total_feedbacks: number;
  percentual_feedbacks_positivos: number;
  rotas_diferentes: number;
}

interface RotaCritica {
  id: number;
  codigo_rota: string;
  nome_rota: string;
  total_viagens: number;
  viagens_criticas: number;
  percentual_critico: number;
  lotacao_media: number;
  pico_maximo: number;
}

interface EficienciaFrota {
  id: number;
  placa: string;
  acessivel: string;
  capacidade_maxima: number;
  viagens_realizadas: number;
  passageiros_transportados: number;
  ocupacao_media: number;
  percentual_ocupacao_medio: number;
}

interface PassageiroFrequente {
  id: number;
  nome_completo: string;
  perfil_acessibilidade: string;
  total_viagens: number;
  total_feedbacks: number;
  taxa_feedback: number;
  feedbacks_negativos: number;
  feedbacks_positivos: number;
}

interface HorarioPico {
  periodo: string;
  total_viagens: number;
  passageiros_transportados: number;
  lotacao_media: number;
  pico_lotacao: number;
  rotas_ativas: number;
}

interface FeedbackDetalhado {
  feedback_id: number;
  data_feedback: string;
  tipo_ocorrencia: string;
  lotacao_informada: number;
  passageiro: string;
  perfil_acessibilidade: string;
  horario_viagem: string;
  lotacao_real: number;
  nome_rota: string;
  motorista: string;
  onibus_placa: string;
}

interface TendenciaUso {
  mes: string;
  total_embarques: number;
  passageiros_unicos: number;
  viagens_utilizadas: number;
  motoristas_ativos: number;
  onibus_ativos: number;
  embarques_mes_anterior: number | null;
  crescimento_percentual: number;
}

interface CorrelacaoLotacao {
  feedback_lotacao: number;
  quantidade_feedbacks: number;
  lotacao_media_real: number;
  lotacao_min_real: number;
  lotacao_max_real: number;
  classificacao_real: string;
}

interface ParadaEstrategica {
  id: number;
  latitude: number;
  longitude: number;
  status_acessibilidade: string;
  total_embarques: number;
  passageiros_distintos: number;
  rotas_que_passam: number;
  classificacao: string;
}

type RelatorioResultado =
  | RelatorioAcessibilidade[]
  | MotoristaDestaque[]
  | RotaCritica[]
  | EficienciaFrota[]
  | PassageiroFrequente[]
  | HorarioPico[]
  | FeedbackDetalhado[]
  | TendenciaUso[]
  | CorrelacaoLotacao[]
  | ParadaEstrategica[]
  | null;

/* ── Dados dos relatórios ───────────────────────────── */

const relatorios = [
  {
    title: "Acessibilidade",
    description: "Embarques de PcD em paradas acessíveis",
    icon: Accessibility,
    endpoint: "/relatorios/acessibilidade",
  },
  {
    title: "Motoristas Destaque",
    description: "Ranking dos mais bem avaliados",
    icon: Star,
    endpoint: "/relatorios/motoristas-destaque",
  },
  {
    title: "Rotas Críticas",
    description: "Rotas com superlotação frequente",
    icon: AlertTriangle,
    endpoint: "/relatorios/rotas-criticas",
  },
  {
    title: "Eficiência da Frota",
    description: "Utilização e ocupação dos ônibus",
    icon: Bus,
    endpoint: "/relatorios/eficiencia-frota",
  },
  {
    title: "Passageiros Frequentes",
    description: "Quem mais usa o sistema",
    icon: Users,
    endpoint: "/relatorios/passageiros-frequentes",
  },
  {
    title: "Horários de Pico",
    description: "Períodos de maior movimento",
    icon: Clock,
    endpoint: "/relatorios/horarios-pico",
  },
  {
    title: "Feedbacks Detalhado",
    description: "Feedbacks com dados da viagem",
    icon: MessageCircle,
    endpoint: "/relatorios/feedbacks-detalhado",
  },
  {
    title: "Tendência de Uso",
    description: "Evolução mensal de embarques",
    icon: TrendingUp,
    endpoint: "/relatorios/tendencia-uso",
  },
  {
    title: "Correlação de Lotação",
    description: "Feedback vs lotação real",
    icon: PieChart,
    endpoint: "/relatorios/correlacao-lotacao",
  },
  {
    title: "Paradas Estratégicas",
    description: "Paradas mais movimentadas",
    icon: MapPin,
    endpoint: "/relatorios/paradas-estrategicas",
  },
];

/* ── Página principal ───────────────────────────────── */

export default function RelatoriosPage() {
  const [resultado, setResultado] = useState<RelatorioResultado>(null);
  const [loading, setLoading] = useState(false);
  const [relatorioAtivo, setRelatorioAtivo] = useState("");

  async function executarRelatorio(endpoint: string, titulo: string) {
    setLoading(true);
    setRelatorioAtivo(titulo);
    setResultado(null);

    try {
      const response = await api.get(endpoint);
      setResultado(response.data);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        alert(`Erro ao carregar relatório: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function renderizarResultado() {
    if (!resultado) return null;

    const views: Record<string, React.ReactNode> = {
      "Acessibilidade": <AcessibilidadeView dados={resultado as RelatorioAcessibilidade[]} />,
      "Motoristas Destaque": <MotoristasDestaqueView dados={resultado as MotoristaDestaque[]} />,
      "Rotas Críticas": <RotasCriticasView dados={resultado as RotaCritica[]} />,
      "Eficiência da Frota": <EficienciaFrotaView dados={resultado as EficienciaFrota[]} />,
      "Passageiros Frequentes": <PassageirosFrequentesView dados={resultado as PassageiroFrequente[]} />,
      "Horários de Pico": <HorariosPicoView dados={resultado as HorarioPico[]} />,
      "Feedbacks Detalhado": <FeedbacksDetalhadoView dados={resultado as FeedbackDetalhado[]} />,
      "Tendência de Uso": <TendenciaUsoView dados={resultado as TendenciaUso[]} />,
      "Correlação de Lotação": <CorrelacaoLotacaoView dados={resultado as CorrelacaoLotacao[]} />,
      "Paradas Estratégicas": <ParadasEstrategicasView dados={resultado as ParadaEstrategica[]} />,
    };

    return views[relatorioAtivo] ?? <pre className="text-sm text-slate-600">{JSON.stringify(resultado, null, 2)}</pre>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Relatórios</h1>
        <p className="text-sm text-slate-500 mt-1">Análises estratégicas do sistema de mobilidade</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {relatorios.map((rel) => {
          const Icon = rel.icon;
          const isActive = relatorioAtivo === rel.title && resultado !== null;
          return (
            <button
              key={rel.title}
              onClick={() => executarRelatorio(rel.endpoint, rel.title)}
              className={`group text-left bg-white border rounded-lg p-4 transition-colors ${
                isActive
                  ? "border-emerald-300 ring-1 ring-emerald-200"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{rel.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{rel.description}</p>
                </div>
                <Icon className={`w-5 h-5 flex-shrink-0 ml-3 ${
                  isActive ? "text-emerald-500" : "text-slate-300 group-hover:text-slate-400"
                }`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500">Carregando relatório...</span>
        </div>
      )}

      {/* Resultado */}
      {resultado && !loading && (
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">{relatorioAtivo}</h2>
            <button
              onClick={() => { setResultado(null); setRelatorioAtivo(""); }}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 overflow-auto max-h-[32rem]">
            {renderizarResultado()}
          </div>
        </div>
      )}

      {!loading && !resultado && (
        <div className="text-center py-16 text-sm text-slate-400">
          Selecione um relatório acima para visualizar
        </div>
      )}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────── */

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-lg font-semibold mt-0.5 ${accent || "text-slate-700"}`}>{value}</p>
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "success" | "warning" | "danger" | "info" | "default" }) {
  const colors = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-sky-50 text-sky-700",
    default: "bg-slate-100 text-slate-600",
  };
  return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${colors[variant]}`}>{children}</span>;
}

function EmptyState() {
  return <p className="text-sm text-slate-400 text-center py-8">Nenhum dado encontrado.</p>;
}

/* ── Views de cada relatório ────────────────────────── */

function AcessibilidadeView({ dados }: { dados: RelatorioAcessibilidade[] }) {
  return (
    <div className="space-y-3">
      {dados.map((item, i) => (
        <div key={i} className="bg-slate-50 rounded-md p-4">
          <p className="text-sm font-medium text-slate-700 capitalize mb-3">{item.perfil_acessibilidade}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Passageiros" value={item.total_passageiros} />
            <Stat label="Embarques" value={item.total_embarques} />
            <Stat label="Em paradas acessíveis" value={item.embarques_paradas_acessiveis} />
            <Stat
              label="% Acessibilidade"
              value={`${item.percentual_acessivel}%`}
              accent={
                item.percentual_acessivel >= 90 ? "text-emerald-600" :
                item.percentual_acessivel >= 70 ? "text-amber-600" :
                "text-red-600"
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MotoristasDestaqueView({ dados }: { dados: MotoristaDestaque[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead>
          <tr className="bg-slate-50/80">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Nome</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">CNH</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Viagens</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Feedbacks</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">% Positivo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {dados.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 text-sm text-slate-700">{m.nome_completo}</td>
              <td className="px-4 py-3 text-sm text-slate-500 font-mono">{m.cnh}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{m.total_viagens}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{m.total_feedbacks}</td>
              <td className="px-4 py-3">
                <Badge variant={m.percentual_feedbacks_positivos >= 70 ? "success" : m.percentual_feedbacks_positivos >= 50 ? "warning" : "danger"}>
                  {m.percentual_feedbacks_positivos}%
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RotasCriticasView({ dados }: { dados: RotaCritica[] }) {
  return (
    <div className="space-y-3">
      {dados.map((rota) => (
        <div key={rota.id} className="bg-slate-50 rounded-md p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-700">{rota.nome_rota}</p>
              <p className="text-xs text-slate-400 font-mono">{rota.codigo_rota}</p>
            </div>
            <Badge variant={rota.percentual_critico >= 70 ? "danger" : rota.percentual_critico >= 50 ? "warning" : "success"}>
              {rota.percentual_critico}% crítico
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <Stat label="Viagens" value={rota.total_viagens} />
            <Stat label="Críticas" value={rota.viagens_criticas} />
            <Stat label="Lotação média" value={rota.lotacao_media} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EficienciaFrotaView({ dados }: { dados: EficienciaFrota[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead>
          <tr className="bg-slate-50/80">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Placa</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Acessível</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Capacidade</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Viagens</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Passageiros</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ocupação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {dados.map((o) => (
            <tr key={o.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 text-sm text-slate-700 font-mono">{o.placa}</td>
              <td className="px-4 py-3">
                <Badge variant={o.acessivel === "Sim" ? "success" : "default"}>{o.acessivel}</Badge>
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{o.capacidade_maxima}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{o.viagens_realizadas}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{o.passageiros_transportados}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700">{o.percentual_ocupacao_medio}%</span>
                  <div className="w-16 bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        o.percentual_ocupacao_medio > 90 ? "bg-red-500" :
                        o.percentual_ocupacao_medio > 70 ? "bg-amber-500" :
                        "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(o.percentual_ocupacao_medio, 100)}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PassageirosFrequentesView({ dados }: { dados: PassageiroFrequente[] }) {
  return (
    <div className="space-y-3">
      {dados.map((p) => (
        <div key={p.id} className="bg-slate-50 rounded-md p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-700">{p.nome_completo}</p>
              <p className="text-xs text-slate-400 capitalize">{p.perfil_acessibilidade}</p>
            </div>
            <Badge variant="info">{p.total_viagens} viagens</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <Stat label="Feedbacks" value={p.total_feedbacks} />
            <Stat label="Positivos" value={p.feedbacks_positivos} accent="text-emerald-600" />
            <Stat label="Negativos" value={p.feedbacks_negativos} accent="text-red-600" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HorariosPicoView({ dados }: { dados: HorarioPico[] }) {
  if (!dados?.length) return <EmptyState />;

  return (
    <div className="space-y-3">
      {dados.map((p, i) => (
        <div key={i} className="bg-slate-50 rounded-md p-4">
          <p className="text-sm font-medium text-slate-700 mb-3">{p.periodo}</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Stat label="Viagens" value={p.total_viagens} />
            <Stat label="Passageiros" value={p.passageiros_transportados} />
            <Stat label="Lotação média" value={p.lotacao_media} />
            <Stat label="Pico" value={p.pico_lotacao} />
            <Stat label="Rotas ativas" value={p.rotas_ativas} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedbacksDetalhadoView({ dados }: { dados: FeedbackDetalhado[] }) {
  return (
    <div className="space-y-3">
      {dados.map((f) => (
        <div key={f.feedback_id} className="bg-slate-50 rounded-md p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400">{new Date(f.data_feedback).toLocaleString("pt-BR")}</p>
              <p className="text-sm font-medium text-slate-700">{f.passageiro}</p>
            </div>
            <Badge variant={
              f.tipo_ocorrencia === "conduta" ? "success" :
              f.tipo_ocorrencia === "lotacao" ? "warning" : "danger"
            }>
              {f.tipo_ocorrencia}
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
            <Stat label="Rota" value={f.nome_rota} />
            <Stat label="Motorista" value={f.motorista} />
            <Stat label="Ônibus" value={f.onibus_placa} />
            <div>
              <p className="text-xs text-slate-400">Lotação</p>
              <p className="text-sm text-slate-700 mt-0.5">
                Inf. {f.lotacao_informada} | Real {f.lotacao_real}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TendenciaUsoView({ dados }: { dados: TendenciaUso[] }) {
  if (!dados?.length) return <EmptyState />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead>
          <tr className="bg-slate-50/80">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Mês</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Embarques</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Passageiros</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Viagens</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Motoristas</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ônibus</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Anterior</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Crescimento</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {dados.map((m) => (
            <tr key={m.mes} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 text-sm font-medium text-slate-700">{m.mes}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{m.total_embarques}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{m.passageiros_unicos}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{m.viagens_utilizadas}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{m.motoristas_ativos}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{m.onibus_ativos}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{m.embarques_mes_anterior ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge variant={m.crescimento_percentual > 0 ? "success" : m.crescimento_percentual < 0 ? "danger" : "default"}>
                  {m.crescimento_percentual > 0 ? "+" : ""}{m.crescimento_percentual}%
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CorrelacaoLotacaoView({ dados }: { dados: CorrelacaoLotacao[] }) {
  if (!dados?.length) return <EmptyState />;

  const maxFeedbacks = Math.max(...dados.map((d) => d.quantidade_feedbacks));

  return (
    <div className="space-y-3">
      {dados.map((item) => {
        const pct = Math.round((item.quantidade_feedbacks / maxFeedbacks) * 100);
        return (
          <div key={item.feedback_lotacao} className="bg-slate-50 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-700">Nível {item.feedback_lotacao}</p>
              <Badge variant="info">{item.quantidade_feedbacks} feedbacks</Badge>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Lotação média real</p>
                <p className="text-2xl font-semibold text-slate-700">{item.lotacao_media_real}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Mín {item.lotacao_min_real} · Máx {item.lotacao_max_real}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Classificação real</p>
                <p className={`text-lg font-semibold mt-0.5 ${
                  item.classificacao_real.includes("Lotada") ? "text-red-600" :
                  item.classificacao_real.includes("Alta") ? "text-amber-600" :
                  item.classificacao_real.includes("Média") ? "text-sky-600" :
                  "text-emerald-600"
                }`}>
                  {item.classificacao_real}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ParadasEstrategicasView({ dados }: { dados: ParadaEstrategica[] }) {
  return (
    <div className="space-y-3">
      {dados.map((p) => (
        <div key={p.id} className="bg-slate-50 rounded-md p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-700">Parada #{p.id}</p>
              <p className="text-xs text-slate-400 font-mono">
                {p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}
              </p>
            </div>
            <Badge variant={
              p.classificacao === "CRÍTICA" ? "danger" :
              p.classificacao.includes("Super") ? "warning" : "success"
            }>
              {p.classificacao}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <Stat
              label="Acessibilidade"
              value={p.status_acessibilidade}
              accent={
                p.status_acessibilidade === "acessivel" ? "text-emerald-600" :
                p.status_acessibilidade === "inacessivel" ? "text-red-600" :
                "text-amber-600"
              }
            />
            <Stat label="Embarques" value={p.total_embarques} />
            <Stat label="Rotas" value={p.rotas_que_passam} />
          </div>
        </div>
      ))}
    </div>
  );
}
