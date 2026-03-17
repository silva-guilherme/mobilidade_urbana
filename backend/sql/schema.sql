-- =====================================================
-- ENUMS
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

CREATE TYPE tipo_telefone AS ENUM (
    'pessoal',
    'trabalho',
    'emergencia'
);

-- =====================================================
-- PASSAGEIROS
-- =====================================================

CREATE TABLE passageiros (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    perfil_acessibilidade perfil_acessibilidade,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- ← ADICIONADO
);

-- =====================================================
-- EMAIL PASSAGEIRO
-- =====================================================

CREATE TABLE emails_passageiro (
    id SERIAL PRIMARY KEY,
    id_passageiro INTEGER NOT NULL,
    email VARCHAR(150) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- ← ADICIONADO

    FOREIGN KEY (id_passageiro) REFERENCES passageiros(id)
);

-- =====================================================
-- MOTORISTAS
-- =====================================================

CREATE TABLE motoristas (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    cnh VARCHAR(20) UNIQUE NOT NULL,
    status status_motorista,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- ← ADICIONADO
);

-- =====================================================
-- TELEFONES MOTORISTA
-- =====================================================

CREATE TABLE telefones_motorista (
    id SERIAL PRIMARY KEY,
    id_motorista INTEGER NOT NULL,
    numero VARCHAR(20) NOT NULL,
    tipo tipo_telefone,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- ← ADICIONADO

    FOREIGN KEY (id_motorista) REFERENCES motoristas(id)
);

-- =====================================================
-- ONIBUS
-- =====================================================

CREATE TABLE onibus (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    modelo_acessivel BOOLEAN,
    capacidade_maxima INTEGER NOT NULL CHECK (capacidade_maxima > 0),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- ← ADICIONADO
);

-- =====================================================
-- PARADAS
-- =====================================================

CREATE TABLE paradas (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    status_acessibilidade status_parada,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- ← ADICIONADO
);

-- =====================================================
-- ROTAS
-- =====================================================

CREATE TABLE rotas (
    id SERIAL PRIMARY KEY,
    codigo_rota VARCHAR(10) NOT NULL,
    nome_rota VARCHAR(100),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- ← ADICIONADO
);

-- =====================================================
-- ITINERARIOS
-- =====================================================

CREATE TABLE itinerarios (
    id_rota INTEGER NOT NULL,
    id_parada INTEGER NOT NULL,
    ordem_parada INTEGER NOT NULL CHECK (ordem_parada > 0),
    tempo_estimado TIME,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- ← ADICIONADO

    PRIMARY KEY (id_rota, id_parada),

    FOREIGN KEY (id_rota) REFERENCES rotas(id),
    FOREIGN KEY (id_parada) REFERENCES paradas(id)
);

-- =====================================================
-- VIAGENS
-- =====================================================

CREATE TABLE viagens (
    id SERIAL PRIMARY KEY,
    id_rota INTEGER NOT NULL,
    id_onibus INTEGER NOT NULL,
    id_motorista INTEGER NOT NULL,
    horario_saida TIME,
    lotacao_atual INTEGER CHECK (lotacao_atual >= 0),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- ← ADICIONADO

    FOREIGN KEY (id_rota) REFERENCES rotas(id),
    FOREIGN KEY (id_onibus) REFERENCES onibus(id),
    FOREIGN KEY (id_motorista) REFERENCES motoristas(id)
);

-- =====================================================
-- EMBARQUES
-- =====================================================

CREATE TABLE embarques (
    id_viagem INTEGER NOT NULL,
    id_passageiro INTEGER NOT NULL,
    id_parada_origem INTEGER,
    data_hora TIMESTAMP NOT NULL,
    tipo_pagamento tipo_pagamento,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- ← ADICIONADO

    PRIMARY KEY (id_viagem, id_passageiro),

    FOREIGN KEY (id_viagem) REFERENCES viagens(id),
    FOREIGN KEY (id_passageiro) REFERENCES passageiros(id),
    FOREIGN KEY (id_parada_origem) REFERENCES paradas(id)
);

-- =====================================================
-- FEEDBACKS
-- =====================================================

CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    id_passageiro INTEGER,
    id_viagem INTEGER,
    tipo_ocorrencia tipo_ocorrencia,
    nivel_lotacao INTEGER CHECK (nivel_lotacao BETWEEN 1 AND 5),
    data_hora TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- ← ADICIONADO

    FOREIGN KEY (id_passageiro) REFERENCES passageiros(id),
    FOREIGN KEY (id_viagem) REFERENCES viagens(id)
);