from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv
from mangum import Mangum

# Cargar variables de entorno desde .env
load_dotenv()

app = FastAPI(title="Asesor de Arquitectura API")
handler = Mangum(app)

# Configurar CORS para permitir que React (Vite) en localhost:5173 se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
# Esta lógica se usará mientras no haya una API Key configurada o si falla la IA.
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
        profeAdvice = "Profe tip: Tienen un equipo grande para un proyecto simple. Dividan bien las tareas para no pisarse los talones; a veces 'muchos cocineros arruinan el caldo' en proyectos pequeños."

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

# --- Endpoint Principal ---

@app.post("/diagnostico", response_model=Recommendation)
async def get_diagnostico(answers: Answers):
    
    # 1. Comprobar si hay una API Key de OpenAI configurada
    api_key = os.getenv("OPENAI_API_KEY")
    
    if api_key and api_key != "your_api_key_here":
        try:
            client = AsyncOpenAI(api_key=api_key)
            
            system_prompt = """
Eres el "Asesor de Tecnología by Choke", un profesor de ingeniería de software experto, directo, profesional y con un toque de sabiduría práctica (estilo "senior architect").
Tu objetivo es ayudar a los alumnos a elegir el stack tecnológico adecuado para su proyecto integrador, evitando "lagunas lógicas" (decisiones que no tienen sentido técnico o económico).

Recibirás las siguientes variables clave:
1. Tipo de Proyecto (ecommerce, pos, landing, saas, mobile, ai)
2. Presupuesto (low: $0-50, medium: $50-200, high: +$500)
3. Tiempo (days, weeks, months)
4. Nivel Técnico del Equipo (beginner, intermediate, advanced)
5. Tamaño del Equipo (solo, small: 2-3, large: 4+)
6. Objetivo Principal (learn: académico, build: negocio/PVM, scale: profesional/escalable)

DEBES RESPONDER ÚNICAMENTE EN FORMATO JSON siguiendo este esquema:
{
  "approachTitle": "Título corto del enfoque",
  "approach": "Explicación detallada justificando el stack basado en el equipo, objetivo y restricciones.",
  "frontend": "Tecnología de frontend",
  "backend": "Tecnología de backend",
  "database": "Base de datos",
  "hosting": "Hosting/Infra",
  "monthlyCost": "Costo estimado en USD",
  "logicalGapWarning": "Opcional: Advertencia sobre contradicciones técnicas o de recursos.",
  "profeAdvice": "Un consejo 'Profe Tip' breve y valioso (especialmente sobre el objetivo o tamaño del equipo).",
  "roadmap": ["Paso 1", "Paso 2", "Paso 3", "Paso 4"]
}

Considera el Tamaño del Equipo: si es solo, prioriza herramientas de alta productividad (BaaS, No-code). Si es grande, sugiere frameworks que permitan modularidad y tipado fuerte (TypeScript).
Considera el Objetivo: si es Académico, sugiere tecnologías tendencia para el CV. Si es Negocio, prioriza velocidad de salida al mercado (time-to-market).
"""

            user_message = f"""
Variables del Alumno:
- Tipo: {answers.type}
- Presupuesto: {answers.budget}
- Tiempo: {answers.timeline}
- Nivel Técnico: {answers.skill}
- Tamaño Equipo: {answers.teamSize}
- Objetivo: {answers.goal}
"""

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
            print(f"Error calling OpenAI: {e}")
            # Fallback a la lógica interna si falla la API
            return generate_fallback_recommendation(answers)
    
    # 2. Si no hay clave, usamos nuestra lógica robusta de respaldo
    return generate_fallback_recommendation(answers)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
