from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Motorista
class MotoristaBase(BaseModel):
    nome_completo: str
    cnh: str
    status: Optional[str] = "Ativo"

class MotoristaCreate(MotoristaBase):
    pass

class Motorista(MotoristaBase):
    id: int
    class Config:
        orm_mode = True

# Passageiro
class PassageiroBase(BaseModel):
    nome_completo: str
    perfil_acessibilidade: Optional[str] = "Nenhum"

class PassageiroCreate(PassageiroBase):
    pass

class Passageiro(PassageiroBase):
    id: int
    class Config:
        orm_mode = True

# Ônibus
class OnibusBase(BaseModel):
    placa: str
    modelo_acessivel: bool
    capacidade_maxima: int

class OnibusCreate(OnibusBase):
    pass

class Onibus(OnibusBase):
    id: int
    class Config:
        orm_mode = True

# Rota
class RotaBase(BaseModel):
    codigo_rota: str
    nome_rota: Optional[str]

class RotaCreate(RotaBase):
    pass

class Rota(RotaBase):
    id: int
    class Config:
        orm_mode = True

# Parada
class ParadaBase(BaseModel):
    latitude: float
    longitude: float
    status_acessibilidade: Optional[str] = "Acessível"

class ParadaCreate(ParadaBase):
    pass

class Parada(ParadaBase):
    id: int
    class Config:
        orm_mode = True

# Viagem
class ViagemBase(BaseModel):
    id_rota: int
    id_onibus: int
    id_motorista: int
    horario_saida_real: Optional[datetime]
    nivel_lotacao_atual: Optional[int]

class ViagemCreate(ViagemBase):
    pass

class Viagem(ViagemBase):
    id: int
    class Config:
        orm_mode = True

# Feedback
class FeedbackBase(BaseModel):
    id_passageiro: int
    id_viagem: int
    tipo_ocorrencia: str
    nivel_lotacao_informado: Optional[int]
    data_hora: datetime

class FeedbackCreate(FeedbackBase):
    pass

class Feedback(FeedbackBase):
    id: int
    class Config:
        orm_mode = True

# Embarque
class EmbarqueBase(BaseModel):
    id_passageiro: int
    id_viagem: int
    id_parada_origem: int
    data_hora_embarque: datetime
    tipo_pagamento: str

class EmbarqueCreate(EmbarqueBase):
    pass

class Embarque(EmbarqueBase):
    class Config:
        orm_mode = True

# Itinerário
class ItinerarioBase(BaseModel):
    id_rota: int
    id_parada: int
    ordem_parada: int
    tempo_estimado_chegada: datetime

class ItinerarioCreate(ItinerarioBase):
    pass

class Itinerario(ItinerarioBase):
    class Config:
        orm_mode = True