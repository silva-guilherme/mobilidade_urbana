# Projeto de Banco de Dados  
## Sistema de Mobilidade Urbana

## Introdução

Este documento apresenta a evolução do modelo de dados desenvolvido para o sistema de mobilidade urbana proposto no projeto da disciplina de Banco de Dados. O objetivo do sistema é permitir o registro e análise de informações relacionadas ao transporte público, incluindo passageiros, motoristas, ônibus, rotas, paradas e viagens realizadas.

Nesta primeira entrega são apresentados:

- Ajustes realizados em relação ao modelo conceitual anterior (MER).
- Demonstração da criação do banco de dados no SGBD.
- Discussão técnica das decisões de modelagem adotadas.
- Povoamento inicial do banco de dados com tuplas de teste.

---

# Ajustes realizados no modelo anterior

Durante a implementação do banco de dados no SGBD PostgreSQL, foram identificados alguns pontos do modelo conceitual inicial que precisaram ser ajustados para melhor refletir as regras de negócio do sistema.

## Separação adequada das entidades

No modelo final, cada entidade principal do domínio foi representada por uma tabela específica:

- Passageiros
- Motoristas
- Ônibus
- Paradas
- Rotas
- Viagens

Essa separação evita redundância de dados e facilita a manutenção das informações ao longo do tempo.

---

## Uso de tabelas associativas

Alguns relacionamentos do modelo conceitual foram implementados por meio de tabelas associativas no modelo relacional.

Um exemplo é a tabela **embarques**, que representa o registro de passageiros que embarcaram em determinada viagem.

Essa tabela utiliza uma chave primária composta:

```
PRIMARY KEY (id_passageiro, id_viagem)
```

Isso garante que um passageiro não seja registrado mais de uma vez na mesma viagem.

---

## Ajuste na modelagem do itinerário das rotas

No modelo conceitual inicial, o itinerário das rotas foi modelado contendo um campo de horário absoluto de chegada em cada parada, utilizando o tipo `TIMESTAMP`.

Exemplo da modelagem inicial:

```
CREATE TABLE itinerarios (
    id_rota INTEGER NOT NULL,
    id_parada INTEGER NOT NULL,
    ordem_parada INTEGER NOT NULL,
    tempo_estimado_chegada TIMESTAMP,
    PRIMARY KEY (id_rota, id_parada)
);
```

Durante a implementação foi identificado que essa modelagem não representa corretamente o funcionamento de um sistema de transporte público.

Isso ocorre porque uma mesma rota pode possuir diversas viagens ao longo do dia, cada uma iniciando em horários diferentes. Dessa forma, o horário de chegada em uma parada não depende apenas da rota e da parada, mas também do horário de saída da viagem.

### Exemplo

Suponha que uma rota possua a seguinte sequência de paradas:

- Parada A (início da rota)
- Parada B
- Parada C

Se uma viagem iniciar às **08:00**, os horários podem ser:

- Parada A → 08:00  
- Parada B → 08:05  
- Parada C → 08:12  

Entretanto, se outra viagem da mesma rota iniciar às **10:00**, os horários serão:

- Parada A → 10:00  
- Parada B → 10:05  
- Parada C → 10:12  

Portanto, armazenar um horário absoluto na tabela de itinerários cria uma dependência conceitual inadequada, pois o valor não depende apenas da chave da tabela `(id_rota, id_parada)`.

### Ajuste realizado

Para resolver esse problema, o modelo foi ajustado para armazenar o tempo estimado relativo ao início da rota, em vez de um horário absoluto.

Foi criado o atributo:

```
tempo_estimado_minutos INTEGER
```

Esse campo representa o tempo necessário para alcançar determinada parada desde o início da rota.

Exemplo de interpretação:

- Parada A → 0 minutos  
- Parada B → 5 minutos  
- Parada C → 12 minutos  

Assim, quando uma viagem inicia às **08:00**, o horário estimado de chegada na terceira parada será:

```
08:00 + 12 minutos = 08:12
```

### Estrutura final da tabela

