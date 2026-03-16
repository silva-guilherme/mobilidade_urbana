from app.database import get_connection
from app.crud import fetch_all, fetch_one_or_none
from typing import List, Dict, Optional
import logging
from contextlib import contextmanager
from psycopg2.extras import RealDictCursor

logger = logging.getLogger(__name__)

# ==============================
# CONTEXT MANAGER PARA CONEXÕES (igual ao crud.py)
# ==============================

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

# ==============================
# RELATÓRIOS E CONSULTAS ESTRATÉGICAS
# ==============================

def relatorio_acessibilidade() -> List[Dict]:
    """
    Análise de acessibilidade: passageiros com necessidades especiais
    estão conseguindo embarcar em paradas acessíveis?
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                p.perfil_acessibilidade,
                COUNT(DISTINCT p.id) AS total_passageiros,
                COUNT(DISTINCT e.id_viagem) AS total_embarques,
                SUM(CASE WHEN pa.status_acessibilidade = 'acessivel' THEN 1 ELSE 0 END) AS embarques_paradas_acessiveis,
                COALESCE(
                    ROUND(
                        100.0 * SUM(CASE WHEN pa.status_acessibilidade = 'acessivel' THEN 1 ELSE 0 END) / 
                        NULLIF(COUNT(*), 0), 
                    2), 
                0) AS percentual_acessivel
            FROM passageiros p
            LEFT JOIN embarques e ON p.id = e.id_passageiro
            LEFT JOIN paradas pa ON e.id_parada_origem = pa.id
            WHERE p.perfil_acessibilidade != 'nenhum'
            GROUP BY p.perfil_acessibilidade
            ORDER BY total_passageiros DESC
        """
        cursor.execute(query)
        return fetch_all(cursor)


def relatorio_motoristas_destaque() -> List[Dict]:
    """
    Motoristas com melhor avaliação baseado em feedbacks
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                m.id,
                m.nome_completo,
                m.cnh,
                COUNT(DISTINCT v.id) AS total_viagens,
                COUNT(f.id) AS total_feedbacks,
                COALESCE(
                    ROUND(
                        100.0 * SUM(CASE WHEN f.tipo_ocorrencia = 'conduta' THEN 1 ELSE 0 END) / 
                        NULLIF(COUNT(f.id), 0), 
                    2), 
                0) AS percentual_feedbacks_positivos,
                COUNT(DISTINCT v.id_rota) AS rotas_diferentes
            FROM motoristas m
            LEFT JOIN viagens v ON m.id = v.id_motorista
            LEFT JOIN feedbacks f ON v.id = f.id_viagem
            GROUP BY m.id, m.nome_completo, m.cnh
            HAVING COUNT(DISTINCT v.id) > 0
            ORDER BY percentual_feedbacks_positivos DESC, total_viagens DESC
            LIMIT 20
        """
        cursor.execute(query)
        return fetch_all(cursor)


def relatorio_rotas_criticas(limiar_lotacao: int = 80) -> List[Dict]:
    """
    Rotas que frequentemente excedem o limiar de lotação
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                r.id,
                r.codigo_rota,
                r.nome_rota,
                COUNT(v.id) AS total_viagens,
                SUM(CASE WHEN v.lotacao_atual >= o.capacidade_maxima * (%s::DECIMAL/100) THEN 1 ELSE 0 END) AS viagens_criticas,
                COALESCE(
                    ROUND(
                        100.0 * SUM(CASE WHEN v.lotacao_atual >= o.capacidade_maxima * (%s::DECIMAL/100) THEN 1 ELSE 0 END) / 
                        NULLIF(COUNT(v.id), 0), 
                    2), 
                0) AS percentual_critico,
                ROUND(AVG(v.lotacao_atual), 2) AS lotacao_media,
                MAX(v.lotacao_atual) AS pico_maximo,
                MAX(o.capacidade_maxima) AS capacidade_onibus
            FROM rotas r
            JOIN viagens v ON r.id = v.id_rota
            JOIN onibus o ON v.id_onibus = o.id
            GROUP BY r.id, r.codigo_rota, r.nome_rota
            HAVING COUNT(v.id) > 5
            ORDER BY percentual_critico DESC
        """
        cursor.execute(query, (limiar_lotacao, limiar_lotacao))
        return fetch_all(cursor)


def relatorio_perfil_pagamento() -> List[Dict]:
    """
    Como diferentes perfis de passageiros pagam pelas viagens
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                COALESCE(p.perfil_acessibilidade, 'nao_informado') AS perfil_passageiro,
                e.tipo_pagamento,
                COUNT(*) AS total_embarques,
                ROUND(
                    100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY COALESCE(p.perfil_acessibilidade, 'nao_informado')), 
                2) AS percentual_no_perfil
            FROM passageiros p
            RIGHT JOIN embarques e ON p.id = e.id_passageiro
            WHERE e.tipo_pagamento IS NOT NULL
            GROUP BY perfil_passageiro, e.tipo_pagamento
            ORDER BY perfil_passageiro, total_embarques DESC
        """
        cursor.execute(query)
        return fetch_all(cursor)


