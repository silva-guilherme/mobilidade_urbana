from app.database import get_connection
from app import schemas
from typing import List, Optional, Dict, Any
from contextlib import contextmanager
import logging
from psycopg2.extras import RealDictCursor
from psycopg2 import sql

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@contextmanager
def get_cursor(commit: bool = False, dict_cursor: bool = True):
    """
    Context manager para gerenciar conexões com o banco de dados
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor_factory = RealDictCursor if dict_cursor else None
        cursor = conn.cursor(cursor_factory=cursor_factory)
        yield cursor
        if commit:
            conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Erro no banco de dados: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def fetch_one_or_none(cursor):
    """Retorna um registro ou None"""
    result = cursor.fetchone()
    return dict(result) if result else None

def fetch_all(cursor):
    """Retorna todos os registros como dicionários"""
    return [dict(row) for row in cursor.fetchall()]

def row_to_dict(columns, row):
    """Converte uma linha em dicionário"""
    return dict(zip(columns, row)) if row else None



def criar_passageiro(passageiro: schemas.PassageiroCreate) -> Optional[Dict]:
    """
    Cria um novo passageiro com validação de unicidade de email
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se já existe passageiro com mesmo email (se fornecido)
        if hasattr(passageiro, 'emails') and passageiro.emails:
            for email in passageiro.emails:
                cursor.execute("""
                    SELECT 1 FROM emails_passageiro WHERE email = %s
                """, (email,))
                if cursor.fetchone():
                    raise ValueError(f"Email {email} já está em uso")
        
        # Insere passageiro
        query = """
            INSERT INTO passageiros (nome_completo, perfil_acessibilidade)
            VALUES (%s, %s)
            RETURNING id, nome_completo, perfil_acessibilidade, 
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (
            passageiro.nome_completo,
            passageiro.perfil_acessibilidade
        ))
        
        novo_passageiro = fetch_one_or_none(cursor)
        
        # Insere emails se fornecidos e adiciona ao retorno
        emails_retorno = []
        if hasattr(passageiro, 'emails') and passageiro.emails and novo_passageiro:
            for email in passageiro.emails:
                cursor.execute("""
                    INSERT INTO emails_passageiro (id_passageiro, email)
                    VALUES (%s, %s)
                    RETURNING email
                """, (novo_passageiro['id'], email))
                
                email_inserido = fetch_one_or_none(cursor)
                if email_inserido:
                    emails_retorno.append(email_inserido['email'])
        
        # 🔥 IMPORTANTE: Adiciona emails ao retorno
        if novo_passageiro:
            novo_passageiro['emails'] = emails_retorno
        
        logger.info(f"Passageiro criado: ID {novo_passageiro['id']}")
        return novo_passageiro

def listar_passageiros(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    perfil: Optional[str] = None,
    include_emails: bool = True
) -> List[Dict]:
    """
    Lista passageiros com filtros opcionais
    """
    with get_cursor() as cursor:
        # Constrói query base
        base_query = """
            SELECT 
                p.id,
                p.nome_completo,
                p.perfil_acessibilidade,
                TO_CHAR(p.data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM passageiros p
            WHERE 1=1
        """
        
        params = []
        
        # Aplica filtros
        if search:
            base_query += " AND (p.nome_completo ILIKE %s OR EXISTS (SELECT 1 FROM emails_passageiro e WHERE e.id_passageiro = p.id AND e.email ILIKE %s))"
            search_param = f"%{search}%"
            params.extend([search_param, search_param])
        
        if perfil:
            base_query += " AND p.perfil_acessibilidade = %s"
            params.append(perfil)
        
        # Adiciona paginação
        base_query += " ORDER BY p.id OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cursor.execute(base_query, params)
        passageiros = fetch_all(cursor)
        
        # Busca emails se solicitado
        if include_emails and passageiros:
            passageiro_ids = [p['id'] for p in passageiros]
            cursor.execute("""
                SELECT id_passageiro, email 
                FROM emails_passageiro 
                WHERE id_passageiro = ANY(%s)
                ORDER BY id_passageiro, email
            """, (passageiro_ids,))
            
            emails = fetch_all(cursor)
            
            # Agrupa emails por passageiro
            emails_por_passageiro = {}
            for email in emails:
                pid = email['id_passageiro']
                if pid not in emails_por_passageiro:
                    emails_por_passageiro[pid] = []
                emails_por_passageiro[pid].append(email['email'])
            
            # Adiciona emails aos passageiros
            for passageiro in passageiros:
                passageiro['emails'] = emails_por_passageiro.get(passageiro['id'], [])
        
        return passageiros

def obter_passageiro(passageiro_id: int, include_emails: bool = True) -> Optional[Dict]:
    """
    Obtém um passageiro por ID com seus emails
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                id, 
                nome_completo, 
                perfil_acessibilidade,
                TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM passageiros
            WHERE id = %s
        """
        cursor.execute(query, (passageiro_id,))
        passageiro = fetch_one_or_none(cursor)
        
        if passageiro and include_emails:
            cursor.execute("""
                SELECT email FROM emails_passageiro
                WHERE id_passageiro = %s
                ORDER BY email
            """, (passageiro_id,))
            emails = cursor.fetchall()
            passageiro['emails'] = [e['email'] for e in emails]
        
        return passageiro

def atualizar_passageiro(passageiro_id: int, dados: schemas.PassageiroCreate) -> Optional[Dict]:
    """
    Atualiza um passageiro existente (sem alterar emails)
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se passageiro existe
        cursor.execute("SELECT id FROM passageiros WHERE id = %s", (passageiro_id,))
        if not cursor.fetchone():
            return None
        
        # Atualiza dados principais
        query = """
            UPDATE passageiros
            SET nome_completo = %s,
                perfil_acessibilidade = %s
            WHERE id = %s
            RETURNING id, nome_completo, perfil_acessibilidade, 
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (
            dados.nome_completo,
            dados.perfil_acessibilidade,
            passageiro_id
        ))
        
        passageiro_atualizado = fetch_one_or_none(cursor)
        
        # 🔥 Busca emails atuais do passageiro
        if passageiro_atualizado:
            cursor.execute("""
                SELECT email FROM emails_passageiro
                WHERE id_passageiro = %s
                ORDER BY email
            """, (passageiro_id,))
            emails = cursor.fetchall()
            passageiro_atualizado['emails'] = [e['email'] for e in emails]
        
        logger.info(f"Passageiro atualizado: ID {passageiro_id}")
        return passageiro_atualizado

def deletar_passageiro(passageiro_id: int) -> Optional[Dict]:
    """
    Deleta um passageiro e todos os dados relacionados
    """
    with get_cursor(commit=True) as cursor:
        # Busca dados antes de deletar
        cursor.execute("""
            SELECT id, nome_completo FROM passageiros WHERE id = %s
        """, (passageiro_id,))
        passageiro = fetch_one_or_none(cursor)
        
        if not passageiro:
            return None
        
        # Deleta emails (ON DELETE CASCADE deve cuidar disso se configurado)
        cursor.execute("DELETE FROM emails_passageiro WHERE id_passageiro = %s", (passageiro_id,))
        
        # Deleta feedbacks relacionados
        cursor.execute("DELETE FROM feedbacks WHERE id_passageiro = %s", (passageiro_id,))
        
        # Deleta embarques relacionados
        cursor.execute("DELETE FROM embarques WHERE id_passageiro = %s", (passageiro_id,))
        
        # Deleta o passageiro
        cursor.execute("DELETE FROM passageiros WHERE id = %s", (passageiro_id,))
        
        logger.info(f"Passageiro deletado: ID {passageiro_id}")
        return passageiro

# ==============================
# EMAIL PASSAGEIRO
# ==============================

def criar_email_passageiro(email: schemas.EmailPassageiroCreate) -> Optional[Dict]:
    """
    Adiciona um email a um passageiro
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se passageiro existe
        cursor.execute("SELECT id FROM passageiros WHERE id = %s", (email.id_passageiro,))
        if not cursor.fetchone():
            raise ValueError(f"Passageiro ID {email.id_passageiro} não encontrado")
        
        # Verifica se email já existe
        cursor.execute("SELECT 1 FROM emails_passageiro WHERE email = %s", (email.email,))
        if cursor.fetchone():
            raise ValueError(f"Email {email.email} já está em uso")
        
        query = """
            INSERT INTO emails_passageiro (id_passageiro, email)
            VALUES (%s, %s)
            RETURNING id_passageiro, email, 
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (email.id_passageiro, email.email))
        
        novo_email = fetch_one_or_none(cursor)
        logger.info(f"Email adicionado ao passageiro {email.id_passageiro}")
        return novo_email

def listar_emails_passageiro(passageiro_id: int) -> List[Dict]:
    """
    Lista todos os emails de um passageiro
    """
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT id_passageiro, email, 
                   TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM emails_passageiro
            WHERE id_passageiro = %s
            ORDER BY email
        """, (passageiro_id,))
        
        return fetch_all(cursor)

