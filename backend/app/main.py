from fastapi import FastAPI, HTTPException
from app import schemas, crud, relatorios
from app.schemas_responses import (
    MotoristaResponse, PassageiroResponse, OnibusResponse,
    RotaResponse, ParadaResponse, ViagemResponse,
    EmbarqueResponse, FeedbackResponse, ItinerarioResponse,
    TelefoneMotoristaResponse, EmailPassageiroResponse
)
from typing import List, Optional

app = FastAPI(title="API Mobilidade Urbana")

# ==============================
# MOTORISTAS
# ==============================

@app.post("/motoristas", response_model=MotoristaResponse)
def criar_motorista_api(motorista: schemas.MotoristaCreate):
    """Cria um novo motorista"""
    try:
        return crud.criar_motorista(motorista)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao criar motorista")

@app.get("/motoristas", response_model=List[MotoristaResponse])
def listar_motoristas_api(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    """Lista todos os motoristas com filtros opcionais"""
    try:
        return crud.listar_motoristas(skip, limit, status, search)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar motoristas")

@app.get("/motoristas/{motorista_id}", response_model=MotoristaResponse)
def obter_motorista_api(motorista_id: int):
    """Busca um motorista pelo ID"""
    motorista = crud.obter_motorista(motorista_id)
    if not motorista:
        raise HTTPException(status_code=404, detail="Motorista não encontrado")
    return motorista

@app.put("/motoristas/{motorista_id}", response_model=MotoristaResponse)
def atualizar_motorista_api(motorista_id: int, dados: schemas.MotoristaCreate):
    """Atualiza os dados de um motorista"""
    try:
        motorista = crud.atualizar_motorista(motorista_id, dados)
        if not motorista:
            raise HTTPException(status_code=404, detail="Motorista não encontrado")
        return motorista
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao atualizar motorista")

@app.delete("/motoristas/{motorista_id}")
def deletar_motorista_api(motorista_id: int):
    """Remove um motorista (não permite se tiver viagens)"""
    try:
        motorista = crud.deletar_motorista(motorista_id)
        if not motorista:
            raise HTTPException(status_code=404, detail="Motorista não encontrado")
        return {"message": "Motorista deletado com sucesso"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar motorista")

# ==============================
# TELEFONES MOTORISTA
# ==============================

@app.post("/motoristas/{motorista_id}/telefones", response_model=TelefoneMotoristaResponse)
def criar_telefone_motorista_api(motorista_id: int, telefone: schemas.TelefoneMotoristaCreate):
    """Adiciona um telefone a um motorista"""
    try:
        telefone.id_motorista = motorista_id
        return crud.criar_telefone_motorista(telefone)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao adicionar telefone")

@app.get("/motoristas/{motorista_id}/telefones", response_model=List[TelefoneMotoristaResponse])
def listar_telefones_motorista_api(motorista_id: int):
    """Lista todos os telefones de um motorista"""
    try:
        return crud.listar_telefones_motorista(motorista_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar telefones")

@app.delete("/motoristas/{motorista_id}/telefones/{numero}")
def deletar_telefone_motorista_api(motorista_id: int, numero: str):
    """Remove um telefone de um motorista"""
    try:
        telefone = crud.deletar_telefone_motorista(motorista_id, numero)
        if not telefone:
            raise HTTPException(status_code=404, detail="Telefone não encontrado")
        return {"message": "Telefone deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar telefone")

# ==============================
# PASSAGEIROS
# ==============================

@app.post("/passageiros", response_model=PassageiroResponse)
def criar_passageiro_api(passageiro: schemas.PassageiroCreate):
    """Cria um novo passageiro"""
    try:
        return crud.criar_passageiro(passageiro)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao criar passageiro")

@app.get("/passageiros", response_model=List[PassageiroResponse])
def listar_passageiros_api(
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    perfil: Optional[str] = None
):
    """Lista todos os passageiros com filtros"""
    try:
        return crud.listar_passageiros(skip, limit, search, perfil)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar passageiros")

@app.get("/passageiros/{passageiro_id}", response_model=PassageiroResponse)
def obter_passageiro_api(passageiro_id: int):
    """Busca um passageiro pelo ID"""
    passageiro = crud.obter_passageiro(passageiro_id)
    if not passageiro:
        raise HTTPException(status_code=404, detail="Passageiro não encontrado")
    return passageiro

@app.put("/passageiros/{passageiro_id}", response_model=PassageiroResponse)
def atualizar_passageiro_api(passageiro_id: int, dados: schemas.PassageiroCreate):
    """Atualiza os dados de um passageiro"""
    try:
        passageiro = crud.atualizar_passageiro(passageiro_id, dados)
        if not passageiro:
            raise HTTPException(status_code=404, detail="Passageiro não encontrado")
        return passageiro
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao atualizar passageiro")

@app.delete("/passageiros/{passageiro_id}")
def deletar_passageiro_api(passageiro_id: int):
    """Remove um passageiro"""
    try:
        passageiro = crud.deletar_passageiro(passageiro_id)
        if not passageiro:
            raise HTTPException(status_code=404, detail="Passageiro não encontrado")
        return {"message": "Passageiro deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar passageiro")

# ==============================
# EMAILS PASSAGEIRO
# ==============================

@app.post("/passageiros/{passageiro_id}/emails", response_model=EmailPassageiroResponse)
def criar_email_passageiro_api(passageiro_id: int, email: schemas.EmailPassageiroCreate):
    """Adiciona um email a um passageiro"""
    try:
        email.id_passageiro = passageiro_id
        return crud.criar_email_passageiro(email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao adicionar email")

@app.get("/passageiros/{passageiro_id}/emails", response_model=List[EmailPassageiroResponse])
def listar_emails_passageiro_api(passageiro_id: int):
    """Lista todos os emails de um passageiro"""
    try:
        return crud.listar_emails_passageiro(passageiro_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar emails")

@app.delete("/passageiros/{passageiro_id}/emails/{email}")
def deletar_email_passageiro_api(passageiro_id: int, email: str):
    """Remove um email de um passageiro"""
    try:
        email_deletado = crud.deletar_email_passageiro(passageiro_id, email)
        if not email_deletado:
            raise HTTPException(status_code=404, detail="Email não encontrado")
        return {"message": "Email deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar email")

# ==============================
# ÔNIBUS
# ==============================

@app.post("/onibus", response_model=OnibusResponse)
def criar_onibus_api(onibus: schemas.OnibusCreate):
    """Cria um novo ônibus"""
    try:
        return crud.criar_onibus(onibus)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao criar ônibus")

@app.get("/onibus", response_model=List[OnibusResponse])
def listar_onibus_api(
    skip: int = 0, 
    limit: int = 100,
    acessivel: Optional[bool] = None
):
    """Lista todos os ônibus com filtro opcional por acessibilidade"""
    try:
        return crud.listar_onibus(skip, limit, acessivel)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar ônibus")

@app.get("/onibus/{onibus_id}", response_model=OnibusResponse)
def obter_onibus_api(onibus_id: int):
    """Busca um ônibus pelo ID"""
    onibus = crud.obter_onibus(onibus_id)
    if not onibus:
        raise HTTPException(status_code=404, detail="Ônibus não encontrado")
    return onibus

@app.put("/onibus/{onibus_id}", response_model=OnibusResponse)
def atualizar_onibus_api(onibus_id: int, dados: schemas.OnibusCreate):
    """Atualiza os dados de um ônibus"""
    try:
        onibus = crud.atualizar_onibus(onibus_id, dados)
        if not onibus:
            raise HTTPException(status_code=404, detail="Ônibus não encontrado")
        return onibus
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao atualizar ônibus")

@app.delete("/onibus/{onibus_id}")
def deletar_onibus_api(onibus_id: int):
    """Remove um ônibus (não permite se tiver viagens)"""
    try:
        onibus = crud.deletar_onibus(onibus_id)
        if not onibus:
            raise HTTPException(status_code=404, detail="Ônibus não encontrado")
        return {"message": "Ônibus deletado com sucesso"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar ônibus")

# ==============================
# ROTAS
# ==============================

@app.post("/rotas", response_model=RotaResponse)
def criar_rota_api(rota: schemas.RotaCreate):
    """Cria uma nova rota"""
    try:
        return crud.criar_rota(rota)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao criar rota")

@app.get("/rotas", response_model=List[RotaResponse])
def listar_rotas_api(
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None
):
    """Lista todas as rotas com filtro opcional"""
    try:
        return crud.listar_rotas(skip, limit, search)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar rotas")

@app.get("/rotas/{rota_id}", response_model=RotaResponse)
def obter_rota_api(rota_id: int):
    """Busca uma rota pelo ID"""
    rota = crud.obter_rota(rota_id)
    if not rota:
        raise HTTPException(status_code=404, detail="Rota não encontrada")
    return rota

@app.put("/rotas/{rota_id}", response_model=RotaResponse)
def atualizar_rota_api(rota_id: int, dados: schemas.RotaCreate):
    """Atualiza os dados de uma rota"""
    try:
        rota = crud.atualizar_rota(rota_id, dados)
        if not rota:
            raise HTTPException(status_code=404, detail="Rota não encontrada")
        return rota
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao atualizar rota")

@app.delete("/rotas/{rota_id}")
def deletar_rota_api(rota_id: int):
    """Remove uma rota (não permite se tiver viagens)"""
    try:
        rota = crud.deletar_rota(rota_id)
        if not rota:
            raise HTTPException(status_code=404, detail="Rota não encontrada")
        return {"message": "Rota deletada com sucesso"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar rota")

# ==============================
# PARADAS
# ==============================

@app.post("/paradas", response_model=ParadaResponse)
def criar_parada_api(parada: schemas.ParadaCreate):
    """Cria uma nova parada"""
    try:
        return crud.criar_parada(parada)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao criar parada")

@app.get("/paradas", response_model=List[ParadaResponse])
def listar_paradas_api(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None
):
    """Lista todas as paradas com filtro opcional"""
    try:
        return crud.listar_paradas(skip, limit, status)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar paradas")

@app.get("/paradas/{parada_id}", response_model=ParadaResponse)
def obter_parada_api(parada_id: int):
    """Busca uma parada pelo ID"""
    parada = crud.obter_parada(parada_id)
    if not parada:
        raise HTTPException(status_code=404, detail="Parada não encontrada")
    return parada

@app.put("/paradas/{parada_id}", response_model=ParadaResponse)
def atualizar_parada_api(parada_id: int, dados: schemas.ParadaCreate):
    """Atualiza os dados de uma parada"""
    try:
        parada = crud.atualizar_parada(parada_id, dados)
        if not parada:
            raise HTTPException(status_code=404, detail="Parada não encontrada")
        return parada
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao atualizar parada")

@app.delete("/paradas/{parada_id}")
def deletar_parada_api(parada_id: int):
    """Remove uma parada (não permite se estiver em itinerários)"""
    try:
        parada = crud.deletar_parada(parada_id)
        if not parada:
            raise HTTPException(status_code=404, detail="Parada não encontrada")
        return {"message": "Parada deletada com sucesso"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar parada")

# ==============================
# VIAGENS
# ==============================

@app.post("/viagens", response_model=ViagemResponse)
def criar_viagem_api(viagem: schemas.ViagemCreate):
    """Cria uma nova viagem"""
    try:
        return crud.criar_viagem(viagem)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao criar viagem")

@app.get("/viagens", response_model=List[ViagemResponse])
def listar_viagens_api(
    skip: int = 0, 
    limit: int = 100,
    rota_id: Optional[int] = None,
    motorista_id: Optional[int] = None,
    onibus_id: Optional[int] = None
):
    """Lista viagens com filtros por rota, motorista ou ônibus"""
    try:
        return crud.listar_viagens(skip, limit, rota_id, motorista_id, onibus_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar viagens")

@app.get("/viagens/{viagem_id}", response_model=ViagemResponse)
def obter_viagem_api(viagem_id: int):
    """Busca uma viagem pelo ID"""
    viagem = crud.obter_viagem(viagem_id)
    if not viagem:
        raise HTTPException(status_code=404, detail="Viagem não encontrada")
    return viagem

@app.put("/viagens/{viagem_id}", response_model=ViagemResponse)
def atualizar_viagem_api(viagem_id: int, dados: schemas.ViagemCreate):
    """Atualiza os dados de uma viagem"""
    try:
        viagem = crud.atualizar_viagem(viagem_id, dados)
        if not viagem:
            raise HTTPException(status_code=404, detail="Viagem não encontrada")
        return viagem
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao atualizar viagem")

@app.delete("/viagens/{viagem_id}")
def deletar_viagem_api(viagem_id: int):
    """Remove uma viagem e todos os embarques/feedbacks associados"""
    try:
        viagem = crud.deletar_viagem(viagem_id)
        if not viagem:
            raise HTTPException(status_code=404, detail="Viagem não encontrada")
        return {"message": "Viagem deletada com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar viagem")

# ==============================
# EMBARQUES
# ==============================

@app.post("/embarques", response_model=EmbarqueResponse)
def criar_embarque_api(embarque: schemas.EmbarqueCreate):
    """Registra um embarque de passageiro em uma viagem"""
    try:
        return crud.criar_embarque(embarque)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao criar embarque")

@app.get("/embarques", response_model=List[EmbarqueResponse])
def listar_embarques_api(
    skip: int = 0, 
    limit: int = 100,
    viagem_id: Optional[int] = None,
    passageiro_id: Optional[int] = None
):
    """Lista embarques com filtros opcionais"""
    try:
        return crud.listar_embarques(skip, limit, viagem_id, passageiro_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar embarques")

@app.get("/embarques/{viagem_id}/{passageiro_id}", response_model=EmbarqueResponse)
def obter_embarque_api(viagem_id: int, passageiro_id: int):
    """Busca um embarque específico"""
    embarque = crud.obter_embarque(viagem_id, passageiro_id)
    if not embarque:
        raise HTTPException(status_code=404, detail="Embarque não encontrado")
    return embarque

@app.delete("/embarques/{viagem_id}/{passageiro_id}")
def deletar_embarque_api(viagem_id: int, passageiro_id: int):
    """Cancela um embarque e atualiza a lotação"""
    try:
        embarque = crud.deletar_embarque(viagem_id, passageiro_id)
        if not embarque:
            raise HTTPException(status_code=404, detail="Embarque não encontrado")
        return {"message": "Embarque deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar embarque")

# ==============================
# FEEDBACKS
# ==============================

@app.post("/feedbacks", response_model=FeedbackResponse)
def criar_feedback_api(feedback: schemas.FeedbackCreate):
    """Registra um feedback de passageiro sobre uma viagem"""
    try:
        return crud.criar_feedback(feedback)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao criar feedback")

@app.get("/feedbacks", response_model=List[FeedbackResponse])
def listar_feedbacks_api(
    skip: int = 0, 
    limit: int = 100,
    tipo: Optional[str] = None,
    passageiro_id: Optional[int] = None,
    viagem_id: Optional[int] = None
):
    """Lista feedbacks com filtros opcionais"""
    try:
        return crud.listar_feedbacks(skip, limit, tipo, passageiro_id, viagem_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar feedbacks")

@app.get("/feedbacks/{feedback_id}", response_model=FeedbackResponse)
def obter_feedback_api(feedback_id: int):
    """Busca um feedback pelo ID"""
    feedback = crud.obter_feedback(feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback não encontrado")
    return feedback

@app.put("/feedbacks/{feedback_id}", response_model=FeedbackResponse)
def atualizar_feedback_api(feedback_id: int, dados: schemas.FeedbackCreate):
    """Atualiza um feedback existente"""
    try:
        feedback = crud.atualizar_feedback(feedback_id, dados)
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback não encontrado")
        return feedback
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao atualizar feedback")

@app.delete("/feedbacks/{feedback_id}")
def deletar_feedback_api(feedback_id: int):
    """Remove um feedback"""
    try:
        feedback = crud.deletar_feedback(feedback_id)
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback não encontrado")
        return {"message": "Feedback deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar feedback")

# ==============================
# ITINERÁRIOS
# ==============================

@app.post("/itinerarios", response_model=ItinerarioResponse)
def criar_itinerario_api(itinerario: schemas.ItinerarioCreate):
    """Adiciona uma parada a uma rota com ordem definida"""
    try:
        return crud.criar_itinerario(itinerario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao criar itinerário")

@app.get("/itinerarios", response_model=List[ItinerarioResponse])
def listar_itinerarios_api(
    skip: int = 0, 
    limit: int = 100,
    rota_id: Optional[int] = None
):
    """Lista itinerários de uma rota específica"""
    try:
        return crud.listar_itinerarios(skip, limit, rota_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar itinerários")

@app.get("/itinerarios/{id_rota}/{id_parada}", response_model=ItinerarioResponse)
def obter_itinerario_api(id_rota: int, id_parada: int):
    """Busca um itinerário específico"""
    itinerario = crud.obter_itinerario(id_rota, id_parada)
    if not itinerario:
        raise HTTPException(status_code=404, detail="Itinerário não encontrado")
    return itinerario

@app.put("/itinerarios/{id_rota}/{id_parada}", response_model=ItinerarioResponse)
def atualizar_itinerario_api(
    id_rota: int, 
    id_parada: int, 
    ordem: int, 
    tempo_estimado: Optional[str] = None
):
    """Atualiza a ordem de uma parada em uma rota"""
    try:
        itinerario = crud.atualizar_itinerario(id_rota, id_parada, ordem, tempo_estimado)
        if not itinerario:
            raise HTTPException(status_code=404, detail="Itinerário não encontrado")
        return itinerario
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao atualizar itinerário")

@app.delete("/itinerarios/{id_rota}/{id_parada}")
def deletar_itinerario_api(id_rota: int, id_parada: int):
    """Remove uma parada de uma rota"""
    try:
        itinerario = crud.deletar_itinerario(id_rota, id_parada)
        if not itinerario:
            raise HTTPException(status_code=404, detail="Itinerário não encontrado")
        return {"message": "Itinerário deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar itinerário")

# ============================================
# RELATÓRIOS
# ============================================

@app.get("/relatorios/acessibilidade")
def get_relatorio_acessibilidade():
    """
    Relatório de Acessibilidade
    
    Mostra se passageiros com necessidades especiais estão conseguindo embarcar em paradas acessíveis.
    
    Análise dos dados:
    - Cadeirantes: 65% dos embarques em paradas acessíveis (precisa melhorar)
    - Visuais: 63% dos embarques em paradas acessíveis
    - Muletas: 61% dos embarques em paradas acessíveis
    - Conclusão: Apenas 60-65% dos passageiros com necessidades especiais usam paradas adequadas.
      É necessário revisar a sinalização e conscientização.
    """
    try:
        return relatorios.relatorio_acessibilidade()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


@app.get("/relatorios/motoristas-destaque")
def get_relatorio_motoristas_destaque():
    """
    Relatório de Motoristas Destaque
    
    Ranking dos motoristas mais bem avaliados com base nos feedbacks recebidos.
    
    Análise dos dados:
    - Henrique Pacheco: 70% de feedbacks positivos (destaque)
    - Emilly Vargas: 35% positivos em 39 viagens (consistente)
    - Liz Mendes: 31% positivos em 35 viagens
    - Observação: Motoristas com mais viagens tendem a ter percentuais mais baixos,
      possivelmente por estarem mais expostos a situações diversas.
    """
    try:
        return relatorios.relatorio_motoristas_destaque()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


@app.get("/relatorios/rotas-criticas")
def get_relatorio_rotas_criticas(limiar: int = 80):
    """
    Relatório de Rotas Críticas
    
    Identifica as rotas que frequentemente apresentam superlotação.
    
    Parâmetro:
    - limiar: percentual de lotação considerado crítico (padrão: 80%)
    
    Análise dos dados:
    - Rota NORTE249: 71% das viagens críticas (urgente)
    - Rota OESTE601: 57% das viagens críticas
    - Rota SUL742: 57% das viagens críticas
    - Ação recomendada: Aumentar frota nas rotas NORTE249 e OESTE601 nos horários de pico.
    """
    try:
        return relatorios.relatorio_rotas_criticas(limiar)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


@app.get("/relatorios/perfil-pagamento")
def get_relatorio_perfil_pagamento():
    """
    Relatório de Perfil de Pagamento
    
    Analisa como diferentes perfis de passageiros pagam pelas viagens.
    """
    try:
        return relatorios.relatorio_perfil_pagamento()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


@app.get("/relatorios/eficiencia-frota")
def get_relatorio_eficiencia_frota():
    """
    Relatório de Eficiência da Frota
    
    Analisa o desempenho e a utilização de cada ônibus da frota.
    
    Análise dos dados:
    - Ônibus HHO62I3: 145% de ocupação (acima da capacidade - superlotação crônica)
    - Ônibus MNO6262: 130% de ocupação
    - Ônibus GHI6375: 123% de ocupação
    - Problema: 12 ônibus operando acima de 100% da capacidade
    - Solução: Redistribuir passageiros ou aumentar frota nas rotas mais críticas
    """
    try:
        return relatorios.relatorio_eficiencia_frota()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


@app.get("/relatorios/passageiros-frequentes")
def get_relatorio_passageiros_frequentes(min_viagens: int = 10):
    """
    Relatório de Passageiros Frequentes
    
    Identifica os passageiros que mais utilizam o sistema e analisa seus feedbacks.
    
    Parâmetro:
    - min_viagens: número mínimo de viagens para considerar (padrão: 10)
    
    Análise dos dados:
    - Diogo Alves: 24 viagens, 29% de feedback (médio)
    - Bruna Rodrigues: 23 viagens, 26% feedback, todos negativos (atenção)
    - Luiz Miguel Oliveira: 21 viagens, 52% de feedback (mais engajado)
    - Passageiros frequentes tendem a dar mais feedback, especialmente negativos.
    """
    try:
        return relatorios.relatorio_passageiros_frequentes(min_viagens)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


@app.get("/relatorios/horarios-pico")
def get_relatorio_horarios_pico():
    """
    Relatório de Horários de Pico
    
    Analisa a distribuição de viagens ao longo do dia, identificando períodos de maior movimento.
    """
    try:
        return relatorios.relatorio_horarios_pico()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


@app.get("/relatorios/feedbacks-detalhado")
def get_relatorio_feedbacks_detalhado(limite: int = 50):
    """
    Relatório de Feedbacks Detalhado
    
    Exibe feedbacks com todas as informações relacionadas: passageiro, viagem, rota, motorista e ônibus.
    
    Parâmetro:
    - limite: número máximo de registros retornados (padrão: 50)
    
    Análise dos dados:
    - Feedback mais recente: acessibilidade na Rota SUL987 com lotação 52
    - Padrão observado: feedbacks de lotação ocorrem quando lotação real > 70
    - Motorista Kevin Pimenta: aparece múltiplas vezes (monitorar)
    """
    try:
        return relatorios.relatorio_feedbacks_detalhado(limite)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


@app.get("/relatorios/tendencia-uso")
def get_relatorio_tendencia_uso():
    """
    Relatório de Tendência de Uso
    
    Mostra a evolução mensal de embarques e o crescimento percentual.
    
    Análise dos dados:
    - Março/2026: 1330 embarques
    - Fevereiro/2026: 1606 embarques
    - Queda de 17% no uso do sistema
    - Possíveis causas: feriados, aumento de preço, ou problemas no serviço.
      Recomenda-se investigar a queda.
    """
    try:
        return relatorios.relatorio_tendencia_uso()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


@app.get("/relatorios/correlacao-lotacao")
def get_relatorio_correlacao_lotacao():
    """
    Relatório de Correlação de Lotação
    
    Compara o nível de lotação informado nos feedbacks com a lotação real das viagens.
    
    Análise dos dados:
    - Feedback nível 1: lotação média real 34 (discrepância grande)
    - Feedback nível 5: lotação média real 37 (também discrepa)
    - Conclusão: Passageiros não estão avaliando a lotação corretamente.
      Talvez a escala de 1-5 não esteja clara ou o conceito de lotação seja subjetivo.
    """
    try:
        return relatorios.relatorio_correlacao_lotacao()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


@app.get("/relatorios/paradas-estrategicas")
def get_relatorio_paradas_estrategicas(limite: int = 15):
    """
    Relatório de Paradas Estratégicas
    
    Identifica as paradas mais movimentadas e com problemas de acessibilidade.
    
    Parâmetro:
    - limite: número máximo de paradas retornadas (padrão: 15)
    
    Análise dos dados:
    - Parada ID 248: inacessível mas com 27 embarques (CRÍTICA)
    - Parada ID 288: inacessível com 26 embarques (CRÍTICA)
    - Parada ID 192: inacessível com 25 embarques (CRÍTICA)
    - Ação urgente: 3 paradas inacessíveis com alto fluxo precisam de adequação imediata.
    """
    try:
        return relatorios.relatorio_paradas_estratexgicas(limite)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")