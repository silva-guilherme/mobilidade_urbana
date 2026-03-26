from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, time
from enum import Enum



class PerfilAcessibilidade(str, Enum):
    nenhum = "nenhum"
    cadeirante = "cadeirante"
    muletas = "muletas"
    visual = "visual"


class StatusMotorista(str, Enum):
    ativo = "ativo"
    suspenso = "suspenso"
    ferias = "ferias"


class StatusParada(str, Enum):
    acessivel = "acessivel"
    inacessivel = "inacessivel"
    manutencao = "manutencao"


class TipoOcorrencia(str, Enum):
    lotacao = "lotacao"
    mecanica = "mecanica"
    conduta = "conduta"
    acessibilidade = "acessibilidade"


class TipoPagamento(str, Enum):
    cartao_estudante = "cartao_estudante"
    vale_transporte = "vale_transporte"
    integracao = "integracao"
    gratuito = "gratuito"


class TipoTelefone(str, Enum):
    pessoal = "pessoal"
    trabalho = "trabalho"
    emergencia = "emergencia"




class EmailPassageiroBase(BaseModel):
    email: str


class EmailPassageiroCreate(EmailPassageiroBase):
    id_passageiro: int


class EmailPassageiro(EmailPassageiroBase):
    id_passageiro: int
    data_criacao: Optional[datetime] = None

    class Config:
        from_attributes = True



class PassageiroBase(BaseModel):
    nome_completo: str
    perfil_acessibilidade: Optional[PerfilAcessibilidade] = None


class PassageiroCreate(PassageiroBase):
    emails: Optional[List[str]] = None  

class Passageiro(PassageiroBase):
    id: int
    data_criacao: Optional[datetime] = None
    emails: Optional[List[str]] = None

    class Config:
        from_attributes = True




class TelefoneMotoristaBase(BaseModel):
    numero: str
    tipo: TipoTelefone


class TelefoneMotoristaCreate(TelefoneMotoristaBase):
    id_motorista: int


class TelefoneMotorista(TelefoneMotoristaBase):
    id_motorista: int
    data_criacao: Optional[datetime] = None

    class Config:
        from_attributes = True




class MotoristaBase(BaseModel):
    nome_completo: str
    cnh: str
    status: StatusMotorista


class MotoristaCreate(MotoristaBase):
    telefones: Optional[List[TelefoneMotoristaBase]] = []

    class Config:
        json_schema_extra = {
            "example": {
                "nome_completo": "João Silva",
                "cnh": "12345678910",
                "status": "ativo",
                "telefones": [
                    {
                        "numero": "(11) 98888-7777",
                        "tipo": "pessoal"
                    }
                ]
            }
        }

class Motorista(MotoristaBase):
    id: int
    data_criacao: Optional[datetime] = None
    telefones: Optional[List[TelefoneMotoristaBase]] = []

    class Config:
        from_attributes = True



class OnibusBase(BaseModel):
    placa: str
    modelo_acessivel: bool
    capacidade_maxima: int


class OnibusCreate(OnibusBase):
    pass


class Onibus(OnibusBase):
    id: int
    data_criacao: Optional[datetime] = None

    class Config:
        from_attributes = True




class RotaBase(BaseModel):
    codigo_rota: str
    nome_rota: str


class RotaCreate(RotaBase):
    pass


class Rota(RotaBase):
    id: int
    data_criacao: Optional[datetime] = None

    class Config:
        from_attributes = True


class ParadaBase(BaseModel):
    latitude: float
    longitude: float
    status_acessibilidade: Optional[StatusParada] = None


class ParadaCreate(ParadaBase):
    pass


class Parada(ParadaBase):
    id: int
    data_criacao: Optional[datetime] = None

    class Config:
        from_attributes = True




class ItinerarioBase(BaseModel):
    id_rota: int
    id_parada: int
    ordem_parada: int
    tempo_estimado: Optional[time] = None


class ItinerarioCreate(ItinerarioBase):
    pass


class Itinerario(ItinerarioBase):
    data_criacao: Optional[datetime] = None

    class Config:
        from_attributes = True



class ViagemBase(BaseModel):
    id_rota: int
    id_onibus: int
    id_motorista: int
    horario_saida: time
    lotacao_atual: int = 0  


class ViagemCreate(ViagemBase):
    pass


class Viagem(ViagemBase):
    id: int
    data_criacao: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmbarqueBase(BaseModel):
    id_viagem: int
    id_passageiro: int
    id_parada_origem: Optional[int] = None
    data_hora: datetime
    tipo_pagamento: TipoPagamento


class EmbarqueCreate(EmbarqueBase):
    pass


class Embarque(EmbarqueBase):
    data_criacao: Optional[datetime] = None

    class Config:
        from_attributes = True



class FeedbackBase(BaseModel):
    id_passageiro: int
    id_viagem: int
    tipo_ocorrencia: TipoOcorrencia
    nivel_lotacao: Optional[int] = None
    data_hora: datetime


class FeedbackCreate(FeedbackBase):
    pass


class Feedback(FeedbackBase):
    id: int
    data_criacao: Optional[datetime] = None

    class Config:
        from_attributes = True