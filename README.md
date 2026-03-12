# Sistema de Mobilidade Urbana

Projeto desenvolvido para a disciplina de **Banco de Dados**.

O objetivo do sistema é implementar um banco de dados e uma aplicação para gerenciamento de informações relacionadas à mobilidade urbana, incluindo passageiros, motoristas, ônibus, rotas, paradas e viagens.

O sistema utiliza **Python (FastAPI)** no backend e **PostgreSQL** como banco de dados, com ambiente configurado através de **Docker** para facilitar a execução em qualquer máquina.

---

## 👨‍🎓 Autores

- Felipe de Souza Ferreira Lima  
- Guilherme da Silva Bispo  
- Guilherme Vasconcelos Salviano  
- Ruan Pablo Furtado Oliveira  

---

# Arquitetura do sistema

O sistema segue uma arquitetura simples de três camadas:

```
Frontend (interface web futura)
        │
        ▼
Backend API (Python + FastAPI)
        │
        ▼
Banco de Dados (PostgreSQL)
```

Tecnologias utilizadas:

- Python
- FastAPI
- PostgreSQL
- Docker
- Swagger / OpenAPI (documentação automática da API)

---

# Documentação

Documentação detalhada do projeto:

- 📄 Evolução do modelo → `Docs/Evolução_do_modelo.md`
- 📄 Arquitetura do sistema → `Docs/Arquitetura.md`
- 📄 Funcionamento do sistema → `Docs/funcionamento_sistema.md`

---

# Como rodar o projeto

## 1. Pré-requisitos

Instalar:

- Git
- Python 3.10+
- Docker

Verificar instalação:

```bash
python --version
docker --version
git --version
```

---

## 2. Clonar o repositório

```bash
git clone https://github.com/silva-guilherme/mobilidade_urbana.git
cd mobilidade_urbana
```

---

## 3. Criar o arquivo `.env`

Copiar o arquivo de exemplo:

```bash
cp .env.example .env
```

Não é necessário alterar as credenciais para execução padrão.

---

## 4. Subir os containers

Execute:

```bash
docker compose up --build
```

Esse comando irá:

- iniciar o container do PostgreSQL
- iniciar o backend FastAPI
- criar o banco de dados

---

## 5. Verificar containers

```bash
docker ps
```

Containers esperados:

```
mobilidade_urbana-backend
mobilidade_urbana-db
```

---

## 6. Acessar a API

Aplicação:

```
http://localhost:8000
```

Documentação interativa da API:

```
http://localhost:8000/docs
```

A interface `/docs` permite testar as rotas da API diretamente pelo navegador.

---

# Testando a API

Exemplo de criação de passageiro:

```
POST /passageiros
```

Body:

```
{
  "nome_completo": "João da Silva",
  "perfil_acessibilidade": "nenhum"
}
```

---

# Acessando o banco pelo terminal

Entrar no PostgreSQL dentro do container:

```bash
docker exec -it mobilidade_urbana-db-1 psql -U admin -d mobilidade
```

Exemplo de consulta:

```sql
SELECT * FROM passageiros;
```

Listar tabelas:

```
\dt
```

---

# Estrutura do projeto

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
docs/
```

---

# Status do projeto

Até o momento foi implementado:

- modelagem do banco de dados
- criação das tabelas no PostgreSQL
- backend inicial com FastAPI
- execução do banco via Docker
- documentação automática da API