def deletar_email_passageiro(passageiro_id: int, email: str) -> Optional[Dict]:
    """
    Remove um email de um passageiro
    """
    with get_cursor(commit=True) as cursor:
        query = """
            DELETE FROM emails_passageiro
            WHERE id_passageiro = %s AND email = %s
            RETURNING id_passageiro, email
        """
        cursor.execute(query, (passageiro_id, email))
        
        email_deletado = fetch_one_or_none(cursor)
        
        if email_deletado:
            logger.info(f"Email removido do passageiro {passageiro_id}")
        
        return email_deletado

# ==============================
# MOTORISTA
# ==============================

def criar_motorista(motorista: schemas.MotoristaCreate) -> Optional[Dict]:
    """
    Cria um novo motorista
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se CNH já existe
        cursor.execute("SELECT id FROM motoristas WHERE cnh = %s", (motorista.cnh,))
        if cursor.fetchone():
            raise ValueError(f"CNH {motorista.cnh} já está cadastrada")
        
        # Insere motorista
        query = """
            INSERT INTO motoristas (nome_completo, cnh, status)
            VALUES (%s, %s, %s)
            RETURNING id, nome_completo, cnh, status, 
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (
            motorista.nome_completo,
            motorista.cnh,
            motorista.status
        ))
        
        novo_motorista = fetch_one_or_none(cursor)
        
        # Insere telefones se fornecidos
        telefones_retorno = []
        if hasattr(motorista, 'telefones') and motorista.telefones and novo_motorista:
            for telefone in motorista.telefones:
                cursor.execute("""
                    INSERT INTO telefones_motorista (id_motorista, numero, tipo)
                    VALUES (%s, %s, %s)
                    RETURNING numero, tipo
                """, (novo_motorista['id'], telefone.numero, telefone.tipo))
                
                tel = fetch_one_or_none(cursor)
                if tel:
                    telefones_retorno.append(tel)
        
        # 🔥 IMPORTANTE: Adiciona telefones ao retorno
        if novo_motorista:
            novo_motorista['telefones'] = telefones_retorno
        
        logger.info(f"Motorista criado: ID {novo_motorista['id']}")
        return novo_motorista

def listar_motoristas(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    search: Optional[str] = None,
    include_telefones: bool = True
) -> List[Dict]:
    """
    Lista motoristas com filtros opcionais
    """
    with get_cursor() as cursor:
        # Query base
        base_query = """
            SELECT 
                m.id,
                m.nome_completo,
                m.cnh,
                m.status,
                TO_CHAR(m.data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM motoristas m
            WHERE 1=1
        """
        
        params = []
        
        if status:
            base_query += " AND m.status = %s"
            params.append(status)
        
        if search:
            base_query += " AND m.nome_completo ILIKE %s"
            params.append(f"%{search}%")
        
        base_query += " ORDER BY m.id OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cursor.execute(base_query, params)
        motoristas = fetch_all(cursor)
        
        # Busca telefones se solicitado
        if include_telefones and motoristas:
            motorista_ids = [m['id'] for m in motoristas]
            cursor.execute("""
                SELECT id_motorista, numero, tipo 
                FROM telefones_motorista 
                WHERE id_motorista = ANY(%s)
                ORDER BY id_motorista, tipo
            """, (motorista_ids,))
            
            telefones = fetch_all(cursor)
            
            # Agrupa telefones por motorista
            telefones_por_motorista = {}
            for tel in telefones:
                mid = tel['id_motorista']
                if mid not in telefones_por_motorista:
                    telefones_por_motorista[mid] = []
                telefones_por_motorista[mid].append({
                    'numero': tel['numero'],
                    'tipo': tel['tipo']
                })
            
            # Adiciona telefones aos motoristas
            for motorista in motoristas:
                motorista['telefones'] = telefones_por_motorista.get(motorista['id'], [])
        
        return motoristas

def obter_motorista(motorista_id: int, include_telefones: bool = True) -> Optional[Dict]:
    """
    Obtém um motorista por ID
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                id, 
                nome_completo, 
                cnh, 
                status,
                TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM motoristas
            WHERE id = %s
        """
        cursor.execute(query, (motorista_id,))
        motorista = fetch_one_or_none(cursor)
        
        if motorista and include_telefones:
            cursor.execute("""
                SELECT numero, tipo FROM telefones_motorista
                WHERE id_motorista = %s
                ORDER BY tipo
            """, (motorista_id,))
            telefones = fetch_all(cursor)
            motorista['telefones'] = telefones
        
        return motorista