```
CREATE TABLE itinerarios (
    id_rota INTEGER NOT NULL,
    id_parada INTEGER NOT NULL,
    ordem_parada INTEGER NOT NULL,
    tempo_estimado_minutos INTEGER,

    PRIMARY KEY (id_rota, id_parada),

    FOREIGN KEY (id_rota) REFERENCES rotas(id),
    FOREIGN KEY (id_parada) REFERENCES paradas(id)
);
```

Com essa abordagem, o horário de chegada em cada parada pode ser calculado dinamicamente a partir do horário de saída da viagem, mantendo o modelo conceitualmente correto e mais flexível.

---

## Uso de tipos ENUM

Alguns atributos categóricos foram implementados utilizando tipos ENUM do PostgreSQL.

Exemplos incluem:

- perfil_acessibilidade
- status_motorista
- status_parada
- tipo_pagamento
- tipo_ocorrencia

Essa decisão garante maior integridade dos dados, pois apenas valores previamente definidos podem ser inseridos nesses campos.

---

## Eliminação de dependências transitivas

O modelo foi estruturado para evitar dependências transitivas entre atributos.

Por exemplo, informações como nome do motorista ou placa do ônibus não são armazenadas diretamente na tabela de viagens, mas sim referenciadas por meio de chaves estrangeiras.

Exemplo:

```
FOREIGN KEY (id_motorista) REFERENCES motoristas(id)
```

Essa abordagem mantém o banco de dados em conformidade com a **Terceira Forma Normal (3FN)**.

---

# Demonstração do SGBD e criação das tabelas

O banco de dados foi implementado utilizando o sistema gerenciador de banco de dados **PostgreSQL**.

As tabelas foram criadas por meio de um script SQL denominado **schema.sql**, que contém todos os comandos necessários para a criação da estrutura do banco.

A seguir apresenta-se um exemplo simplificado da criação de uma das tabelas principais do sistema:

```
CREATE TABLE motoristas (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    cnh VARCHAR(20) UNIQUE NOT NULL,
    status status_motorista
);
```

Nesse exemplo podem ser observadas algumas decisões importantes:

- Uso do tipo `SERIAL` para geração automática de identificadores.
- Restrição `UNIQUE` para garantir que duas CNHs não sejam iguais.
- Uso de tipos `ENUM` para controle de valores possíveis.

Além disso, diversas chaves estrangeiras foram utilizadas para garantir a integridade referencial entre as tabelas.

Por exemplo:

```
FOREIGN KEY (id_rota) REFERENCES rotas(id)
```

Essa restrição garante que uma viagem só possa existir se a rota correspondente já estiver cadastrada no sistema.

---

# Povoamento do banco de dados

Para permitir testes iniciais do sistema, o banco de dados foi populado com um conjunto inicial de tuplas.

Esses dados permitem simular cenários reais do sistema de transporte urbano, incluindo cadastro de passageiros, motoristas, ônibus e rotas.

Exemplo de inserção de dados de teste:

```
INSERT INTO passageiros (nome_completo, perfil_acessibilidade)
VALUES
('Joao Silva', 'nenhum'),
('Maria Oliveira', 'cadeirante');
```

Outro exemplo é a inserção de motoristas no sistema:

```
INSERT INTO motoristas (nome_completo, cnh, status)
VALUES
('Carlos Souza', '123456789', 'ativo'),
('Ana Costa', '987654321', 'ativo');
```

Essas tuplas permitem verificar o funcionamento das relações entre as tabelas e validar a integridade das restrições definidas.

---

# Conclusão

A implementação do modelo relacional no PostgreSQL permitiu validar e refinar o modelo conceitual desenvolvido anteriormente.

Alguns ajustes foram necessários para garantir maior aderência às regras de negócio do sistema e para assegurar a normalização adequada do banco de dados.

O resultado é um esquema relacional consistente, organizado e preparado para suportar as funcionalidades previstas para o sistema de mobilidade urbana.

Nas próximas etapas do projeto serão implementadas consultas SQL mais complexas e funcionalidades adicionais para manipulação e análise dos dados armazenados no banco.