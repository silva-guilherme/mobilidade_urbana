from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, time
from . import schemas

# ==============================
# CLASSES DE RESPOSTA (com ID e dados completos)
# ==============================

class TelefoneMotoristaResponse(BaseModel):  # ← NÃO estender de TelefoneMotoristaBase
    numero: str
    tipo: str
    # id_motorista: int  # ← REMOVA esta linha! O telefone não precisa do ID do motorista no retorno

    class Config:
        from_attributes = True


class MotoristaResponse(schemas.MotoristaBase):
    id: int
    data_criacao: Optional[datetime] = None
    telefones: List[TelefoneMotoristaResponse] = []  # ← Agora espera só numero e tipo

    class Config:
        from_attributes = True


class EmailPassageiroResponse(BaseModel):  # ← NÃO estender de EmailPassageiroBase
    email: str
    # id_passageiro: int  # ← REMOVA esta linha!

    class Config:
        from_attributes = True


class PassageiroResponse(schemas.PassageiroBase):
    id: int
    data_criacao: Optional[datetime] = None
    emails: List[str] = []  # ← Lista de strings, não de objetos

    class Config:
        from_attributes = True


class OnibusResponse(schemas.OnibusBase):
    id: int
    data_criacao: Optional[datetime] = None

    class Config:
        from_attributes = True


class RotaResponse(schemas.RotaBase):
    id: int
    data_criacao: Optional[datetime] = None
    itinerario: Optional[List] = None

    class Config:
        from_attributes = True


class ParadaResponse(schemas.ParadaBase):
    id: int
    data_criacao: Optional[datetime] = None

    class Config:
        from_attributes = True


class ViagemResponse(schemas.ViagemBase):
    id: int
    data_criacao: Optional[datetime] = None
    codigo_rota: Optional[str] = None
    nome_rota: Optional[str] = None
    onibus_placa: Optional[str] = None
    motorista_nome: Optional[str] = None

    class Config:
        from_attributes = True


class EmbarqueResponse(schemas.EmbarqueBase):
    data_criacao: Optional[datetime] = None
    passageiro_nome: Optional[str] = None
    parada_lat: Optional[float] = None
    parada_lon: Optional[float] = None

    class Config:
        from_attributes = True


class FeedbackResponse(schemas.FeedbackBase):
    id: int
    data_criacao: Optional[datetime] = None
    passageiro_nome: Optional[str] = None
    viagem_horario: Optional[time] = None

    class Config:
        from_attributes = True


class ItinerarioResponse(schemas.ItinerarioBase):
    data_criacao: Optional[datetime] = None
    codigo_rota: Optional[str] = None
    nome_rota: Optional[str] = None
    parada_lat: Optional[float] = None
    parada_lon: Optional[float] = None
    parada_status: Optional[str] = None

    class Config:
        from_attributes = True