def atualizar_motorista(motorista_id: int, dados: schemas.MotoristaCreate) -> Optional[Dict]:
    """
    Atualiza um motorista existente E seus telefones
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se motorista existe
        cursor.execute("SELECT id FROM motoristas WHERE id = %s", (motorista_id,))
        if not cursor.fetchone():
            return None
        
        # Verifica se nova CNH já existe (se alterada)
        cursor.execute("""
            SELECT id FROM motoristas 
            WHERE cnh = %s AND id != %s
        """, (dados.cnh, motorista_id))
        if cursor.fetchone():
            raise ValueError(f"CNH {dados.cnh} já está em uso por outro motorista")
        
        # Atualiza motorista
        query = """
            UPDATE motoristas
            SET nome_completo = %s,
                cnh = %s,
                status = %s
            WHERE id = %s
            RETURNING id, nome_completo, cnh, status, 
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (
            dados.nome_completo,
            dados.cnh,
            dados.status,
            motorista_id
        ))
        
        motorista_atualizado = fetch_one_or_none(cursor)
        
        # 🔥 NOVO: Gerencia telefones (remove antigos e insere novos)
        if hasattr(dados, 'telefones') and dados.telefones is not None:
            # Remove telefones antigos
            cursor.execute("DELETE FROM telefones_motorista WHERE id_motorista = %s", (motorista_id,))
            
            # Insere novos telefones
            telefones_retorno = []
            for tel in dados.telefones:
                cursor.execute("""
                    INSERT INTO telefones_motorista (id_motorista, numero, tipo)
                    VALUES (%s, %s, %s)
                    RETURNING numero, tipo
                """, (motorista_id, tel.numero, tel.tipo))
                
                telefone_inserido = fetch_one_or_none(cursor)
                if telefone_inserido:
                    telefones_retorno.append(telefone_inserido)
            
            motorista_atualizado['telefones'] = telefones_retorno
        else:
            # Se não enviou telefones, mantém os existentes
            cursor.execute("""
                SELECT numero, tipo FROM telefones_motorista
                WHERE id_motorista = %s
            """, (motorista_id,))
            motorista_atualizado['telefones'] = fetch_all(cursor)
        
        logger.info(f"Motorista atualizado: ID {motorista_id}")
        return motorista_atualizado

def deletar_motorista(motorista_id: int) -> Optional[Dict]:
    """
    Deleta um motorista e dados relacionados
    """
    with get_cursor(commit=True) as cursor:
        # Busca dados antes de deletar
        cursor.execute("SELECT id, nome_completo FROM motoristas WHERE id = %s", (motorista_id,))
        motorista = fetch_one_or_none(cursor)
        
        if not motorista:
            return None
        
        # Deleta telefones
        cursor.execute("DELETE FROM telefones_motorista WHERE id_motorista = %s", (motorista_id,))
        
        # Verifica se há viagens associadas
        cursor.execute("SELECT id FROM viagens WHERE id_motorista = %s LIMIT 1", (motorista_id,))
        if cursor.fetchone():
            # Opção: atualizar viagens para NULL ou negar deleção
            raise ValueError("Motorista possui viagens associadas. Remova as viagens primeiro.")
        
        # Deleta motorista
        cursor.execute("DELETE FROM motoristas WHERE id = %s", (motorista_id,))
        
        logger.info(f"Motorista deletado: ID {motorista_id}")
        return motorista

# ==============================
# TELEFONE MOTORISTA
# ==============================

