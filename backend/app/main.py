from fastapi import FastAPI, Depends, HTTPException, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.database import SessionLocal, engine

# Criar tabelas
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Templates e arquivos estáticos
templates = Jinja2Templates(directory="app/templates")

# Dependency para o banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =============================
# ROTAS HTML (LISTAR ENTIDADES)
# =============================

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# ----------------- MOTORISTAS -----------------
@app.get("/motoristas")
def motoristas(request: Request, db: Session = Depends(get_db)):
    lista = crud.listar_motoristas(db)
    return templates.TemplateResponse("motoristas.html", {"request": request, "motoristas": lista})

# ----------------- PASSAGEIROS -----------------
@app.get("/passageiros")
def passageiros(request: Request, db: Session = Depends(get_db)):
    lista = crud.listar_passageiros(db)
    return templates.TemplateResponse("passageiros.html", {"request": request, "passageiros": lista})

# ----------------- ÔNIBUS -----------------
@app.get("/onibus")
def onibus(request: Request, db: Session = Depends(get_db)):
    lista = crud.listar_onibus(db)
    return templates.TemplateResponse("onibus.html", {"request": request, "onibus": lista})

# ----------------- ROTAS -----------------
@app.get("/rotas")
def rotas(request: Request, db: Session = Depends(get_db)):
    lista = crud.listar_rotas(db)
    return templates.TemplateResponse("rotas.html", {"request": request, "rotas": lista})

# ----------------- PARADAS -----------------
@app.get("/paradas")
def paradas(request: Request, db: Session = Depends(get_db)):
    lista = crud.listar_paradas(db)
    return templates.TemplateResponse("paradas.html", {"request": request, "paradas": lista})

# ----------------- VIAGENS -----------------
@app.get("/viagens")
def viagens(request: Request, db: Session = Depends(get_db)):
    lista = crud.listar_viagens(db)
    return templates.TemplateResponse("viagens.html", {"request": request, "viagens": lista})

# ----------------- FEEDBACKS -----------------
@app.get("/feedbacks")
def feedbacks(request: Request, db: Session = Depends(get_db)):
    lista = crud.listar_feedbacks(db)
    return templates.TemplateResponse("feedbacks.html", {"request": request, "feedbacks": lista})

# ----------------- EMBARQUES -----------------
@app.get("/embarques")
def embarques(request: Request, db: Session = Depends(get_db)):
    lista = crud.listar_embarques(db)
    return templates.TemplateResponse("embarques.html", {"request": request, "embarques": lista})

# ----------------- ITINERÁRIOS -----------------
@app.get("/itinerarios")
def itinerarios(request: Request, db: Session = Depends(get_db)):
    lista = crud.listar_itinerarios(db)
    return templates.TemplateResponse("itinerarios.html", {"request": request, "itinerarios": lista})

# =============================
# ROTAS API (INSERIR VIA JSON)
# =============================

@app.post("/motoristas")
def criar_motorista(motorista: schemas.MotoristaCreate, db: Session = Depends(get_db)):
    return crud.criar_motorista(db, motorista)

@app.post("/passageiros")
def criar_passageiro(passageiro: schemas.PassageiroCreate, db: Session = Depends(get_db)):
    return crud.criar_passageiro(db, passageiro)

@app.post("/onibus")
def criar_onibus(onibus: schemas.OnibusCreate, db: Session = Depends(get_db)):
    return crud.criar_onibus(db, onibus)

@app.post("/rotas")
def criar_rota(rota: schemas.RotaCreate, db: Session = Depends(get_db)):
    return crud.criar_rota(db, rota)

@app.post("/paradas")
def criar_parada(parada: schemas.ParadaCreate, db: Session = Depends(get_db)):
    return crud.criar_parada(db, parada)

@app.post("/viagens")
def criar_viagem(viagem: schemas.ViagemCreate, db: Session = Depends(get_db)):
    return crud.criar_viagem(db, viagem)

@app.post("/feedbacks")
def criar_feedback(feedback: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    return crud.criar_feedback(db, feedback)

@app.post("/embarques")
def criar_embarque(embarque: schemas.EmbarqueCreate, db: Session = Depends(get_db)):
    return crud.criar_embarque(db, embarque)

@app.post("/itinerarios")
def criar_itinerario(itinerario: schemas.ItinerarioCreate, db: Session = Depends(get_db)):
    return crud.criar_itinerario(db, itinerario)