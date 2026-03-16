import os
import psycopg2
from psycopg2.extras import execute_values
from faker import Faker
import random
from datetime import datetime, timedelta
import uuid
from decimal import Decimal

# Configuração do Faker para português do Brasil
fake = Faker('pt_BR')
Faker.seed(42)  # Para reprodutibilidade
random.seed(42)

# Configuração do banco de dados
DB_CONFIG = {
    'host': os.getenv("POSTGRES_HOST"),
    'database': os.getenv("POSTGRES_DB"),
    'user': os.getenv("POSTGRES_USER"),
    'password': os.getenv("POSTGRES_PASSWORD"),
    'port': os.getenv("POSTGRES_PORT")
}

class DatabasePopulator:
    def __init__(self):
        self.conn = None
        self.cursor = None
        
        # IDs para referência
        self.passageiros_ids = []
        self.motoristas_ids = []
        self.onibus_ids = []
        self.paradas_ids = []
        self.rotas_ids = []
        self.viagens_ids = []
        
    def connect(self):
        """Estabelece conexão com o banco"""
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.cursor = self.conn.cursor()
        print("✅ Conectado ao banco de dados")
    
    def close(self):
        """Fecha conexão"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("✅ Conexão fechada")
    
    def clear_tables(self):
        """Limpa todas as tabelas na ordem correta (filhas primeiro)"""
        tables = [
            'feedbacks',
            'embarques',
            'viagens',
            'itinerarios',
            'telefones_motorista',
            'emails_passageiro',
            'passageiros',
            'motoristas',
            'onibus',
            'paradas',
            'rotas'
        ]
        
        for table in tables:
            try:
                self.cursor.execute(f"TRUNCATE TABLE {table} CASCADE;")
                print(f"   ↳ Limpa tabela: {table}")
            except Exception as e:
                print(f"   ⚠️ Erro ao limpar {table}: {e}")
        
        self.conn.commit()
        print("✅ Todas as tabelas foram limpas")
    
    def populate_passageiros(self, quantidade=200):
        """Popula tabela de passageiros"""
        print(f"\n📝 Criando {quantidade} passageiros...")
        
        perfis = ['nenhum', 'cadeirante', 'muletas', 'visual']
        dados = []
        
        for _ in range(quantidade):
            dados.append((
                fake.name(),
                random.choice(perfis)
            ))
        
        query = """
            INSERT INTO passageiros (nome_completo, perfil_acessibilidade)
            VALUES %s
            RETURNING id;
        """
        
        ids = execute_values(self.cursor, query, dados, fetch=True)
        self.passageiros_ids = [id[0] for id in ids]
        self.conn.commit()
        print(f"   ↳ {len(self.passageiros_ids)} passageiros inseridos")
    
    def populate_emails_passageiro(self, min_emails=1, max_emails=3):
        """Popula emails dos passageiros"""
        print(f"\n📧 Criando emails para passageiros...")
        
        dados = []
        for passageiro_id in self.passageiros_ids:
            num_emails = random.randint(min_emails, max_emails)
            for _ in range(num_emails):
                nome = fake.user_name()
                dominio = random.choice(['gmail.com', 'hotmail.com', 'yahoo.com.br', 'outlook.com'])
                email = f"{nome.lower()}.{random.randint(1,999)}@{dominio}"
                dados.append((passageiro_id, email))
        
        query = """
            INSERT INTO emails_passageiro (id_passageiro, email)
            VALUES %s
        """
        
        execute_values(self.cursor, query, dados)
        self.conn.commit()
        print(f"   ↳ {len(dados)} emails inseridos")
    
    def populate_motoristas(self, quantidade=50):
        """Popula tabela de motoristas"""
        print(f"\n👨‍✈️ Criando {quantidade} motoristas...")
        
        status_list = ['ativo', 'suspenso', 'ferias']
        dados = []
        
        for _ in range(quantidade):
            # Gera CNH válida (11 dígitos)
            cnh = ''.join([str(random.randint(0, 9)) for _ in range(11)])
            dados.append((
                fake.name(),
                cnh,
                random.choices(
                    status_list, 
                    weights=[0.7, 0.1, 0.2],  # 70% ativos, 10% suspensos, 20% férias
                    k=1
                )[0]
            ))
        
        query = """
            INSERT INTO motoristas (nome_completo, cnh, status)
            VALUES %s
            RETURNING id;
        """
        
        ids = execute_values(self.cursor, query, dados, fetch=True)
        self.motoristas_ids = [id[0] for id in ids]
        self.conn.commit()
        print(f"   ↳ {len(self.motoristas_ids)} motoristas inseridos")
    
    def populate_telefones_motorista(self, min_telefones=1, max_telefones=2):
        """Popula telefones dos motoristas"""
        print(f"\n📞 Criando telefones para motoristas...")
        
        tipos = ['pessoal', 'trabalho', 'emergencia']
        dados = []
        
        for motorista_id in self.motoristas_ids:
            num_telefones = random.randint(min_telefones, max_telefones)
            for _ in range(num_telefones):
                # Gera telefone brasileiro
                ddd = random.randint(11, 99)
                numero = f"{random.randint(9, 9)}{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
                telefone = f"({ddd}) {numero}"
                
                dados.append((
                    motorista_id,
                    telefone,
                    random.choice(tipos)
                ))
        
        query = """
            INSERT INTO telefones_motorista (id_motorista, numero, tipo)
            VALUES %s
        """
        
        execute_values(self.cursor, query, dados)
        self.conn.commit()
        print(f"   ↳ {len(dados)} telefones inseridos")
    
    def populate_onibus(self, quantidade=30):
        """Popula tabela de ônibus"""
        print(f"\n🚌 Criando {quantidade} ônibus...")
        
        dados = []
        prefixos_placa = ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX', 'YZ']
        
        for i in range(quantidade):
            # Gera placa no formato antigo ou Mercosul
            if random.random() > 0.5:
                placa = f"{random.choice(prefixos_placa)}{random.randint(1000, 9999)}"
            else:
                letras = ''.join([chr(random.randint(65, 90)) for _ in range(3)])
                numeros = f"{random.randint(1, 9)}{random.randint(0, 9)}{chr(random.randint(65, 90))}{random.randint(0, 9)}"
                placa = f"{letras}{numeros}"
            
            dados.append((
                placa,
                random.choice([True, False]),  # modelo acessível
                random.randint(40, 80)  # capacidade
            ))
        
        query = """
            INSERT INTO onibus (placa, modelo_acessivel, capacidade_maxima)
            VALUES %s
            RETURNING id;
        """
        
        ids = execute_values(self.cursor, query, dados, fetch=True)
        self.onibus_ids = [id[0] for id in ids]
        self.conn.commit()
        print(f"   ↳ {len(self.onibus_ids)} ônibus inseridos")
    
    def populate_paradas(self, quantidade=150):
        """Popula tabela de paradas"""
        print(f"\n🚏 Criando {quantidade} paradas...")
        
        status_list = ['acessivel', 'inacessivel', 'manutencao']
        dados = []
        
        # Centro aproximado de São Paulo
        lat_base = -23.5505
        lon_base = -46.6333
        
        for _ in range(quantidade):
            # Gera coordenadas próximas ao centro
            lat = lat_base + random.uniform(-0.05, 0.05)
            lon = lon_base + random.uniform(-0.05, 0.05)
            
            dados.append((
                round(lat, 7),
                round(lon, 7),
                random.choices(
                    status_list,
                    weights=[0.6, 0.3, 0.1],
                    k=1
                )[0]
            ))
        
        query = """
            INSERT INTO paradas (latitude, longitude, status_acessibilidade)
            VALUES %s
            RETURNING id;
        """
        
        ids = execute_values(self.cursor, query, dados, fetch=True)
        self.paradas_ids = [id[0] for id in ids]
        self.conn.commit()
        print(f"   ↳ {len(self.paradas_ids)} paradas inseridas")
    
    def populate_rotas(self, quantidade=20):
        """Popula tabela de rotas"""
        print(f"\n🛣️ Criando {quantidade} rotas...")
        
        prefixos = ['COR', 'INT', 'CEN', 'NORTE', 'SUL', 'LESTE', 'OESTE', 'TRANS']
        bairros = ['Centro', 'Pinheiros', 'Vila Mariana', 'Santana', 'Santo Amaro', 
                   'Tatuapé', 'Moema', 'Butantã', 'Lapa', 'Penha']
        
        dados = []
        for _ in range(quantidade):
            codigo = f"{random.choice(prefixos)}{random.randint(100, 999)}"
            nome = f"Rota {codigo} - {random.choice(bairros)} ao {random.choice(bairros)}"
            dados.append((codigo, nome))
        
        query = """
            INSERT INTO rotas (codigo_rota, nome_rota)
            VALUES %s
            RETURNING id;
        """
        
        ids = execute_values(self.cursor, query, dados, fetch=True)
        self.rotas_ids = [id[0] for id in ids]
        self.conn.commit()
        print(f"   ↳ {len(self.rotas_ids)} rotas inseridas")
    
    def populate_itinerarios(self, min_paradas=10, max_paradas=30):
        """Popula itinerários (relação rotas x paradas)"""
        print(f"\n🗺️ Criando itinerários...")
        
        dados = []
        for rota_id in self.rotas_ids:
            num_paradas = random.randint(min_paradas, max_paradas)
            # Seleciona paradas aleatórias para esta rota
            paradas_rota = random.sample(self.paradas_ids, min(num_paradas, len(self.paradas_ids)))
            
            for ordem, parada_id in enumerate(paradas_rota, 1):
                # Tempo estimado entre paradas (progressivo)
                tempo_base = timedelta(minutes=ordem * random.randint(2, 5))
                tempo_estimado = (datetime.min + tempo_base).time()
                
                dados.append((
                    rota_id,
                    parada_id,
                    ordem,
                    tempo_estimado
                ))
        
        query = """
            INSERT INTO itinerarios (id_rota, id_parada, ordem_parada, tempo_estimado)
            VALUES %s
        """
        
        execute_values(self.cursor, query, dados)
        self.conn.commit()
        print(f"   ↳ {len(dados)} itinerários inseridos")
    
    def populate_viagens(self, quantidade=100):
        """Popula tabela de viagens"""
        print(f"\n🚍 Criando {quantidade} viagens...")
        
        dados = []
        for _ in range(quantidade):
            # Horário entre 4h e 23h
            hora = random.randint(4, 23)
            minuto = random.randint(0, 59)
            horario = f"{hora:02d}:{minuto:02d}:00"
            
            dados.append((
                random.choice(self.rotas_ids),
                random.choice(self.onibus_ids),
                random.choice(self.motoristas_ids),
                horario,
                random.randint(0, 80)  # lotação atual
            ))
        
        query = """
            INSERT INTO viagens (id_rota, id_onibus, id_motorista, horario_saida, lotacao_atual)
            VALUES %s
            RETURNING id;
        """
        
        ids = execute_values(self.cursor, query, dados, fetch=True)
        self.viagens_ids = [id[0] for id in ids]
        self.conn.commit()
        print(f"   ↳ {len(self.viagens_ids)} viagens inseridas")
    
    def populate_embarques(self, media_por_viagem=30):
        """Popula tabela de embarques"""
        print(f"\n🎫 Criando embarques...")
        
        tipos_pagamento = ['cartao_estudante', 'vale_transporte', 'integracao', 'gratuito']
        dados = []
        
        for viagem_id in self.viagens_ids:
            num_embarques = random.randint(int(media_por_viagem * 0.7), int(media_por_viagem * 1.3))
            passageiros_viagem = random.sample(self.passageiros_ids, min(num_embarques, len(self.passageiros_ids)))
            
            for passageiro_id in passageiros_viagem:
                # Data/hora aleatória nos últimos 30 dias
                dias_atras = random.randint(0, 30)
                hora = random.randint(5, 22)
                minuto = random.randint(0, 59)
                data_hora = datetime.now() - timedelta(days=dias_atras, hours=random.randint(0, 23))
                data_hora = data_hora.replace(hour=hora, minute=minuto, second=0, microsecond=0)
                
                dados.append((
                    viagem_id,
                    passageiro_id,
                    random.choice(self.paradas_ids),
                    data_hora,
                    random.choices(
                        tipos_pagamento,
                        weights=[0.4, 0.3, 0.2, 0.1],
                        k=1
                    )[0]
                ))
        
        query = """
            INSERT INTO embarques (id_viagem, id_passageiro, id_parada_origem, data_hora, tipo_pagamento)
            VALUES %s
        """
        
        execute_values(self.cursor, query, dados)
        self.conn.commit()
        print(f"   ↳ {len(dados)} embarques inseridos")
    
    def populate_feedbacks(self, taxa_feedback=0.3):
        """Popula tabela de feedbacks (30% dos embarques geram feedback)"""
        print(f"\n📊 Criando feedbacks...")
        
        tipos_ocorrencia = ['lotacao', 'mecanica', 'conduta', 'acessibilidade']
        dados = []
        
        # Busca embarques existentes
        self.cursor.execute("""
            SELECT id_viagem, id_passageiro, data_hora 
            FROM embarques
        """)
        embarques = self.cursor.fetchall()
        
        for embarque in random.sample(embarques, int(len(embarques) * taxa_feedback)):
            viagem_id, passageiro_id, data_hora_embarque = embarque
            
            # Feedback ocorre após o embarque
            data_feedback = data_hora_embarque + timedelta(minutes=random.randint(5, 120))
            
            dados.append((
                passageiro_id,
                viagem_id,
                random.choice(tipos_ocorrencia),
                random.randint(1, 5),  # nível de lotação (1-5)
                data_feedback
            ))
        
        if dados:
            query = """
                INSERT INTO feedbacks (id_passageiro, id_viagem, tipo_ocorrencia, nivel_lotacao, data_hora)
                VALUES %s
            """
            
            execute_values(self.cursor, query, dados)
            self.conn.commit()
            print(f"   ↳ {len(dados)} feedbacks inseridos")
        else:
            print("   ↳ Nenhum feedback inserido")
    
    def run(self, limpar=True):
        """Executa todo o processo de população"""
        try:
            self.connect()
            
            if limpar:
                print("🧹 Limpando banco de dados...")
                self.clear_tables()
            
            # Popula na ordem correta
            self.populate_passageiros(200)
            self.populate_emails_passageiro()
            
            self.populate_motoristas(50)
            self.populate_telefones_motorista()
            
            self.populate_onibus(30)
            self.populate_paradas(150)
            self.populate_rotas(20)
            self.populate_itinerarios()
            
            self.populate_viagens(100)
            self.populate_embarques()
            self.populate_feedbacks()
            
            print("\n✅ Banco de dados populado com sucesso!")
            
            # Estatísticas finais
            self.print_statistics()
            
        except Exception as e:
            print(f"\n❌ Erro: {e}")
            self.conn.rollback()
        finally:
            self.close()
    
    def print_statistics(self):
        """Mostra estatísticas do banco populado"""
        print("\n📊 ESTATÍSTICAS FINAIS:")
        
        tables = [
            'passageiros',
            'emails_passageiro',
            'motoristas',
            'telefones_motorista',
            'onibus',
            'paradas',
            'rotas',
            'itinerarios',
            'viagens',
            'embarques',
            'feedbacks'
        ]
        
        for table in tables:
            self.cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = self.cursor.fetchone()[0]
            print(f"   {table}: {count} registros")

# Script de seed SQL alternativo (seed.sql)
def generate_sql_seed():
    """Gera um arquivo seed.sql com INSERTs"""
    print("Gerando seed.sql...")
    
    # Reutiliza a mesma lógica mas gera SQL
    # (Implementação similar mas escrevendo em arquivo)
    pass

if __name__ == "__main__":
    populator = DatabasePopulator()
    populator.run(limpar=True)