def criar_telefone_motorista(telefone: schemas.TelefoneMotoristaCreate) -> Optional[Dict]:
    """
    Adiciona um telefone a um motorista
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se motorista existe
        cursor.execute("SELECT id FROM motoristas WHERE id = %s", (telefone.id_motorista,))
        if not cursor.fetchone():
            raise ValueError(f"Motorista ID {telefone.id_motorista} não encontrado")
        
        query = """
            INSERT INTO telefones_motorista (id_motorista, numero, tipo)
            VALUES (%s, %s, %s)
            RETURNING id_motorista, numero, tipo
        """
        cursor.execute(query, (
            telefone.id_motorista,
            telefone.numero,
            telefone.tipo
        ))
        
        novo_telefone = fetch_one_or_none(cursor)
        logger.info(f"Telefone adicionado ao motorista {telefone.id_motorista}")
        return novo_telefone

def listar_motoristas(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    search: Optional[str] = None,
    include_telefones: bool = True
) -> List[Dict]:
    """
    Lista motoristas com filtros opcionais
    """
    with get_cursor() as cursor:
        # Query base
        base_query = """
            SELECT 
                m.id,
                m.nome_completo,
                m.cnh,
                m.status,
                TO_CHAR(m.data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM motoristas m
            WHERE 1=1
        """
        
        params = []
        
        if status:
            base_query += " AND m.status = %s"
            params.append(status)
        
        if search:
            base_query += " AND m.nome_completo ILIKE %s"
            params.append(f"%{search}%")
        
        base_query += " ORDER BY m.id OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cursor.execute(base_query, params)
        motoristas = fetch_all(cursor)
        
        # Busca telefones se solicitado
        if include_telefones and motoristas:
            motorista_ids = [m['id'] for m in motoristas]
            cursor.execute("""
                SELECT id_motorista, numero, tipo 
                FROM telefones_motorista 
                WHERE id_motorista = ANY(%s)
                ORDER BY id_motorista, tipo
            """, (motorista_ids,))
            
            telefones = fetch_all(cursor)
            
            # Agrupa telefones por motorista (só numero e tipo)
            telefones_por_motorista = {}
            for tel in telefones:
                mid = tel['id_motorista']
                if mid not in telefones_por_motorista:
                    telefones_por_motorista[mid] = []
                telefones_por_motorista[mid].append({
                    'numero': tel['numero'],
                    'tipo': tel['tipo']  # ← SÓ numero e tipo, SEM id_motorista
                })
            
            # Adiciona telefones aos motoristas
            for motorista in motoristas:
                motorista['telefones'] = telefones_por_motorista.get(motorista['id'], [])
        
        return motoristas

def deletar_telefone_motorista(motorista_id: int, numero: str) -> Optional[Dict]:
    """
    Remove um telefone de um motorista
    """
    with get_cursor(commit=True) as cursor:
        query = """
            DELETE FROM telefones_motorista
            WHERE id_motorista = %s AND numero = %s
            RETURNING id_motorista, numero, tipo
        """
        cursor.execute(query, (motorista_id, numero))
        
        telefone = fetch_one_or_none(cursor)
        
        if telefone:
            logger.info(f"Telefone removido do motorista {motorista_id}")
        
        return telefone

# ==============================
# ÔNIBUS
# ==============================

def criar_onibus(onibus: schemas.OnibusCreate) -> Optional[Dict]:
    """
    Cria um novo ônibus
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se placa já existe
        cursor.execute("SELECT id FROM onibus WHERE placa = %s", (onibus.placa,))
        if cursor.fetchone():
            raise ValueError(f"Placa {onibus.placa} já está cadastrada")
        
        query = """
            INSERT INTO onibus (placa, modelo_acessivel, capacidade_maxima)
            VALUES (%s, %s, %s)
            RETURNING id, placa, modelo_acessivel, capacidade_maxima,
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (
            onibus.placa,
            onibus.modelo_acessivel,
            onibus.capacidade_maxima
        ))
        
        novo_onibus = fetch_one_or_none(cursor)
        logger.info(f"Ônibus criado: ID {novo_onibus['id']}")
        return novo_onibus

def listar_onibus(
    skip: int = 0, 
    limit: int = 100, 
    acessivel: Optional[bool] = None,
    capacidade_min: Optional[int] = None
) -> List[Dict]:
    """
    Lista ônibus com filtros opcionais
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                id, 
                placa, 
                modelo_acessivel, 
                capacidade_maxima,
                TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM onibus
            WHERE 1=1
        """
        
        params = []
        
        if acessivel is not None:
            query += " AND modelo_acessivel = %s"
            params.append(acessivel)
        
        if capacidade_min:
            query += " AND capacidade_maxima >= %s"
            params.append(capacidade_min)
        
        query += " ORDER BY id OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cursor.execute(query, params)
        return fetch_all(cursor)

def obter_onibus(onibus_id: int) -> Optional[Dict]:
    """
    Obtém um ônibus por ID
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                id, 
                placa, 
                modelo_acessivel, 
                capacidade_maxima,
                TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM onibus
            WHERE id = %s
        """
        cursor.execute(query, (onibus_id,))
        return fetch_one_or_none(cursor)

def atualizar_onibus(onibus_id: int, dados: schemas.OnibusCreate) -> Optional[Dict]:
    """
    Atualiza um ônibus existente
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se ônibus existe
        cursor.execute("SELECT id FROM onibus WHERE id = %s", (onibus_id,))
        if not cursor.fetchone():
            return None
        
        # Verifica se nova placa já existe
        cursor.execute("""
            SELECT id FROM onibus 
            WHERE placa = %s AND id != %s
        """, (dados.placa, onibus_id))
        if cursor.fetchone():
            raise ValueError(f"Placa {dados.placa} já está em uso por outro ônibus")
        
        query = """
            UPDATE onibus
            SET placa = %s,
                modelo_acessivel = %s,
                capacidade_maxima = %s
            WHERE id = %s
            RETURNING id, placa, modelo_acessivel, capacidade_maxima,
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (
            dados.placa,
            dados.modelo_acessivel,
            dados.capacidade_maxima,
            onibus_id
        ))
        
        onibus_atualizado = fetch_one_or_none(cursor)
        logger.info(f"Ônibus atualizado: ID {onibus_id}")
        return onibus_atualizado

def deletar_onibus(onibus_id: int) -> Optional[Dict]:
    """
    Deleta um ônibus
    """
    with get_cursor(commit=True) as cursor:
        # Busca dados antes de deletar
        cursor.execute("SELECT id, placa FROM onibus WHERE id = %s", (onibus_id,))
        onibus = fetch_one_or_none(cursor)
        
        if not onibus:
            return None
        
        # Verifica se há viagens associadas
        cursor.execute("SELECT id FROM viagens WHERE id_onibus = %s LIMIT 1", (onibus_id,))
        if cursor.fetchone():
            raise ValueError("Ônibus possui viagens associadas. Remova as viagens primeiro.")
        
        cursor.execute("DELETE FROM onibus WHERE id = %s", (onibus_id,))
        
        logger.info(f"Ônibus deletado: ID {onibus_id}")
        return onibus

# ==============================
# ROTAS
# ==============================

def criar_rota(rota: schemas.RotaCreate) -> Optional[Dict]:
    """
    Cria uma nova rota
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se código da rota já existe
        cursor.execute("SELECT id FROM rotas WHERE codigo_rota = %s", (rota.codigo_rota,))
        if cursor.fetchone():
            raise ValueError(f"Código de rota {rota.codigo_rota} já existe")
        
        query = """
            INSERT INTO rotas (codigo_rota, nome_rota)
            VALUES (%s, %s)
            RETURNING id, codigo_rota, nome_rota,
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (rota.codigo_rota, rota.nome_rota))
        
        nova_rota = fetch_one_or_none(cursor)
        logger.info(f"Rota criada: ID {nova_rota['id']}")
        return nova_rota

def listar_rotas(skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[Dict]:
    """
    Lista rotas com filtro opcional
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                id, 
                codigo_rota, 
                nome_rota,
                TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM rotas
            WHERE 1=1
        """
        
        params = []
        
        if search:
            query += " AND (codigo_rota ILIKE %s OR nome_rota ILIKE %s)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param])
        
        query += " ORDER BY codigo_rota OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cursor.execute(query, params)
        return fetch_all(cursor)

def obter_rota(rota_id: int, include_itinerario: bool = True) -> Optional[Dict]:
    """
    Obtém uma rota por ID
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                id, 
                codigo_rota, 
                nome_rota,
                TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM rotas
            WHERE id = %s
        """
        cursor.execute(query, (rota_id,))
        rota = fetch_one_or_none(cursor)
        
        if rota and include_itinerario:
            # Busca itinerário da rota
            cursor.execute("""
                SELECT 
                    i.id_parada,
                    i.ordem_parada,
                    i.tempo_estimado,
                    p.latitude,
                    p.longitude,
                    p.status_acessibilidade
                FROM itinerarios i
                JOIN paradas p ON i.id_parada = p.id
                WHERE i.id_rota = %s
                ORDER BY i.ordem_parada
            """, (rota_id,))
            
            itinerario = fetch_all(cursor)
            rota['itinerario'] = itinerario
        
        return rota

def atualizar_rota(rota_id: int, dados: schemas.RotaCreate) -> Optional[Dict]:
    """
    Atualiza uma rota existente
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se rota existe
        cursor.execute("SELECT id FROM rotas WHERE id = %s", (rota_id,))
        if not cursor.fetchone():
            return None
        
        # Verifica se novo código já existe
        cursor.execute("""
            SELECT id FROM rotas 
            WHERE codigo_rota = %s AND id != %s
        """, (dados.codigo_rota, rota_id))
        if cursor.fetchone():
            raise ValueError(f"Código de rota {dados.codigo_rota} já está em uso")
        
        query = """
            UPDATE rotas
            SET codigo_rota = %s,
                nome_rota = %s
            WHERE id = %s
            RETURNING id, codigo_rota, nome_rota,
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (dados.codigo_rota, dados.nome_rota, rota_id))
        
        rota_atualizada = fetch_one_or_none(cursor)
        logger.info(f"Rota atualizada: ID {rota_id}")
        return rota_atualizada

def deletar_rota(rota_id: int) -> Optional[Dict]:
    """
    Deleta uma rota
    """
    with get_cursor(commit=True) as cursor:
        # Busca dados antes de deletar
        cursor.execute("SELECT id, codigo_rota FROM rotas WHERE id = %s", (rota_id,))
        rota = fetch_one_or_none(cursor)
        
        if not rota:
            return None
        
        # Verifica se há viagens associadas
        cursor.execute("SELECT id FROM viagens WHERE id_rota = %s LIMIT 1", (rota_id,))
        if cursor.fetchone():
            raise ValueError("Rota possui viagens associadas. Remova as viagens primeiro.")
        
        # Deleta itinerários
        cursor.execute("DELETE FROM itinerarios WHERE id_rota = %s", (rota_id,))
        
        # Deleta rota
        cursor.execute("DELETE FROM rotas WHERE id = %s", (rota_id,))
        
        logger.info(f"Rota deletada: ID {rota_id}")
        return rota

# ==============================
# PARADAS
# ==============================

def criar_parada(parada: schemas.ParadaCreate) -> Optional[Dict]:
    """
    Cria uma nova parada
    """
    with get_cursor(commit=True) as cursor:
        query = """
            INSERT INTO paradas (latitude, longitude, status_acessibilidade)
            VALUES (%s, %s, %s)
            RETURNING id, latitude, longitude, status_acessibilidade,
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (
            parada.latitude,
            parada.longitude,
            parada.status_acessibilidade
        ))
        
        nova_parada = fetch_one_or_none(cursor)
        logger.info(f"Parada criada: ID {nova_parada['id']}")
        return nova_parada

