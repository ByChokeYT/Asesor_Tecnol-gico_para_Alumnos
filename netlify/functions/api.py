from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import logging
from openai import AsyncOpenAI
from dotenv import load_dotenv
from mangum import Mangum

# Configurar logging para Netlify
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cargar variables de entorno desde .env
load_dotenv()

app = FastAPI(title="Asesor de Arquitectura API")
handler = Mangum(app)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Modelos de Datos (Pydantic) ---

class Answers(BaseModel):
    type: str
    budget: str
    timeline: str
    skill: str
    teamSize: str
    goal: str

class Recommendation(BaseModel):
    approach: str
    approachTitle: str
    frontend: str
    backend: str
    database: str
    hosting: str
    monthlyCost: str
    logicalGapWarning: Optional[str] = None
    profeAdvice: Optional[str] = ""
    roadmap: List[str]

# --- Lógica de Respaldo (Fallback) ---
def generate_fallback_recommendation(answers: Answers) -> Recommendation:
    type_ = answers.type
    budget = answers.budget
    timeline = answers.timeline
    skill = answers.skill
    teamSize = answers.teamSize
    goal = answers.goal

    logicalGapWarning = None
    profeAdvice = ""

    complexity_map = {
        'ecommerce': 'medium', 'pos': 'high', 'landing': 'low',
        'saas': 'high', 'mobile': 'high', 'ai': 'high'
    }
    
    complexity = complexity_map.get(type_, 'medium')

    isFastCheapAndComplex = (timeline in ['days', 'weeks']) and budget == 'low' and complexity == 'high'
    isBeginnerCustom = skill == 'beginner' and type_ in ['saas', 'pos', 'ai'] and timeline == 'days'
    isLargeTeamSmallProject = teamSize == 'large' and type_ == 'landing'

    if isFastCheapAndComplex:
        logicalGapWarning = "¡Atención! Estás intentando construir algo complejo, sin dinero y sin tiempo. En ingeniería de software existe el 'Triángulo de Hierro'. Debes sacrificar alcance, conseguir más tiempo, o usar herramientas No-Code."
    elif isBeginnerCustom:
        logicalGapWarning = "Laguna lógica detectada: El equipo es principiante pero quiere lanzar un sistema complejo en días. Esto resultará en deuda técnica masiva. Recomendación: No-Code o plantillas."
    elif isLargeTeamSmallProject:
        profeAdvice = "Profe tip: Tienen un equipo grande para un proyecto simple. Dividan bien las tareas para no pisarse los talones."

    if timeline == 'days' or (skill == 'beginner' and budget == 'low' and goal != 'scale') or (type_ == 'ecommerce' and budget == 'low' and timeline != 'months'):
        approachTitle = "PVM mediante SaaS / No-Code"
        approach = f"Dado que el objetivo es {goal} y tienen poco tiempo/presupuesto, lo mejor es validar rápido. No reinventes la rueda."
        hosting = "Plataformas SaaS"
        backend = "Integrado"
        database = "Gestionada"
        
        if type_ == 'ecommerce':
            frontend = "Shopify o WooCommerce"
            monthlyCost = "$20 - $40 USD / mes"
            roadmap = ["Registra dominio", "Configura tienda", "Sube productos", "Pagos"]
        else:
            frontend = "Bubble, FlutterFlow o Softr"
            monthlyCost = "$20 - $50 USD / mes"
            roadmap = ["Define datos", "Crea UI", "Configura flujos", "Lanza"]
    else:
        approachTitle = "Desarrollo a Medida (Custom Build)"
        approach = f"Tienen las condiciones para construir una solución propia. El objetivo de {goal} sugiere que un desarrollo personalizado dará mejores resultados a largo plazo."
        
        if skill in ['beginner', 'intermediate']:
            frontend = "React / Next.js"
            backend = "Supabase o Firebase"
            database = "PostgreSQL o Firestore"
            hosting = "Vercel + Supabase"
            monthlyCost = "$0 - $25 USD / mes"
            roadmap = ["Setup Supabase", "Esquema DB", "Proyecto React", "Conectar API"]
        else:
            frontend = "Next.js / Flutter"
            backend = "FastAPI o Node.js"
            database = "PostgreSQL"
            hosting = "AWS o DigitalOcean"
            monthlyCost = "$20 - $100+ USD / mes"
            roadmap = ["Arquitectura", "Config DB", "APIs & Auth", "CI/CD"]

    return Recommendation(
        approach=approach,
        approachTitle=approachTitle,
        frontend=frontend,
        backend=backend,
        database=database,
        hosting=hosting,
        monthlyCost=monthlyCost,
        logicalGapWarning=logicalGapWarning,
        profeAdvice=profeAdvice,
        roadmap=roadmap
    )

# --- Endpoints ---

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Asesor API is running"}

@app.post("/diagnostico", response_model=Recommendation)
async def get_diagnostico(answers: Answers, request: Request):
    logger.info(f"Recibiendo diagnóstico: {answers}")
    
    api_key = os.getenv("OPENAI_API_KEY")
    
    if api_key and api_key != "your_api_key_here":
        try:
            client = AsyncOpenAI(api_key=api_key)
            
            system_prompt = """
Eres el "Asesor de Tecnología by Choke", un profesor de ingeniería de software experto.
Ayuda a los alumnos a elegir el stack tecnológico adecuado, evitando "lagunas lógicas".

Variables:
1. Tipo: {type}
2. Presupuesto: {budget}
3. Tiempo: {timeline}
4. Nivel: {skill}
5. Equipo: {teamSize}
6. Objetivo: {goal}

Responde en JSON:
{
  "approachTitle": "...",
  "approach": "...",
  "frontend": "...",
  "backend": "...",
  "database": "...",
  "hosting": "...",
  "monthlyCost": "...",
  "logicalGapWarning": "...",
  "profeAdvice": "...",
  "roadmap": ["...", "..."]
}
"""

            user_message = f"Tipo: {answers.type}, Presupuesto: {answers.budget}, Tiempo: {answers.timeline}, Nivel: {answers.skill}, Equipo: {answers.teamSize}, Objetivo: {answers.goal}"

            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )
            
            result_json = json.loads(response.choices[0].message.content)
            return Recommendation(**result_json)
            
        except Exception as e:
            logger.error(f"Error calling OpenAI: {e}")
            return generate_fallback_recommendation(answers)
    
    logger.info("No API Key found, using fallback logic")
    return generate_fallback_recommendation(answers)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
