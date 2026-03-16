import os
import time
import psycopg2
from psycopg2.extras import RealDictCursor


DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DB")
DB_HOST = os.getenv("POSTGRES_HOST")
DB_PORT = os.getenv("POSTGRES_PORT")


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
            print(f"Aguardando banco... {i+1}/{max_retries}")
            time.sleep(delay)

    raise Exception("Não foi possível conectar ao banco.")


wait_for_db()


def get_connection():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        cursor_factory=RealDictCursor
    )
    return conn