def listar_paradas(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    lat_min: Optional[float] = None,
    lat_max: Optional[float] = None,
    lon_min: Optional[float] = None,
    lon_max: Optional[float] = None
) -> List[Dict]:
    """
    Lista paradas com filtros geográficos opcionais
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                id, 
                latitude, 
                longitude, 
                status_acessibilidade,
                TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM paradas
            WHERE 1=1
        """
        
        params = []
        
        if status:
            query += " AND status_acessibilidade = %s"
            params.append(status)
        
        if lat_min:
            query += " AND latitude >= %s"
            params.append(lat_min)
        
        if lat_max:
            query += " AND latitude <= %s"
            params.append(lat_max)
        
        if lon_min:
            query += " AND longitude >= %s"
            params.append(lon_min)
        
        if lon_max:
            query += " AND longitude <= %s"
            params.append(lon_max)
        
        query += " ORDER BY id OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cursor.execute(query, params)
        return fetch_all(cursor)

def obter_parada(parada_id: int) -> Optional[Dict]:
    """
    Obtém uma parada por ID
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                id, 
                latitude, 
                longitude, 
                status_acessibilidade,
                TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
            FROM paradas
            WHERE id = %s
        """
        cursor.execute(query, (parada_id,))
        return fetch_one_or_none(cursor)

def atualizar_parada(parada_id: int, dados: schemas.ParadaCreate) -> Optional[Dict]:
    """
    Atualiza uma parada existente
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se parada existe
        cursor.execute("SELECT id FROM paradas WHERE id = %s", (parada_id,))
        if not cursor.fetchone():
            return None
        
        query = """
            UPDATE paradas
            SET latitude = %s,
                longitude = %s,
                status_acessibilidade = %s
            WHERE id = %s
            RETURNING id, latitude, longitude, status_acessibilidade,
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (
            dados.latitude,
            dados.longitude,
            dados.status_acessibilidade,
            parada_id
        ))
        
        parada_atualizada = fetch_one_or_none(cursor)
        logger.info(f"Parada atualizada: ID {parada_id}")
        return parada_atualizada

def deletar_parada(parada_id: int) -> Optional[Dict]:
    """
    Deleta uma parada
    """
    with get_cursor(commit=True) as cursor:
        # Busca dados antes de deletar
        cursor.execute("SELECT id FROM paradas WHERE id = %s", (parada_id,))
        parada = fetch_one_or_none(cursor)
        
        if not parada:
            return None
        
        # Verifica se está em itinerários
        cursor.execute("SELECT id_rota FROM itinerarios WHERE id_parada = %s LIMIT 1", (parada_id,))
        if cursor.fetchone():
            raise ValueError("Parada está em itinerários de rotas. Remova das rotas primeiro.")
        
        # Verifica se há embarques
        cursor.execute("SELECT id_viagem FROM embarques WHERE id_parada_origem = %s LIMIT 1", (parada_id,))
        if cursor.fetchone():
            raise ValueError("Parada possui embarques associados.")
        
        cursor.execute("DELETE FROM paradas WHERE id = %s", (parada_id,))
        
        logger.info(f"Parada deletada: ID {parada_id}")
        return parada

# ==============================
# VIAGENS
# ==============================

def criar_viagem(viagem: schemas.ViagemCreate) -> Optional[Dict]:
    """
    Cria uma nova viagem
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se rota existe
        cursor.execute("SELECT id FROM rotas WHERE id = %s", (viagem.id_rota,))
        if not cursor.fetchone():
            raise ValueError(f"Rota ID {viagem.id_rota} não encontrada")
        
        # Verifica se ônibus existe
        cursor.execute("SELECT id, capacidade_maxima FROM onibus WHERE id = %s", (viagem.id_onibus,))
        onibus = cursor.fetchone()
        if not onibus:
            raise ValueError(f"Ônibus ID {viagem.id_onibus} não encontrado")
        
        # Verifica se lotação não excede capacidade
        if viagem.lotacao_atual > onibus['capacidade_maxima']:
            raise ValueError(f"Lotação não pode exceder capacidade máxima de {onibus['capacidade_maxima']}")
        
        # Verifica se motorista existe
        cursor.execute("SELECT id FROM motoristas WHERE id = %s", (viagem.id_motorista,))
        if not cursor.fetchone():
            raise ValueError(f"Motorista ID {viagem.id_motorista} não encontrado")
        
        query = """
            INSERT INTO viagens (id_rota, id_onibus, id_motorista, horario_saida, lotacao_atual)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, id_rota, id_onibus, id_motorista, horario_saida, lotacao_atual,
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (
            viagem.id_rota,
            viagem.id_onibus,
            viagem.id_motorista,
            viagem.horario_saida,
            viagem.lotacao_atual
        ))
        
        nova_viagem = fetch_one_or_none(cursor)
        logger.info(f"Viagem criada: ID {nova_viagem['id']}")
        return nova_viagem