def relatorio_eficiencia_frota() -> List[Dict]:
    """
    Análise de eficiência dos ônibus da frota
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                o.id,
                o.placa,
                CASE WHEN o.modelo_acessivel THEN 'Sim' ELSE 'Não' END AS acessivel,
                o.capacidade_maxima,
                COUNT(DISTINCT v.id) AS viagens_realizadas,
                COALESCE(SUM(v.lotacao_atual), 0) AS passageiros_transportados,
                COALESCE(ROUND(AVG(v.lotacao_atual), 2), 0) AS ocupacao_media,
                COALESCE(
                    ROUND(100.0 * AVG(v.lotacao_atual) / NULLIF(o.capacidade_maxima, 0), 2), 
                0) AS percentual_ocupacao_medio,
                COUNT(DISTINCT v.id_motorista) AS motoristas_diferentes
            FROM onibus o
            LEFT JOIN viagens v ON o.id = v.id_onibus
            GROUP BY o.id, o.placa, o.modelo_acessivel, o.capacidade_maxima
            ORDER BY percentual_ocupacao_medio DESC, viagens_realizadas DESC
        """
        cursor.execute(query)
        return fetch_all(cursor)


def relatorio_passageiros_frequentes(limiar_viagens: int = 10) -> List[Dict]:
    """
    Passageiros que mais usam o sistema e seu comportamento de feedback
    """
    with get_cursor() as cursor:
        query = """
            WITH passageiros_frequentes AS (
                SELECT 
                    p.id,
                    p.nome_completo,
                    p.perfil_acessibilidade,
                    COUNT(DISTINCT e.id_viagem) AS total_viagens
                FROM passageiros p
                JOIN embarques e ON p.id = e.id_passageiro
                GROUP BY p.id, p.nome_completo, p.perfil_acessibilidade
                HAVING COUNT(DISTINCT e.id_viagem) >= %s
            )
            SELECT 
                pf.id,
                pf.nome_completo,
                pf.perfil_acessibilidade,
                pf.total_viagens,
                COUNT(DISTINCT f.id) AS total_feedbacks,
                COALESCE(
                    ROUND(100.0 * COUNT(f.id) / NULLIF(pf.total_viagens, 0), 2), 
                0) AS taxa_feedback,
                SUM(CASE WHEN f.tipo_ocorrencia IN ('lotacao', 'mecanica') THEN 1 ELSE 0 END) AS feedbacks_negativos,
                SUM(CASE WHEN f.tipo_ocorrencia = 'conduta' THEN 1 ELSE 0 END) AS feedbacks_positivos
            FROM passageiros_frequentes pf
            LEFT JOIN feedbacks f ON pf.id = f.id_passageiro
            GROUP BY pf.id, pf.nome_completo, pf.perfil_acessibilidade, pf.total_viagens
            ORDER BY total_viagens DESC, total_feedbacks DESC
        """
        cursor.execute(query, (limiar_viagens,))
        return fetch_all(cursor)


def relatorio_horarios_pico() -> List[Dict]:
    """
    Análise de horários de pico por período do dia
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                CASE 
                    WHEN EXTRACT(HOUR FROM v.horario_saida) BETWEEN 5 AND 8 THEN 'Madrugada (5h-8h)'
                    WHEN EXTRACT(HOUR FROM v.horario_saida) BETWEEN 9 AND 11 THEN 'Manhã (9h-11h)'
                    WHEN EXTRACT(HOUR FROM v.horario_saida) BETWEEN 12 AND 14 THEN 'Almoço (12h-14h)'
                    WHEN EXTRACT(HOUR FROM v.horario_saida) BETWEEN 15 AND 18 THEN 'Tarde (15h-18h)'
                    WHEN EXTRACT(HOUR FROM v.horario_saida) BETWEEN 19 AND 22 THEN 'Noite (19h-22h)'
                    ELSE 'Madrugada (23h-4h)'
                END AS periodo,
                COUNT(*) AS total_viagens,
                SUM(v.lotacao_atual) AS passageiros_transportados,
                ROUND(AVG(v.lotacao_atual), 2) AS lotacao_media,
                MAX(v.lotacao_atual) AS pico_lotacao,
                COUNT(DISTINCT v.id_rota) AS rotas_ativas
            FROM viagens v
            WHERE v.horario_saida IS NOT NULL
            GROUP BY periodo
            ORDER BY 
                MIN(EXTRACT(HOUR FROM v.horario_saida))  -- Usa o menor horário do período para ordenar
        """
        cursor.execute(query)
        return fetch_all(cursor)


