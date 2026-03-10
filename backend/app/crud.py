from sqlalchemy.orm import Session
from app import models, schemas

# --------------------------
# MOTORISTA
# --------------------------
def criar_motorista(db: Session, motorista: schemas.MotoristaCreate):
    db_motorista = models.Motorista(**motorista.dict())
    db.add(db_motorista)
    db.commit()
    db.refresh(db_motorista)
    return db_motorista

def listar_motoristas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Motorista).offset(skip).limit(limit).all()

def obter_motorista(db: Session, motorista_id: int):
    return db.query(models.Motorista).filter(models.Motorista.id == motorista_id).first()

def atualizar_motorista(db: Session, motorista_id: int, dados: schemas.MotoristaCreate):
    motorista = db.query(models.Motorista).filter(models.Motorista.id == motorista_id).first()
    if motorista:
        for key, value in dados.dict().items():
            setattr(motorista, key, value)
        db.commit()
        db.refresh(motorista)
    return motorista

def deletar_motorista(db: Session, motorista_id: int):
    motorista = db.query(models.Motorista).filter(models.Motorista.id == motorista_id).first()
    if motorista:
        db.delete(motorista)
        db.commit()
    return motorista

# --------------------------
# PASSAGEIRO
# --------------------------
def criar_passageiro(db: Session, passageiro: schemas.PassageiroCreate):
    db_passageiro = models.Passageiro(**passageiro.dict())
    db.add(db_passageiro)
    db.commit()
    db.refresh(db_passageiro)
    return db_passageiro

def listar_passageiros(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Passageiro).offset(skip).limit(limit).all()

def obter_passageiro(db: Session, passageiro_id: int):
    return db.query(models.Passageiro).filter(models.Passageiro.id == passageiro_id).first()

def atualizar_passageiro(db: Session, passageiro_id: int, dados: schemas.PassageiroCreate):
    passageiro = db.query(models.Passageiro).filter(models.Passageiro.id == passageiro_id).first()
    if passageiro:
        for key, value in dados.dict().items():
            setattr(passageiro, key, value)
        db.commit()
        db.refresh(passageiro)
    return passageiro

def deletar_passageiro(db: Session, passageiro_id: int):
    passageiro = db.query(models.Passageiro).filter(models.Passageiro.id == passageiro_id).first()
    if passageiro:
        db.delete(passageiro)
        db.commit()
    return passageiro

# --------------------------
# ÔNIBUS
# --------------------------
def criar_onibus(db: Session, onibus: schemas.OnibusCreate):
    db_onibus = models.Onibus(**onibus.dict())
    db.add(db_onibus)
    db.commit()
    db.refresh(db_onibus)
    return db_onibus

def listar_onibus(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Onibus).offset(skip).limit(limit).all()

def obter_onibus(db: Session, onibus_id: int):
    return db.query(models.Onibus).filter(models.Onibus.id == onibus_id).first()

def atualizar_onibus(db: Session, onibus_id: int, dados: schemas.OnibusCreate):
    onibus = db.query(models.Onibus).filter(models.Onibus.id == onibus_id).first()
    if onibus:
        for key, value in dados.dict().items():
            setattr(onibus, key, value)
        db.commit()
        db.refresh(onibus)
    return onibus

def deletar_onibus(db: Session, onibus_id: int):
    onibus = db.query(models.Onibus).filter(models.Onibus.id == onibus_id).first()
    if onibus:
        db.delete(onibus)
        db.commit()
    return onibus

# --------------------------
# ROTA
# --------------------------
def criar_rota(db: Session, rota: schemas.RotaCreate):
    db_rota = models.Rota(**rota.dict())
    db.add(db_rota)
    db.commit()
    db.refresh(db_rota)
    return db_rota

def listar_rotas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Rota).offset(skip).limit(limit).all()

def obter_rota(db: Session, rota_id: int):
    return db.query(models.Rota).filter(models.Rota.id == rota_id).first()

def atualizar_rota(db: Session, rota_id: int, dados: schemas.RotaCreate):
    rota = db.query(models.Rota).filter(models.Rota.id == rota_id).first()
    if rota:
        for key, value in dados.dict().items():
            setattr(rota, key, value)
        db.commit()
        db.refresh(rota)
    return rota

def deletar_rota(db: Session, rota_id: int):
    rota = db.query(models.Rota).filter(models.Rota.id == rota_id).first()
    if rota:
        db.delete(rota)
        db.commit()
    return rota