def listar_viagens(
    skip: int = 0, 
    limit: int = 100,
    rota_id: Optional[int] = None,
    motorista_id: Optional[int] = None,
    onibus_id: Optional[int] = None,
    data_inicio: Optional[str] = None,
    data_fim: Optional[str] = None
) -> List[Dict]:
    """
    Lista viagens com filtros opcionais
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                v.id,
                v.id_rota,
                v.id_onibus,
                v.id_motorista,
                v.horario_saida,
                v.lotacao_atual,
                TO_CHAR(v.data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao,
                r.codigo_rota,
                r.nome_rota,
                o.placa as onibus_placa,
                m.nome_completo as motorista_nome
            FROM viagens v
            JOIN rotas r ON v.id_rota = r.id
            JOIN onibus o ON v.id_onibus = o.id
            JOIN motoristas m ON v.id_motorista = m.id
            WHERE 1=1
        """
        
        params = []
        
        if rota_id:
            query += " AND v.id_rota = %s"
            params.append(rota_id)
        
        if motorista_id:
            query += " AND v.id_motorista = %s"
            params.append(motorista_id)
        
        if onibus_id:
            query += " AND v.id_onibus = %s"
            params.append(onibus_id)
        
        if data_inicio:
            query += " AND v.data_criacao >= %s"
            params.append(data_inicio)
        
        if data_fim:
            query += " AND v.data_criacao <= %s"
            params.append(data_fim)
        
        query += " ORDER BY v.data_criacao DESC OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cursor.execute(query, params)
        return fetch_all(cursor)

def obter_viagem(viagem_id: int, include_detalhes: bool = True) -> Optional[Dict]:
    """
    Obtém uma viagem por ID
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                v.id,
                v.id_rota,
                v.id_onibus,
                v.id_motorista,
                v.horario_saida,
                v.lotacao_atual,
                TO_CHAR(v.data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao,
                r.codigo_rota,
                r.nome_rota,
                o.placa as onibus_placa,
                o.modelo_acessivel,
                o.capacidade_maxima,
                m.nome_completo as motorista_nome,
                m.cnh as motorista_cnh
            FROM viagens v
            JOIN rotas r ON v.id_rota = r.id
            JOIN onibus o ON v.id_onibus = o.id
            JOIN motoristas m ON v.id_motorista = m.id
            WHERE v.id = %s
        """
        cursor.execute(query, (viagem_id,))
        viagem = fetch_one_or_none(cursor)
        
        if viagem and include_detalhes:
            # Busca embarques da viagem
            cursor.execute("""
                SELECT 
                    e.id_passageiro,
                    e.id_parada_origem,
                    e.data_hora,
                    e.tipo_pagamento,
                    p.nome_completo as passageiro_nome,
                    p.perfil_acessibilidade
                FROM embarques e
                JOIN passageiros p ON e.id_passageiro = p.id
                WHERE e.id_viagem = %s
                ORDER BY e.data_hora
            """, (viagem_id,))
            
            viagem['embarques'] = fetch_all(cursor)
        
        return viagem

def atualizar_viagem(viagem_id: int, dados: schemas.ViagemCreate) -> Optional[Dict]:
    """
    Atualiza uma viagem existente
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se viagem existe
        cursor.execute("SELECT id FROM viagens WHERE id = %s", (viagem_id,))
        if not cursor.fetchone():
            return None
        
        # Verifica lotação
        if dados.lotacao_atual:
            cursor.execute("SELECT capacidade_maxima FROM onibus WHERE id = %s", (dados.id_onibus,))
            onibus = cursor.fetchone()
            if onibus and dados.lotacao_atual > onibus['capacidade_maxima']:
                raise ValueError(f"Lotação não pode exceder capacidade máxima de {onibus['capacidade_maxima']}")
        
        query = """
            UPDATE viagens
            SET id_rota = %s,
                id_onibus = %s,
                id_motorista = %s,
                horario_saida = %s,
                lotacao_atual = %s
            WHERE id = %s
            RETURNING id, id_rota, id_onibus, id_motorista, horario_saida, lotacao_atual,
                      TO_CHAR(data_criacao, 'YYYY-MM-DD HH24:MI:SS') as data_criacao
        """
        cursor.execute(query, (
            dados.id_rota,
            dados.id_onibus,
            dados.id_motorista,
            dados.horario_saida,
            dados.lotacao_atual,
            viagem_id
        ))
        
        viagem_atualizada = fetch_one_or_none(cursor)
        logger.info(f"Viagem atualizada: ID {viagem_id}")
        return viagem_atualizada

def deletar_viagem(viagem_id: int) -> Optional[Dict]:
    """
    Deleta uma viagem
    """
    with get_cursor(commit=True) as cursor:
        # Busca dados antes de deletar
        cursor.execute("SELECT id FROM viagens WHERE id = %s", (viagem_id,))
        viagem = fetch_one_or_none(cursor)
        
        if not viagem:
            return None
        
        # Deleta feedbacks relacionados
        cursor.execute("DELETE FROM feedbacks WHERE id_viagem = %s", (viagem_id,))
        
        # Deleta embarques relacionados
        cursor.execute("DELETE FROM embarques WHERE id_viagem = %s", (viagem_id,))
        
        # Deleta viagem
        cursor.execute("DELETE FROM viagens WHERE id = %s", (viagem_id,))
        
        logger.info(f"Viagem deletada: ID {viagem_id}")
        return viagem

# ==============================
# EMBARQUE
# ==============================

def criar_embarque(embarque: schemas.EmbarqueCreate) -> Optional[Dict]:
    """
    Cria um novo embarque
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se viagem existe
        cursor.execute("""
            SELECT id, lotacao_atual, (SELECT capacidade_maxima FROM onibus WHERE id = v.id_onibus) as capacidade
            FROM viagens v WHERE id = %s
        """, (embarque.id_viagem,))
        viagem = cursor.fetchone()
        if not viagem:
            raise ValueError(f"Viagem ID {embarque.id_viagem} não encontrada")
        
        # Verifica se passageiro existe
        cursor.execute("SELECT id FROM passageiros WHERE id = %s", (embarque.id_passageiro,))
        if not cursor.fetchone():
            raise ValueError(f"Passageiro ID {embarque.id_passageiro} não encontrado")
        
        # Verifica se já existe embarque para esta viagem/passageiro
        cursor.execute("""
            SELECT 1 FROM embarques 
            WHERE id_viagem = %s AND id_passageiro = %s
        """, (embarque.id_viagem, embarque.id_passageiro))
        if cursor.fetchone():
            raise ValueError("Passageiro já possui embarque nesta viagem")
        
        # Verifica capacidade
        if viagem['lotacao_atual'] >= viagem['capacidade']:
            raise ValueError("Ônibus está lotado")
        
        query = """
            INSERT INTO embarques (id_viagem, id_passageiro, id_parada_origem, data_hora, tipo_pagamento)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id_viagem, id_passageiro, id_parada_origem, data_hora, tipo_pagamento
        """
        cursor.execute(query, (
            embarque.id_viagem,
            embarque.id_passageiro,
            embarque.id_parada_origem,
            embarque.data_hora,
            embarque.tipo_pagamento
        ))
        
        novo_embarque = fetch_one_or_none(cursor)
        
        # Atualiza lotação da viagem
        cursor.execute("""
            UPDATE viagens 
            SET lotacao_atual = lotacao_atual + 1 
            WHERE id = %s
        """, (embarque.id_viagem,))
        
        logger.info(f"Embarque criado: Viagem {embarque.id_viagem}, Passageiro {embarque.id_passageiro}")
        return novo_embarque

