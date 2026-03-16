# Arquitetura e Organização do Projeto

Este documento descreve as principais decisões técnicas adotadas durante o desenvolvimento do projeto de Banco de Dados para um sistema de mobilidade urbana.

O objetivo do projeto é modelar e implementar um banco de dados capaz de representar o funcionamento básico de um sistema de transporte público, incluindo rotas, viagens, passageiros, embarques e feedbacks de usuários.

---

# Tecnologias Utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias:

- **Visual Studio Code** como ambiente de desenvolvimento
- **Python** para implementação do backend
- **FastAPI** como framework web para criação da API
- **PostgreSQL** como sistema gerenciador de banco de dados relacional
- **Docker** para execução do banco de dados em ambiente isolado
- **Interface Web (Frontend)** para interação do usuário com o sistema

Cada tecnologia possui um papel específico dentro da arquitetura do sistema.

---

# Arquitetura Geral do Sistema

O sistema foi organizado seguindo uma arquitetura simples em três camadas:

1. **Frontend (interface web)**  
   Responsável pela interação com o usuário.

2. **Backend (API em Python)**  
   Responsável pela lógica da aplicação e comunicação com o banco de dados.

3. **Banco de Dados PostgreSQL**  
   Responsável por armazenar todas as informações do sistema.

De forma simplificada, o funcionamento ocorre da seguinte maneira:

Usuário → Interface Web → API FastAPI → Banco PostgreSQL

Ou seja:

- o usuário interage com a interface web
- a interface envia requisições para a API
- a API executa consultas no banco de dados
- o resultado é retornado para a interface

---

# Estrutura do Repositório

O projeto foi organizado separando responsabilidades entre aplicação e banco de dados.

Exemplo de estrutura:

```
app/
    backend/
    frontend/

sql/
    schema.sql
    seed.sql
    queries.sql

docker-compose.yml
README.md
```

---

# Backend (Python + FastAPI)

O backend do sistema é desenvolvido em **Python** utilizando o framework **FastAPI**.

O FastAPI permite criar APIs web de forma simples e eficiente, utilizando rotas HTTP para acessar funcionalidades do sistema.

Por exemplo, a API pode possuir rotas como:

- consultar rotas de ônibus
- listar viagens
- registrar embarques
- registrar feedbacks de passageiros

O backend é responsável por:

- receber requisições da interface web
- executar consultas SQL no banco de dados
- retornar os dados ao frontend em formato JSON

---

# Frontend (Interface Web)

A pasta `frontend` contém a interface web do sistema.

Essa interface permite que usuários visualizem informações do sistema de mobilidade urbana, como:

- rotas disponíveis
- viagens em andamento
- informações de ônibus
- envio de feedbacks

O frontend se comunica com o backend através de requisições HTTP para a API criada com FastAPI.

---

# Banco de Dados PostgreSQL

O banco de dados do sistema é implementado utilizando **PostgreSQL**, um sistema gerenciador de banco de dados relacional amplamente utilizado.

O banco armazena todas as informações do sistema, incluindo:

- passageiros
- motoristas
- ônibus
- rotas
- paradas
- viagens
- embarques
- feedbacks

A estrutura do banco é definida utilizando scripts SQL.

---

# Pasta SQL

A pasta `sql` contém os scripts responsáveis pela criação e manipulação da estrutura do banco de dados.

## schema.sql

Contém os comandos SQL responsáveis por criar:

- tipos ENUM
- tabelas
- chaves primárias
- chaves estrangeiras
- restrições de integridade

Esse arquivo permite recriar toda a estrutura do banco de dados a partir do zero.

---

## seed.sql

Arquivo responsável por inserir **dados de teste** no banco de dados.

Esses dados são utilizados para validar o funcionamento do sistema durante o desenvolvimento.

---

## queries.sql

Arquivo destinado às consultas SQL utilizadas pelo sistema.

Essas consultas representam operações comuns do sistema, como:

- listar rotas
- consultar viagens
- registrar embarques
- obter estatísticas de utilização

---

# Execução do Banco de Dados com Docker

Para garantir que todos os membros do grupo utilizem o mesmo ambiente de banco de dados, foi adotado o uso de **Docker**.

O arquivo `docker-compose.yml` define um container que executa o PostgreSQL.

Ao executar o comando:

```
docker compose up
```

o Docker realiza automaticamente as seguintes etapas:

1. Baixa a imagem oficial do PostgreSQL
2. Cria um container isolado contendo o servidor de banco de dados
3. Inicializa o PostgreSQL dentro desse container

Dessa forma, não é necessário instalar o PostgreSQL diretamente no sistema operacional.

Isso facilita a execução do projeto em diferentes computadores e garante que todos utilizem a mesma configuração de banco de dados.

---

# Criação da Estrutura do Banco

Após iniciar o container do PostgreSQL, a estrutura do banco é criada executando o script:

```
schema.sql
```

Esse script contém todos os comandos necessários para criar:

- tipos ENUM
- tabelas
- relacionamentos entre entidades
- restrições de integridade

Isso garante que qualquer membro do grupo consiga recriar o banco de dados apenas executando esse arquivo.

---

# Motivação das Tecnologias Utilizadas

## PostgreSQL

O PostgreSQL foi escolhido por ser um SGBD relacional robusto e amplamente utilizado, oferecendo suporte a:

- integridade referencial
- constraints
- tipos personalizados (ENUM)
- consultas SQL complexas

Esses recursos são importantes para garantir a consistência dos dados do sistema.

---

## FastAPI

O FastAPI foi escolhido para implementação do backend por ser um framework moderno para construção de APIs em Python, oferecendo:

- alto desempenho
- facilidade de desenvolvimento
- integração simples com bancos de dados

---

## Docker

Docker foi utilizado para padronizar o ambiente de execução do banco de dados.

Com Docker, todos os membros do grupo conseguem iniciar o banco de dados utilizando um único comando, evitando problemas de configuração entre diferentes computadores.

Isso garante maior reprodutibilidade e facilita a colaboração no desenvolvimento do projeto.