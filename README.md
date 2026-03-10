# Sistema de Mobilidade Urbana

Projeto desenvolvido para a disciplina de **Banco de Dados**.
O objetivo do sistema é implementar um banco de dados e uma aplicação para gerenciamento de informações relacionadas à mobilidade urbana, incluindo passageiros, motoristas, ônibus, rotas, paradas e viagens.

O sistema foi desenvolvido com **backend em Python utilizando FastAPI** e **banco de dados PostgreSQL**, com o ambiente configurado através de **Docker** para facilitar a execução em qualquer máquina.


## 👨‍🎓 Autores

- Felipe de Souza Ferreira Lima  
- Guilherme da Silva Bispo  
- Guilherme Vasconcelos Salviano  
- Ruan Pablo Furtado Oliveira  



# Arquitetura do projeto

O projeto segue a seguinte arquitetura:

```
Frontend (interface futura)
        │
        ▼
Backend API (Python + FastAPI)
        │
        ▼
Banco de Dados (PostgreSQL)
```

Tecnologias utilizadas:

* Python
* FastAPI
* PostgreSQL
* Docker
* Swagger/OpenAPI (documentação automática da API)

---


# Pré-requisitos

Para executar o projeto é necessário ter instalado:

* **Git**
* **Python 3.10+**
* **Docker**

Verificar instalação:

```
python --version
docker --version
git --version
```

---

# Como rodar o projeto

Siga os passos abaixo para executar o sistema em sua máquina.

## 1. Pré-requisitos

Certifique-se de ter instalado:

* **Git**
* **Docker**
* **Docker Compose**
* **Python 3.10+** (necessário apenas se quiser rodar localmente sem Docker)

Verificar instalação:

```bash
git --version
docker --version
docker compose version
python --version
```

---

# 2. Clonar o repositório


Repositório:

```bash
git clone https://github.com/silva-guilherme/mobilidade_urbana.git
```

Entrar na pasta do projeto:

```bash
cd mobilidade_urbana
```

---

# 3. Criar o arquivo `.env`

O projeto utiliza variáveis de ambiente para configurar o banco de dados.

Primeiro copie o arquivo de exemplo:

```bash
cp .env.example .env
```

* **Não alterar as credenciais** a menos que seja necessário

---

# 4. Subir os containers

Execute o comando abaixo para construir e iniciar os containers:

```bash
docker compose up --build
```

Esse comando irá:

* construir a imagem do backend
* iniciar o container da API
* iniciar o container do PostgreSQL
* criar o banco automaticamente

---

# 5. Verificar se os containers estão rodando

Abra outro terminal e execute:

```bash
docker ps
```

Você deverá ver algo parecido com:

```
mobilidade_urbana-backend
mobilidade_urbana-db
```

Isso indica que a aplicação e o banco estão rodando corretamente.

---

# 6. Acessar a API

Após iniciar os containers, a aplicação ficará disponível em:

```
http://localhost:8000
```

A documentação automática da API pode ser acessada em:

```
http://localhost:8000/docs
```

Essa interface permite testar as rotas da API diretamente pelo navegador.

---

# 7. Verificar se a API está funcionando

Abra no navegador:

```
http://localhost:8000/docs
```

Se a página abrir com as rotas da API, significa que o backend está funcionando.

---
# Testando a API

Na página `/docs` é possível executar operações como:

* criar passageiros
* listar rotas
* consultar viagens
* inserir registros no banco

Exemplo de criação de passageiro:

```
POST /passageiros
```

Body:

```
{
  "nome_completo": "João da Silva",
  "perfil_acessibilidade": "Nenhum"
}
```

---

# Acessando o banco de dados pelo terminal

Caso seja necessário acessar o banco dentro do container:

```
docker exec -it mobilidade_urbana-db-1 psql -U admin -d mobilidade
```

Exemplo de consulta:

```
SELECT * FROM passageiros;
```

Listar tabelas:

```
\dt
```

---

# Executando o projeto localmente (sem Docker)

Também é possível rodar o projeto localmente.

1. Criar ambiente virtual

```
python -m venv venv
```

2. Ativar ambiente

Linux / WSL:

```
source venv/bin/activate
```

Windows:

```
venv\Scripts\activate
```

3. Instalar dependências

```
pip install -r requirements.txt
```

4. Executar aplicação

```
uvicorn app.main:app --reload
```

A aplicação ficará disponível em:

```
http://localhost:8000
```

---

# Banco de dados

O banco utilizado é **PostgreSQL**.

Tabelas principais do sistema:

* passageiros
* motoristas
* onibus
* rotas
* paradas
* viagens
* embarques
* itinerarios
* feedbacks

Essas tabelas representam as entidades do sistema e seus relacionamentos.

---

# Status atual do projeto

Até o momento foi implementado:

* configuração do ambiente com Docker
* backend inicial com FastAPI
* conexão com PostgreSQL
* criação das tabelas do banco
* endpoints iniciais para manipulação de dados
* documentação automática da API

---

# Próximos passos

* remover uso de ORM e utilizar apenas SQL puro conforme exigência da disciplina
* implementar operações completas de CRUD
* adicionar consultas parametrizadas
* implementar interface do sistema
* organizar scripts SQL do banco

---
