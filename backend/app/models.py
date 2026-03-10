from sqlalchemy import Column, Integer, String, Boolean, Enum, Float, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base
import enum

# Enums
class StatusMotorista(enum.Enum):
    ativo = "Ativo"
    suspenso = "Suspenso"
    ferias = "Férias"

class PerfilAcessibilidade(enum.Enum):
    nenhum = "Nenhum"
    cadeirante = "Cadeirante"
    muletas = "Muletas"
    visual = "Visual"

class StatusParada(enum.Enum):
    acessivel = "Acessível"
    inacessivel = "Inacessível"
    manutencao = "Manutenção"

class TipoPagamento(enum.Enum):
    cartao_estudante = "Cartão Estudante"
    vale_transporte = "Vale-Transporte"
    integracao = "Integração"
    gratuito = "Gratuito"

class TipoOcorrencia(enum.Enum):
    lotacao = "Lotação"
    mecanica = "Mecânica"
    conduta = "Conduta"
    acessibilidade = "Acessibilidade"

# Motorista
class Motorista(Base):
    __tablename__ = "motoristas"
    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String(100), nullable=False)
    cnh = Column(String(20), unique=True, nullable=False)
    status = Column(Enum(StatusMotorista), default=StatusMotorista.ativo)

    viagens = relationship("Viagem", back_populates="motorista")

# Passageiro
class Passageiro(Base):
    __tablename__ = "passageiros"
    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String(100), nullable=False)
    perfil_acessibilidade = Column(Enum(PerfilAcessibilidade), default=PerfilAcessibilidade.nenhum)

    embarques = relationship("Embarque", back_populates="passageiro")
    feedbacks = relationship("Feedback", back_populates="passageiro")

# Ônibus
class Onibus(Base):
    __tablename__ = "onibus"
    id = Column(Integer, primary_key=True, index=True)
    placa = Column(String(10), unique=True, nullable=False)
    modelo_acessivel = Column(Boolean, default=False)
    capacidade_maxima = Column(Integer, nullable=False)

    viagens = relationship("Viagem", back_populates="onibus")

# Rota
class Rota(Base):
    __tablename__ = "rotas"
    id = Column(Integer, primary_key=True, index=True)
    codigo_rota = Column(String(10), nullable=False)
    nome_rota = Column(String(50))

    viagens = relationship("Viagem", back_populates="rota")
    itinerarios = relationship("Itinerario", back_populates="rota")

# Parada
class Parada(Base):
    __tablename__ = "paradas"
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    status_acessibilidade = Column(Enum(StatusParada), default=StatusParada.acessivel)

    itinerarios = relationship("Itinerario", back_populates="parada")

# Viagem
class Viagem(Base):
    __tablename__ = "viagens"
    id = Column(Integer, primary_key=True, index=True)
    id_rota = Column(Integer, ForeignKey("rotas.id"), nullable=False)
    id_onibus = Column(Integer, ForeignKey("onibus.id"), nullable=False)
    id_motorista = Column(Integer, ForeignKey("motoristas.id"), nullable=False)
    horario_saida_real = Column(DateTime)
    nivel_lotacao_atual = Column(Integer)

    motorista = relationship("Motorista", back_populates="viagens")
    onibus = relationship("Onibus", back_populates="viagens")
    rota = relationship("Rota", back_populates="viagens")
    embarques = relationship("Embarque", back_populates="viagem")
    feedbacks = relationship("Feedback", back_populates="viagem")

# Feedback
class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True, index=True)
    id_passageiro = Column(Integer, ForeignKey("passageiros.id"))
    id_viagem = Column(Integer, ForeignKey("viagens.id"))
    tipo_ocorrencia = Column(Enum(TipoOcorrencia))
    nivel_lotacao_informado = Column(Integer, nullable=True)
    data_hora = Column(DateTime)

    passageiro = relationship("Passageiro", back_populates="feedbacks")
    viagem = relationship("Viagem", back_populates="feedbacks")

# Entidade associativa: Itinerário
class Itinerario(Base):
    __tablename__ = "itinerarios"
    id_rota = Column(Integer, ForeignKey("rotas.id"), primary_key=True)
    id_parada = Column(Integer, ForeignKey("paradas.id"), primary_key=True)
    ordem_parada = Column(Integer, nullable=False)
    tempo_estimado_chegada = Column(DateTime)

    rota = relationship("Rota", back_populates="itinerarios")
    parada = relationship("Parada", back_populates="itinerarios")

# Entidade associativa: Embarque
class Embarque(Base):
    __tablename__ = "embarques"
    id_passageiro = Column(Integer, ForeignKey("passageiros.id"), primary_key=True)
    id_viagem = Column(Integer, ForeignKey("viagens.id"), primary_key=True)
    id_parada_origem = Column(Integer, ForeignKey("paradas.id"))
    data_hora_embarque = Column(DateTime, nullable=False)
    tipo_pagamento = Column(Enum(TipoPagamento))

    passageiro = relationship("Passageiro", back_populates="embarques")
    viagem = relationship("Viagem", back_populates="embarques")