# --------------------------
# PARADA
# --------------------------
def criar_parada(db: Session, parada: schemas.ParadaCreate):
    db_parada = models.Parada(**parada.dict())
    db.add(db_parada)
    db.commit()
    db.refresh(db_parada)
    return db_parada

def listar_paradas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Parada).offset(skip).limit(limit).all()

def obter_parada(db: Session, parada_id: int):
    return db.query(models.Parada).filter(models.Parada.id == parada_id).first()

def atualizar_parada(db: Session, parada_id: int, dados: schemas.ParadaCreate):
    parada = db.query(models.Parada).filter(models.Parada.id == parada_id).first()
    if parada:
        for key, value in dados.dict().items():
            setattr(parada, key, value)
        db.commit()
        db.refresh(parada)
    return parada

def deletar_parada(db: Session, parada_id: int):
    parada = db.query(models.Parada).filter(models.Parada.id == parada_id).first()
    if parada:
        db.delete(parada)
        db.commit()
    return parada

# --------------------------
# VIAGEM
# --------------------------
def criar_viagem(db: Session, viagem: schemas.ViagemCreate):
    db_viagem = models.Viagem(**viagem.dict())
    db.add(db_viagem)
    db.commit()
    db.refresh(db_viagem)
    return db_viagem

def listar_viagens(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Viagem).offset(skip).limit(limit).all()

def obter_viagem(db: Session, viagem_id: int):
    return db.query(models.Viagem).filter(models.Viagem.id == viagem_id).first()

def atualizar_viagem(db: Session, viagem_id: int, dados: schemas.ViagemCreate):
    viagem = db.query(models.Viagem).filter(models.Viagem.id == viagem_id).first()
    if viagem:
        for key, value in dados.dict().items():
            setattr(viagem, key, value)
        db.commit()
        db.refresh(viagem)
    return viagem

def deletar_viagem(db: Session, viagem_id: int):
    viagem = db.query(models.Viagem).filter(models.Viagem.id == viagem_id).first()
    if viagem:
        db.delete(viagem)
        db.commit()
    return viagem

# --------------------------
# FEEDBACK
# --------------------------
def criar_feedback(db: Session, feedback: schemas.FeedbackCreate):
    db_feedback = models.Feedback(**feedback.dict())
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def listar_feedbacks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Feedback).offset(skip).limit(limit).all()

def obter_feedback(db: Session, feedback_id: int):
    return db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()

def deletar_feedback(db: Session, feedback_id: int):
    feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if feedback:
        db.delete(feedback)
        db.commit()
    return feedback

# --------------------------
# EMBARQUE
# --------------------------
def criar_embarque(db: Session, embarque: schemas.EmbarqueCreate):
    db_embarque = models.Embarque(**embarque.dict())
    db.add(db_embarque)
    db.commit()
    db.refresh(db_embarque)
    return db_embarque

def listar_embarques(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Embarque).offset(skip).limit(limit).all()

def obter_embarque(db: Session, passageiro_id: int, viagem_id: int):
    return db.query(models.Embarque).filter(
        models.Embarque.id_passageiro == passageiro_id,
        models.Embarque.id_viagem == viagem_id
    ).first()

def deletar_embarque(db: Session, passageiro_id: int, viagem_id: int):
    embarque = db.query(models.Embarque).filter(
        models.Embarque.id_passageiro == passageiro_id,
        models.Embarque.id_viagem == viagem_id
    ).first()
    if embarque:
        db.delete(embarque)
        db.commit()
    return embarque

# --------------------------
# ITINERARIO
# --------------------------
def criar_itinerario(db: Session, itinerario: schemas.ItinerarioCreate):
    db_itinerario = models.Itinerario(**itinerario.dict())
    db.add(db_itinerario)
    db.commit()
    db.refresh(db_itinerario)
    return db_itinerario

def listar_itinerarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Itinerario).offset(skip).limit(limit).all()

def obter_itinerario(db: Session, id_rota: int, id_parada: int):
    return db.query(models.Itinerario).filter(
        models.Itinerario.id_rota == id_rota,
        models.Itinerario.id_parada == id_parada
    ).first()

def deletar_itinerario(db: Session, id_rota: int, id_parada: int):
    itinerario = db.query(models.Itinerario).filter(
        models.Itinerario.id_rota == id_rota,
        models.Itinerario.id_parada == id_parada
    ).first()
    if itinerario:
        db.delete(itinerario)
        db.commit()
    return itinerario