def listar_embarques(
    skip: int = 0, 
    limit: int = 100,
    viagem_id: Optional[int] = None,
    passageiro_id: Optional[int] = None,
    data_inicio: Optional[str] = None,
    data_fim: Optional[str] = None
) -> List[Dict]:
    """
    Lista embarques com filtros opcionais
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                e.id_viagem,
                e.id_passageiro,
                e.id_parada_origem,
                e.data_hora,
                e.tipo_pagamento,
                p.nome_completo as passageiro_nome,
                par.latitude as parada_lat,
                par.longitude as parada_lon
            FROM embarques e
            JOIN passageiros p ON e.id_passageiro = p.id
            LEFT JOIN paradas par ON e.id_parada_origem = par.id
            WHERE 1=1
        """
        
        params = []
        
        if viagem_id:
            query += " AND e.id_viagem = %s"
            params.append(viagem_id)
        
        if passageiro_id:
            query += " AND e.id_passageiro = %s"
            params.append(passageiro_id)
        
        if data_inicio:
            query += " AND e.data_hora >= %s"
            params.append(data_inicio)
        
        if data_fim:
            query += " AND e.data_hora <= %s"
            params.append(data_fim)
        
        query += " ORDER BY e.data_hora DESC OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cursor.execute(query, params)
        return fetch_all(cursor)

def obter_embarque(viagem_id: int, passageiro_id: int) -> Optional[Dict]:
    """
    Obtém um embarque específico
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                e.id_viagem,
                e.id_passageiro,
                e.id_parada_origem,
                e.data_hora,
                e.tipo_pagamento,
                p.nome_completo as passageiro_nome,
                p.perfil_acessibilidade,
                par.latitude as parada_lat,
                par.longitude as parada_lon,
                par.status_acessibilidade as parada_status
            FROM embarques e
            JOIN passageiros p ON e.id_passageiro = p.id
            LEFT JOIN paradas par ON e.id_parada_origem = par.id
            WHERE e.id_viagem = %s AND e.id_passageiro = %s
        """
        cursor.execute(query, (viagem_id, passageiro_id))
        return fetch_one_or_none(cursor)

def deletar_embarque(viagem_id: int, passageiro_id: int) -> Optional[Dict]:
    """
    Deleta um embarque
    """
    with get_cursor(commit=True) as cursor:
        query = """
            DELETE FROM embarques
            WHERE id_viagem = %s AND id_passageiro = %s
            RETURNING id_viagem, id_passageiro, id_parada_origem, data_hora, tipo_pagamento
        """
        cursor.execute(query, (viagem_id, passageiro_id))
        
        embarque = fetch_one_or_none(cursor)
        
        if embarque:
            # Atualiza lotação da viagem
            cursor.execute("""
                UPDATE viagens 
                SET lotacao_atual = GREATEST(lotacao_atual - 1, 0)
                WHERE id = %s
            """, (viagem_id,))
            
            logger.info(f"Embarque deletado: Viagem {viagem_id}, Passageiro {passageiro_id}")
        
        return embarque

# ==============================
# FEEDBACK
# ==============================

def criar_feedback(feedback: schemas.FeedbackCreate) -> Optional[Dict]:
    """
    Cria um novo feedback
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se passageiro existe
        cursor.execute("SELECT id FROM passageiros WHERE id = %s", (feedback.id_passageiro,))
        if not cursor.fetchone():
            raise ValueError(f"Passageiro ID {feedback.id_passageiro} não encontrado")
        
        # Verifica se viagem existe
        cursor.execute("SELECT id FROM viagens WHERE id = %s", (feedback.id_viagem,))
        if not cursor.fetchone():
            raise ValueError(f"Viagem ID {feedback.id_viagem} não encontrada")
        
        query = """
            INSERT INTO feedbacks (id_passageiro, id_viagem, tipo_ocorrencia, nivel_lotacao, data_hora)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, id_passageiro, id_viagem, tipo_ocorrencia, nivel_lotacao, data_hora
        """
        cursor.execute(query, (
            feedback.id_passageiro,
            feedback.id_viagem,
            feedback.tipo_ocorrencia,
            feedback.nivel_lotacao,
            feedback.data_hora or datetime.now()
        ))
        
        novo_feedback = fetch_one_or_none(cursor)
        logger.info(f"Feedback criado: ID {novo_feedback['id']}")
        return novo_feedback

def listar_feedbacks(
    skip: int = 0, 
    limit: int = 100,
    tipo: Optional[str] = None,
    passageiro_id: Optional[int] = None,
    viagem_id: Optional[int] = None,
    nivel_min: Optional[int] = None
) -> List[Dict]:
    """
    Lista feedbacks com filtros opcionais
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                f.id,
                f.id_passageiro,
                f.id_viagem,
                f.tipo_ocorrencia,
                f.nivel_lotacao,
                f.data_hora,
                p.nome_completo as passageiro_nome,
                v.horario_saida as viagem_horario
            FROM feedbacks f
            JOIN passageiros p ON f.id_passageiro = p.id
            JOIN viagens v ON f.id_viagem = v.id
            WHERE 1=1
        """
        
        params = []
        
        if tipo:
            query += " AND f.tipo_ocorrencia = %s"
            params.append(tipo)
        
        if passageiro_id:
            query += " AND f.id_passageiro = %s"
            params.append(passageiro_id)
        
        if viagem_id:
            query += " AND f.id_viagem = %s"
            params.append(viagem_id)
        
        if nivel_min:
            query += " AND f.nivel_lotacao >= %s"
            params.append(nivel_min)
        
        query += " ORDER BY f.data_hora DESC OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cursor.execute(query, params)
        return fetch_all(cursor)

def obter_feedback(feedback_id: int) -> Optional[Dict]:
    """
    Obtém um feedback por ID
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                f.id,
                f.id_passageiro,
                f.id_viagem,
                f.tipo_ocorrencia,
                f.nivel_lotacao,
                f.data_hora,
                p.nome_completo as passageiro_nome,
                p.perfil_acessibilidade,
                v.horario_saida as viagem_horario,
                r.codigo_rota
            FROM feedbacks f
            JOIN passageiros p ON f.id_passageiro = p.id
            JOIN viagens v ON f.id_viagem = v.id
            JOIN rotas r ON v.id_rota = r.id
            WHERE f.id = %s
        """
        cursor.execute(query, (feedback_id,))
        return fetch_one_or_none(cursor)

def atualizar_feedback(feedback_id: int, dados: schemas.FeedbackCreate) -> Optional[Dict]:
    """
    Atualiza um feedback existente
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se feedback existe
        cursor.execute("SELECT id FROM feedbacks WHERE id = %s", (feedback_id,))
        if not cursor.fetchone():
            return None
        
        query = """
            UPDATE feedbacks
            SET id_passageiro = %s,
                id_viagem = %s,
                tipo_ocorrencia = %s,
                nivel_lotacao = %s,
                data_hora = %s
            WHERE id = %s
            RETURNING id, id_passageiro, id_viagem, tipo_ocorrencia, nivel_lotacao, data_hora
        """
        cursor.execute(query, (
            dados.id_passageiro,
            dados.id_viagem,
            dados.tipo_ocorrencia,
            dados.nivel_lotacao,
            dados.data_hora,
            feedback_id
        ))
        
        feedback_atualizado = fetch_one_or_none(cursor)
        logger.info(f"Feedback atualizado: ID {feedback_id}")
        return feedback_atualizado

