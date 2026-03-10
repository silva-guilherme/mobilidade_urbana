from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time
import psycopg2  # precisamos testar a conexão

# ---------------------------
# CONFIGURAÇÃO DO BANCO
# ---------------------------

DB_USER = os.getenv("POSTGRES_USER", "admin")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "admin123")
DB_NAME = os.getenv("POSTGRES_DB", "mobilidade")
DB_HOST = os.getenv("POSTGRES_HOST", "db")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# ---------------------------
# FUNÇÃO PARA ESPERAR O BANCO
# ---------------------------
def wait_for_db(max_retries=10, delay=2):
    for i in range(max_retries):
        try:
            conn = psycopg2.connect(
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                host=DB_HOST,
                port=DB_PORT,
            )
            conn.close()
            print("Banco de dados disponível!")
            return
        except psycopg2.OperationalError:
            print(f"Aguardando o banco de dados... tentativa {i+1}/{max_retries}")
            time.sleep(delay)
    raise Exception("Não foi possível conectar ao banco de dados após várias tentativas.")

# ---------------------------
# ESPERAR O BANCO ANTES DE CRIAR O ENGINE
# ---------------------------
wait_for_db()

# ---------------------------
# ENGINE E SESSÃO
# ---------------------------
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ---------------------------
# BASE DO MODELO
# ---------------------------
Base = declarative_base()

# Dependency para rotas FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()