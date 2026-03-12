-- =====================================================
-- Tipos ENUM
-- =====================================================

CREATE TYPE perfil_acessibilidade AS ENUM (
    'nenhum',
    'cadeirante',
    'muletas',
    'visual'
);

CREATE TYPE status_motorista AS ENUM (
    'ativo',
    'suspenso',
    'ferias'
);

CREATE TYPE status_parada AS ENUM (
    'acessivel',
    'inacessivel',
    'manutencao'
);

CREATE TYPE tipo_ocorrencia AS ENUM (
    'lotacao',
    'mecanica',
    'conduta',
    'acessibilidade'
);

CREATE TYPE tipo_pagamento AS ENUM (
    'cartao_estudante',
    'vale_transporte',
    'integracao',
    'gratuito'
);

-- =====================================================
-- Tabela Passageiros
-- =====================================================

CREATE TABLE passageiros (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    perfil_acessibilidade perfil_acessibilidade
);

-- =====================================================
-- Tabela Motoristas
-- =====================================================

CREATE TABLE motoristas (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    cnh VARCHAR(20) UNIQUE NOT NULL,
    status status_motorista
);

-- =====================================================
-- Tabela Ônibus
-- =====================================================

CREATE TABLE onibus (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    modelo_acessivel BOOLEAN,
    capacidade_maxima INTEGER NOT NULL
);

-- =====================================================
-- Tabela Paradas
-- =====================================================

CREATE TABLE paradas (
    id SERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status_acessibilidade status_parada
);

-- =====================================================
-- Tabela Rotas
-- =====================================================

CREATE TABLE rotas (
    id SERIAL PRIMARY KEY,
    codigo_rota VARCHAR(10) NOT NULL,
    nome_rota VARCHAR(50)
);

-- =====================================================
-- Tabela Viagens
-- =====================================================

CREATE TABLE viagens (
    id SERIAL PRIMARY KEY,
    id_rota INTEGER NOT NULL,
    id_onibus INTEGER NOT NULL,
    id_motorista INTEGER NOT NULL,
    horario_saida_real TIMESTAMP,
    nivel_lotacao_atual INTEGER,

    FOREIGN KEY (id_rota) REFERENCES rotas(id),
    FOREIGN KEY (id_onibus) REFERENCES onibus(id),
    FOREIGN KEY (id_motorista) REFERENCES motoristas(id)
);

-- =====================================================
-- Tabela Itinerários
-- =====================================================

CREATE TABLE itinerarios (
    id_rota INTEGER NOT NULL,
    id_parada INTEGER NOT NULL,
    ordem_parada INTEGER NOT NULL,
    tempo_estimado_minutos INTEGER,

    PRIMARY KEY (id_rota, id_parada),

    FOREIGN KEY (id_rota) REFERENCES rotas(id),
    FOREIGN KEY (id_parada) REFERENCES paradas(id)
);

-- =====================================================
-- Tabela Embarques
-- =====================================================

CREATE TABLE embarques (
    id_passageiro INTEGER NOT NULL,
    id_viagem INTEGER NOT NULL,
    id_parada_origem INTEGER,
    data_hora_embarque TIMESTAMP NOT NULL,
    tipo_pagamento tipo_pagamento,

    PRIMARY KEY (id_passageiro, id_viagem),

    FOREIGN KEY (id_passageiro) REFERENCES passageiros(id),
    FOREIGN KEY (id_viagem) REFERENCES viagens(id),
    FOREIGN KEY (id_parada_origem) REFERENCES paradas(id)
);

-- =====================================================
-- Tabela Feedbacks
-- =====================================================

CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    id_passageiro INTEGER,
    id_viagem INTEGER,
    tipo_ocorrencia tipo_ocorrencia,
    nivel_lotacao_informado INTEGER,
    data_hora TIMESTAMP,

    FOREIGN KEY (id_passageiro) REFERENCES passageiros(id),
    FOREIGN KEY (id_viagem) REFERENCES viagens(id)
);