def relatorio_feedbacks_detalhado(limite: int = 50) -> List[Dict]:
    """
    Feedbacks com todos os detalhes da viagem (5 JOINS!)
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                f.id AS feedback_id,
                f.data_hora AS data_feedback,
                f.tipo_ocorrencia,
                f.nivel_lotacao AS lotacao_informada,
                p.nome_completo AS passageiro,
                p.perfil_acessibilidade,
                v.horario_saida AS horario_viagem,
                v.lotacao_atual AS lotacao_real,
                r.nome_rota,
                m.nome_completo AS motorista,
                o.placa AS onibus_placa,
                o.modelo_acessivel AS onibus_acessivel
            FROM feedbacks f
            JOIN passageiros p ON f.id_passageiro = p.id
            JOIN viagens v ON f.id_viagem = v.id
            JOIN rotas r ON v.id_rota = r.id
            JOIN motoristas m ON v.id_motorista = m.id
            JOIN onibus o ON v.id_onibus = o.id
            ORDER BY f.data_hora DESC
            LIMIT %s
        """
        cursor.execute(query, (limite,))
        return fetch_all(cursor)


def relatorio_tendencia_uso() -> List[Dict]:
    """
    Tendência de uso do sistema mês a mês
    """
    with get_cursor() as cursor:
        query = """
            WITH dados_mensais AS (
                SELECT 
                    TO_CHAR(e.data_hora, 'YYYY-MM') AS mes,
                    COUNT(*) AS total_embarques,
                    COUNT(DISTINCT e.id_passageiro) AS passageiros_unicos,
                    COUNT(DISTINCT e.id_viagem) AS viagens_utilizadas,
                    COUNT(DISTINCT v.id_motorista) AS motoristas_ativos,
                    COUNT(DISTINCT v.id_onibus) AS onibus_ativos
                FROM embarques e
                JOIN viagens v ON e.id_viagem = v.id
                GROUP BY TO_CHAR(e.data_hora, 'YYYY-MM')
            )
            SELECT 
                mes,
                total_embarques,
                passageiros_unicos,
                viagens_utilizadas,
                motoristas_ativos,
                onibus_ativos,
                LAG(total_embarques) OVER (ORDER BY mes) AS embarques_mes_anterior,
                COALESCE(
                    ROUND(
                        100.0 * (total_embarques - LAG(total_embarques) OVER (ORDER BY mes)) / 
                        NULLIF(LAG(total_embarques) OVER (ORDER BY mes), 0), 
                    2), 
                0) AS crescimento_percentual
            FROM dados_mensais
            ORDER BY mes DESC
        """
        cursor.execute(query)
        return fetch_all(cursor)


def relatorio_correlacao_lotacao() -> List[Dict]:
    """
    Correlação entre feedback de lotação e lotação real
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                f.nivel_lotacao AS feedback_lotacao,
                COUNT(*) AS quantidade_feedbacks,
                ROUND(AVG(v.lotacao_atual), 2) AS lotacao_media_real,
                MIN(v.lotacao_atual) AS lotacao_min_real,
                MAX(v.lotacao_atual) AS lotacao_max_real,
                CASE 
                    WHEN AVG(v.lotacao_atual) BETWEEN 0 AND 20 THEN 'Baixa (0-20)'
                    WHEN AVG(v.lotacao_atual) BETWEEN 21 AND 50 THEN 'Média (21-50)'
                    WHEN AVG(v.lotacao_atual) BETWEEN 51 AND 80 THEN 'Alta (51-80)'
                    ELSE 'Lotada (81+)'
                END AS classificacao_real
            FROM feedbacks f
            JOIN viagens v ON f.id_viagem = v.id
            WHERE f.tipo_ocorrencia = 'lotacao' AND f.nivel_lotacao IS NOT NULL
            GROUP BY f.nivel_lotacao
            ORDER BY f.nivel_lotacao
        """
        cursor.execute(query)
        return fetch_all(cursor)


def relatorio_paradas_estratexgicas(limite: int = 15) -> List[Dict]:
    """
    Paradas mais estratégicas (mais movimentadas e com problemas de acessibilidade)
    """
    with get_cursor() as cursor:
        query = """
            SELECT 
                p.id,
                p.latitude,
                p.longitude,
                p.status_acessibilidade,
                COUNT(DISTINCT e.id_viagem) AS total_embarques,
                COUNT(DISTINCT e.id_passageiro) AS passageiros_distintos,
                COUNT(DISTINCT i.id_rota) AS rotas_que_passam,
                CASE 
                    WHEN p.status_acessibilidade = 'inacessivel' AND COUNT(e.id_viagem) > 10 THEN 'CRÍTICA'
                    WHEN p.status_acessibilidade = 'manutencao' THEN 'Em manutenção'
                    WHEN COUNT(e.id_viagem) > 50 THEN 'Super movimentada'
                    WHEN COUNT(e.id_viagem) > 20 THEN 'Movimentada'
                    ELSE 'Normal'
                END AS classificacao
            FROM paradas p
            LEFT JOIN embarques e ON p.id = e.id_parada_origem
            LEFT JOIN itinerarios i ON p.id = i.id_parada
            GROUP BY p.id, p.latitude, p.longitude, p.status_acessibilidade
            HAVING COUNT(e.id_viagem) > 0 OR COUNT(i.id_rota) > 0
            ORDER BY total_embarques DESC, passageiros_distintos DESC
            LIMIT %s
        """
        cursor.execute(query, (limite,))
        return fetch_all(cursor)