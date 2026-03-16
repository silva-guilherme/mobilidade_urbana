"use client";

import { useState } from "react";
import api from "@/lib/api";
import { 
  Accessibility, 
  Star, 
  AlertTriangle, 
  CreditCard, 
  Bus, 
  Users, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  PieChart, 
  MapPin,
  Loader2,
} from "lucide-react";
import { AxiosError } from "axios";

// Interfaces para cada tipo de relatório
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
  motoristas_ativos: number;        // ← ADICIONADO
  onibus_ativos: number;            // ← ADICIONADO
  embarques_mes_anterior: number | null;  // ← ADICIONADO
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

interface RelatorioCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

function RelatorioCard({ title, description, icon, color, onClick }: RelatorioCardProps) {
  return (
    <div 
      onClick={onClick} 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 cursor-pointer h-full"
      style={{ borderColor: color.replace('border-', '') }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="text-gray-400 ml-4">{icon}</div>
      </div>
    </div>
  );
}

// Componentes de visualização para cada relatório
function RelatorioAcessibilidadeView({ dados }: { dados: RelatorioAcessibilidade[] }) {
  return (
    <div className="space-y-4">
      {dados.map((item, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2 capitalize text-gray-900">{item.perfil_acessibilidade}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total de Passageiros</p>
              <p className="text-xl font-bold text-gray-900">{item.total_passageiros}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Embarques</p>
              <p className="text-xl font-bold text-gray-900">{item.total_embarques}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Embarques em Paradas Acessíveis</p>
              <p className="text-xl font-bold text-gray-900">{item.embarques_paradas_acessiveis}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Percentual de Acessibilidade</p>
              <p className={`text-xl font-bold ${
                item.percentual_acessivel >= 90 ? 'text-green-600' : 
                item.percentual_acessivel >= 70 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {item.percentual_acessivel}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MotoristasDestaqueView({ dados }: { dados: MotoristaDestaque[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNH</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Viagens</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedbacks</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Positivo</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((motorista) => (
            <tr key={motorista.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{motorista.nome_completo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{motorista.cnh}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{motorista.total_viagens}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{motorista.total_feedbacks}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  motorista.percentual_feedbacks_positivos >= 70 ? 'bg-green-100 text-green-800' :
                  motorista.percentual_feedbacks_positivos >= 50 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {motorista.percentual_feedbacks_positivos}%
                </span>
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
    <div className="space-y-4">
      {dados.map((rota) => (
        <div key={rota.id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{rota.nome_rota}</h3>
              <p className="text-sm text-gray-600">{rota.codigo_rota}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              rota.percentual_critico >= 70 ? 'bg-red-100 text-red-800' :
              rota.percentual_critico >= 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {rota.percentual_critico}% crítico
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500">Total Viagens</p>
              <p className="text-lg font-semibold text-gray-900">{rota.total_viagens}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Viagens Críticas</p>
              <p className="text-lg font-semibold text-gray-900">{rota.viagens_criticas}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Lotação Média</p>
              <p className="text-lg font-semibold text-gray-900">{rota.lotacao_media}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EficienciaFrotaView({ dados }: { dados: EficienciaFrota[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acessível</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidade</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Viagens</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passageiros</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ocupação</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((onibus) => (
            <tr key={onibus.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{onibus.placa}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  onibus.acessivel === 'Sim' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {onibus.acessivel}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{onibus.capacidade_maxima}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{onibus.viagens_realizadas}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{onibus.passageiros_transportados}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="mr-2 text-gray-900">{onibus.percentual_ocupacao_medio}%</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        onibus.percentual_ocupacao_medio > 90 ? 'bg-red-500' :
                        onibus.percentual_ocupacao_medio > 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(onibus.percentual_ocupacao_medio, 100)}%` }}
                    ></div>
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
    <div className="space-y-4">
      {dados.map((passageiro) => (
        <div key={passageiro.id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{passageiro.nome_completo}</h3>
              <p className="text-sm text-gray-600 capitalize">{passageiro.perfil_acessibilidade}</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {passageiro.total_viagens} viagens
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500">Feedbacks</p>
              <p className="text-lg font-semibold text-gray-900">{passageiro.total_feedbacks}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Positivos</p>
              <p className="text-lg font-semibold text-green-600">{passageiro.feedbacks_positivos}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Negativos</p>
              <p className="text-lg font-semibold text-red-600">{passageiro.feedbacks_negativos}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== HORÁRIOS DE PICO ====================
function HorariosPicoView({ dados }: { dados: HorarioPico[] }) {
  if (!dados || dados.length === 0) {
    return <p className="text-gray-500 text-center py-8">Nenhum dado encontrado para este relatório.</p>;
  }

  return (
    <div className="space-y-4">
      {dados.map((periodo, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-3 text-gray-900 border-b border-gray-200 pb-2">
            {periodo.periodo}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-xs text-gray-500">Viagens</p>
              <p className="text-xl font-bold text-gray-900">{periodo.total_viagens}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-xs text-gray-500">Passageiros</p>
              <p className="text-xl font-bold text-gray-900">{periodo.passageiros_transportados}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-xs text-gray-500">Lotação Média</p>
              <p className="text-xl font-bold text-gray-900">{periodo.lotacao_media}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-xs text-gray-500">Pico</p>
              <p className="text-xl font-bold text-gray-900">{periodo.pico_lotacao}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-xs text-gray-500">Rotas Ativas</p>
              <p className="text-xl font-bold text-gray-900">{periodo.rotas_ativas}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedbacksDetalhadoView({ dados }: { dados: FeedbackDetalhado[] }) {
  return (
    <div className="space-y-4">
      {dados.map((feedback) => (
        <div key={feedback.feedback_id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">{new Date(feedback.data_feedback).toLocaleString('pt-BR')}</p>
              <h3 className="font-semibold text-gray-900">{feedback.passageiro}</h3>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${
              feedback.tipo_ocorrencia === 'conduta' ? 'bg-green-100 text-green-800' :
              feedback.tipo_ocorrencia === 'lotacao' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {feedback.tipo_ocorrencia}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500">Rota</p>
              <p className="text-sm text-gray-900">{feedback.nome_rota}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Motorista</p>
              <p className="text-sm text-gray-900">{feedback.motorista}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ônibus</p>
              <p className="text-sm text-gray-900">{feedback.onibus_placa}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Lotação</p>
              <p className="text-sm text-gray-900">Informada: {feedback.lotacao_informada} | Real: {feedback.lotacao_real}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== TENDÊNCIA DE USO ====================
function TendenciaUsoView({ dados }: { dados: TendenciaUso[] }) {
  if (!dados || dados.length === 0) {
    return <p className="text-gray-500 text-center py-8">Nenhum dado encontrado para este relatório.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mês</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Embarques</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Passageiros</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Viagens</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Motoristas</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ônibus</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mês Anterior</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Crescimento</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((mes) => (
            <tr key={mes.mes} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{mes.mes}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{mes.total_embarques}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{mes.passageiros_unicos}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{mes.viagens_utilizadas}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{mes.motoristas_ativos}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{mes.onibus_ativos}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{mes.embarques_mes_anterior ?? '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  mes.crescimento_percentual > 0 ? 'bg-green-100 text-green-800' :
                  mes.crescimento_percentual < 0 ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {mes.crescimento_percentual > 0 ? '+' : ''}{mes.crescimento_percentual}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== CORRELAÇÃO DE LOTAÇÃO ====================
function CorrelacaoLotacaoView({ dados }: { dados: CorrelacaoLotacao[] }) {
  if (!dados || dados.length === 0) {
    return <p className="text-gray-500 text-center py-8">Nenhum dado encontrado para este relatório.</p>;
  }

  // Encontrar valores máximos para as barras de progresso
  const maxFeedbacks = Math.max(...dados.map(item => item.quantidade_feedbacks));

  return (
    <div className="space-y-4">
      {dados.map((item) => {
        // Calcular porcentagem para a barra de progresso
        const porcentagem = Math.round((item.quantidade_feedbacks / maxFeedbacks) * 100);
        
        return (
          <div key={item.feedback_lotacao} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex flex-wrap items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-lg">
                Feedback Nível {item.feedback_lotacao}
              </h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {item.quantidade_feedbacks} feedbacks
              </span>
            </div>
            
            {/* Barra de progresso de quantidade */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${porcentagem}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Lotação Média Real</p>
                <p className="text-2xl font-bold text-gray-900">{item.lotacao_media_real}</p>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Mín: {item.lotacao_min_real}</span>
                  <span>Máx: {item.lotacao_max_real}</span>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Classificação Real</p>
                <p className={`text-xl font-bold ${
                  item.classificacao_real.includes('Lotada') ? 'text-red-600' :
                  item.classificacao_real.includes('Alta') ? 'text-yellow-600' :
                  item.classificacao_real.includes('Média') ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {item.classificacao_real}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {item.feedback_lotacao === 1 && item.lotacao_media_real > 30 ? '⚠️ Superestimado' : 
                   item.feedback_lotacao === 5 && item.lotacao_media_real < 50 ? '⚠️ Subestimado' : 
                   '✓ Consistente'}
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
    <div className="space-y-4">
      {dados.map((parada) => (
        <div key={parada.id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">Parada #{parada.id}</h3>
              <p className="text-xs text-gray-500">
                Lat: {parada.latitude.toFixed(6)} | Long: {parada.longitude.toFixed(6)}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              parada.classificacao === 'CRÍTICA' ? 'bg-red-100 text-red-800' :
              parada.classificacao.includes('Super') ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {parada.classificacao}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500">Acessibilidade</p>
              <p className={`text-sm font-semibold ${
                parada.status_acessibilidade === 'acessivel' ? 'text-green-600' :
                parada.status_acessibilidade === 'inacessivel' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {parada.status_acessibilidade}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Embarques</p>
              <p className="text-lg font-semibold text-gray-900">{parada.total_embarques}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Rotas</p>
              <p className="text-lg font-semibold text-gray-900">{parada.rotas_que_passam}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RelatoriosPage() {
  const [resultado, setResultado] = useState<RelatorioResultado>(null);
  const [loading, setLoading] = useState(false);
  const [relatorioAtivo, setRelatorioAtivo] = useState("");

  const relatorios = [
    {
      title: "Acessibilidade",
      description: "Passageiros com necessidades especiais estão embarcando em paradas acessíveis?",
      icon: <Accessibility className="w-8 h-8" />,
      color: "border-blue-500",
      endpoint: "/relatorios/acessibilidade",
      componente: "acessibilidade"
    },
    {
      title: "Motoristas Destaque",
      description: "Ranking dos motoristas mais bem avaliados",
      icon: <Star className="w-8 h-8" />,
      color: "border-yellow-500",
      endpoint: "/relatorios/motoristas-destaque",
      componente: "motoristas"
    },
    {
      title: "Rotas Críticas",
      description: "Rotas com problemas frequentes de superlotação",
      icon: <AlertTriangle className="w-8 h-8" />,
      color: "border-red-500",
      endpoint: "/relatorios/rotas-criticas",
      componente: "rotas"
    },
    {
      title: "Eficiência da Frota",
      description: "Desempenho e utilização dos ônibus",
      icon: <Bus className="w-8 h-8" />,
      color: "border-purple-500",
      endpoint: "/relatorios/eficiencia-frota",
      componente: "frota"
    },
    {
      title: "Passageiros Frequentes",
      description: "Quem mais usa o sistema e como avalia",
      icon: <Users className="w-8 h-8" />,
      color: "border-indigo-500",
      endpoint: "/relatorios/passageiros-frequentes",
      componente: "passageiros"
    },
    {
      title: "Horários de Pico",
      description: "Períodos de maior movimento",
      icon: <Clock className="w-8 h-8" />,
      color: "border-pink-500",
      endpoint: "/relatorios/horarios-pico",
      componente: "horarios"
    },
    {
      title: "Feedbacks Detalhado",
      description: "Feedbacks com todos os dados da viagem",
      icon: <MessageSquare className="w-8 h-8" />,
      color: "border-teal-500",
      endpoint: "/relatorios/feedbacks-detalhado",
      componente: "feedbacks"
    },
    {
      title: "Tendência de Uso",
      description: "Evolução mensal de embarques",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "border-cyan-500",
      endpoint: "/relatorios/tendencia-uso",
      componente: "tendencia"
    },
    {
      title: "Correlação de Lotação",
      description: "Feedback vs lotação real",
      icon: <PieChart className="w-8 h-8" />,
      color: "border-orange-500",
      endpoint: "/relatorios/correlacao-lotacao",
      componente: "correlacao"
    },
    {
      title: "Paradas Estratégicas",
      description: "Paradas mais movimentadas e críticas",
      icon: <MapPin className="w-8 h-8" />,
      color: "border-emerald-500",
      endpoint: "/relatorios/paradas-estrategicas",
      componente: "paradas"
    }
  ];

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
    
    // Usando o título original (sem converter para minúsculas)
    if (relatorioAtivo === "Horários de Pico") {
      return <HorariosPicoView dados={resultado as HorarioPico[]} />;
    }
    if (relatorioAtivo === "Tendência de Uso") {
      return <TendenciaUsoView dados={resultado as TendenciaUso[]} />;
    }
    if (relatorioAtivo === "Correlação de Lotação") {
      return <CorrelacaoLotacaoView dados={resultado as CorrelacaoLotacao[]} />;
    }
    if (relatorioAtivo === "Acessibilidade") {
      return <RelatorioAcessibilidadeView dados={resultado as RelatorioAcessibilidade[]} />;
    }
    if (relatorioAtivo === "Motoristas Destaque") {
      return <MotoristasDestaqueView dados={resultado as MotoristaDestaque[]} />;
    }
    if (relatorioAtivo === "Rotas Críticas") {
      return <RotasCriticasView dados={resultado as RotaCritica[]} />;
    }
    if (relatorioAtivo === "Eficiência da Frota") {
      return <EficienciaFrotaView dados={resultado as EficienciaFrota[]} />;
    }
    if (relatorioAtivo === "Passageiros Frequentes") {
      return <PassageirosFrequentesView dados={resultado as PassageiroFrequente[]} />;
    }
    if (relatorioAtivo === "Feedbacks Detalhado") {
      return <FeedbacksDetalhadoView dados={resultado as FeedbackDetalhado[]} />;
    }
    if (relatorioAtivo === "Paradas Estratégicas") {
      return <ParadasEstrategicasView dados={resultado as ParadaEstrategica[]} />;
    }
    
    // Fallback: se não encontrar, mostra como JSON
    return <pre className="text-gray-900">{JSON.stringify(resultado, null, 2)}</pre>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
        <p className="text-gray-600">Análises estratégicas do sistema de mobilidade</p>
      </div>

      {/* Cards de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {relatorios.map((rel) => (
          <RelatorioCard
            key={rel.title}
            title={rel.title}
            description={rel.description}
            icon={rel.icon}
            color={rel.color}
            onClick={() => executarRelatorio(rel.endpoint, rel.title)}
          />
        ))}
      </div>

      {/* Resultado do Relatório */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      )}

      {resultado && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Resultado: {relatorioAtivo}
            </h2>
            <button
              onClick={() => setResultado(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Fechar
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
            {renderizarResultado()}
          </div>
        </div>
      )}

      {!loading && !resultado && (
        <div className="text-center py-12 text-gray-500">
          Clique em um card para visualizar o relatório
        </div>
      )}
    </div>
  );
}