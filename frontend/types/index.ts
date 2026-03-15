export interface Motorista {
    id: number;
    nome_completo: string;
    cnh: string;
    status: 'ativo' | 'suspenso' | 'ferias';
    data_criacao?: string;
    telefones?: { numero: string; tipo: string }[];
  }
  
  export interface Passageiro {
    id: number;
    nome_completo: string;
    perfil_acessibilidade: 'nenhum' | 'cadeirante' | 'muletas' | 'visual';
    data_criacao?: string;
    emails?: string[];
  }
  
  export interface Onibus {
    id: number;
    placa: string;
    modelo_acessivel: boolean;
    capacidade_maxima: number;
    data_criacao?: string;
  }
  
  export interface Rota {
    id: number;
    codigo_rota: string;
    nome_rota: string;
    data_criacao?: string;
    itinerario?: Itinerario[];
  }
  
  export interface Parada {
    id: number;
    latitude: number;
    longitude: number;
    status_acessibilidade: 'acessivel' | 'inacessivel' | 'manutencao';
    data_criacao?: string;
  }
  
  export interface Itinerario {
    id_rota: number;
    id_parada: number;
    ordem_parada: number;
    tempo_estimado?: string;
    parada?: Parada;
  }
  
  export interface Viagem {
    id: number;
    id_rota: number;
    id_onibus: number;
    id_motorista: number;
    horario_saida: string;
    lotacao_atual: number;
    data_criacao?: string;
    codigo_rota?: string;
    nome_rota?: string;
    onibus_placa?: string;
    motorista_nome?: string;
  }
  
  export interface Embarque {
    id_viagem: number;
    id_passageiro: number;
    id_parada_origem?: number;
    data_hora: string;
    tipo_pagamento: 'cartao_estudante' | 'vale_transporte' | 'integracao' | 'gratuito';
    passageiro_nome?: string;
    parada_lat?: number;
    parada_lon?: number;
  }
  
  export interface Feedback {
    id: number;
    id_passageiro: number;
    id_viagem: number;
    tipo_ocorrencia: 'lotacao' | 'mecanica' | 'conduta' | 'acessibilidade';
    nivel_lotacao?: number;
    data_hora: string;
    passageiro_nome?: string;
    viagem_horario?: string;
  }