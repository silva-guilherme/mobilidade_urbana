# Funcionamento do Sistema de Mobilidade Urbana

Este documento apresenta o funcionamento conceitual do sistema de mobilidade urbana modelado no banco de dados.

O objetivo do sistema é registrar e organizar informações relacionadas ao funcionamento do transporte público de uma cidade.

---

# Entidades principais do sistema

O sistema considera alguns elementos fundamentais do transporte público.

## Passageiros

Representam as pessoas que utilizam o sistema de transporte.

Cada passageiro pode embarcar em diferentes viagens ao longo do tempo.

---

## Motoristas

Representam os condutores responsáveis por dirigir os ônibus durante as viagens.

Cada motorista pode ser associado a diferentes viagens ao longo do tempo.

---

## Ônibus

Representam os veículos utilizados no transporte dos passageiros.

Cada ônibus possui características como:

- placa
- capacidade máxima
- acessibilidade

---

## Paradas

Representam os pontos de ônibus distribuídos pela cidade.

Cada parada possui localização geográfica e pode possuir informações sobre acessibilidade.

---

## Rotas

Uma rota representa o trajeto realizado por uma linha de ônibus.

Por exemplo:

Centro → Hospital → Universidade → Terminal

Uma mesma rota pode ser executada diversas vezes ao longo do dia.

---

# Itinerário das rotas

O itinerário define a sequência de paradas que pertencem a uma determinada rota.

Exemplo:

| rota | parada | ordem |
|-----|------|------|
| R1 | Centro | 1 |
| R1 | Hospital | 2 |
| R1 | Universidade | 3 |

Isso define a ordem em que o ônibus percorre as paradas.

---

# Viagens

Uma viagem representa a execução real de uma rota em um horário específico.

Por exemplo:

| viagem | rota | saída |
|------|------|------|
| V1 | R1 | 08:00 |
| V2 | R1 | 09:00 |
| V3 | R1 | 10:00 |

Cada viagem possui:

- um motorista
- um ônibus
- um horário de saída

---

# Embarques

Os embarques registram quando um passageiro entra em um ônibus durante uma viagem.

Exemplo:

| passageiro | viagem | parada | hora |
|---|---|---|---|
| João | V1 | Parada B | 08:07 |

Isso permite acompanhar o fluxo de passageiros no sistema.

---

# Feedbacks

O sistema também permite registrar feedbacks enviados pelos passageiros.

Esses feedbacks podem representar ocorrências como:

- ônibus lotado
- problema mecânico
- problemas de acessibilidade
- conduta do motorista

Essas informações podem ser utilizadas para monitorar e melhorar o funcionamento do sistema de transporte.

---

# Visão geral do funcionamento

De forma simplificada, o sistema funciona da seguinte maneira:

1. Uma rota define o trajeto de uma linha de ônibus.
2. O itinerário define as paradas pertencentes a essa rota.
3. Uma viagem representa a execução da rota em um horário específico.
4. Passageiros embarcam nas viagens nas diferentes paradas.
5. O sistema registra os embarques e possíveis feedbacks dos usuários.

Esse modelo permite representar o funcionamento básico de um sistema de transporte público urbano.