def deletar_feedback(feedback_id: int) -> Optional[Dict]:
    """
    Deleta um feedback
    """
    with get_cursor(commit=True) as cursor:
        query = """
            DELETE FROM feedbacks
            WHERE id = %s
            RETURNING id, id_passageiro, id_viagem, tipo_ocorrencia, nivel_lotacao, data_hora
        """
        cursor.execute(query, (feedback_id,))
        
        feedback = fetch_one_or_none(cursor)
        
        if feedback:
            logger.info(f"Feedback deletado: ID {feedback_id}")
        
        return feedback

# ==============================
# ITINERARIO (Rota_Parada)
# ==============================

def criar_itinerario(itinerario: schemas.ItinerarioCreate) -> Optional[Dict]:
    """
    Adiciona uma parada a uma rota
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se rota existe
        cursor.execute("SELECT id FROM rotas WHERE id = %s", (itinerario.id_rota,))
        if not cursor.fetchone():
            raise ValueError(f"Rota ID {itinerario.id_rota} não encontrada")
        
        # Verifica se parada existe
        cursor.execute("SELECT id FROM paradas WHERE id = %s", (itinerario.id_parada,))
        if not cursor.fetchone():
            raise ValueError(f"Parada ID {itinerario.id_parada} não encontrada")
        
        # Verifica se ordem já existe nesta rota
        cursor.execute("""
            SELECT 1 FROM itinerarios 
            WHERE id_rota = %s AND ordem_parada = %s
        """, (itinerario.id_rota, itinerario.ordem_parada))
        if cursor.fetchone():
            raise ValueError(f"Ordem {itinerario.ordem_parada} já existe nesta rota")
        
        query = """
            INSERT INTO itinerarios (id_rota, id_parada, ordem_parada, tempo_estimado)
            VALUES (%s, %s, %s, %s)
            RETURNING id_rota, id_parada, ordem_parada, tempo_estimado
        """
        cursor.execute(query, (
            itinerario.id_rota,
            itinerario.id_parada,
            itinerario.ordem_parada,
            itinerario.tempo_estimado
        ))
        
        novo_itinerario = fetch_one_or_none(cursor)
        logger.info(f"Itinerário criado: Rota {itinerario.id_rota}, Parada {itinerario.id_parada}")
        return novo_itinerario

def listar_itinerarios(
    skip: int = 0, 
    limit: int = 100,
    rota_id: Optional[int] = None
) -> List[Dict]:
    """
    Lista itinerários
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                i.id_rota,
                i.id_parada,
                i.ordem_parada,
                i.tempo_estimado,
                r.codigo_rota,
                r.nome_rota,
                p.latitude,
                p.longitude,
                p.status_acessibilidade as parada_status
            FROM itinerarios i
            JOIN rotas r ON i.id_rota = r.id
            JOIN paradas p ON i.id_parada = p.id
            WHERE 1=1
        """
        
        params = []
        
        if rota_id:
            query += " AND i.id_rota = %s"
            params.append(rota_id)
        
        query += " ORDER BY i.id_rota, i.ordem_parada OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cursor.execute(query, params)
        return fetch_all(cursor)

def obter_itinerario(id_rota: int, id_parada: int) -> Optional[Dict]:
    """
    Obtém um itinerário específico
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                i.id_rota,
                i.id_parada,
                i.ordem_parada,
                i.tempo_estimado,
                r.codigo_rota,
                r.nome_rota,
                p.latitude,
                p.longitude,
                p.status_acessibilidade
            FROM itinerarios i
            JOIN rotas r ON i.id_rota = r.id
            JOIN paradas p ON i.id_parada = p.id
            WHERE i.id_rota = %s AND i.id_parada = %s
        """
        cursor.execute(query, (id_rota, id_parada))
        return fetch_one_or_none(cursor)

def atualizar_itinerario(id_rota: int, id_parada: int, ordem: int, tempo_estimado: Optional[str] = None) -> Optional[Dict]:
    """
    Atualiza um itinerário
    """
    with get_cursor(commit=True) as cursor:
        # Verifica se itinerário existe
        cursor.execute("""
            SELECT 1 FROM itinerarios 
            WHERE id_rota = %s AND id_parada = %s
        """, (id_rota, id_parada))
        if not cursor.fetchone():
            return None
        
        # Verifica se nova ordem já existe (exceto para esta parada)
        cursor.execute("""
            SELECT 1 FROM itinerarios 
            WHERE id_rota = %s AND ordem_parada = %s AND id_parada != %s
        """, (id_rota, ordem, id_parada))
        if cursor.fetchone():
            raise ValueError(f"Ordem {ordem} já existe para outra parada nesta rota")
        
        query = """
            UPDATE itinerarios
            SET ordem_parada = %s,
                tempo_estimado = COALESCE(%s, tempo_estimado)
            WHERE id_rota = %s AND id_parada = %s
            RETURNING id_rota, id_parada, ordem_parada, tempo_estimado
        """
        cursor.execute(query, (ordem, tempo_estimado, id_rota, id_parada))
        
        itinerario_atualizado = fetch_one_or_none(cursor)
        logger.info(f"Itinerário atualizado: Rota {id_rota}, Parada {id_parada}")
        return itinerario_atualizado

def deletar_itinerario(id_rota: int, id_parada: int) -> Optional[Dict]:
    """
    Remove uma parada de uma rota
    """
    with get_cursor(commit=True) as cursor:
        query = """
            DELETE FROM itinerarios
            WHERE id_rota = %s AND id_parada = %s
            RETURNING id_rota, id_parada, ordem_parada, tempo_estimado
        """
        cursor.execute(query, (id_rota, id_parada))
        
        itinerario = fetch_one_or_none(cursor)
        
        if itinerario:
            logger.info(f"Itinerário deletado: Rota {id_rota}, Parada {id_parada}")
        
        return itinerario