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

    logicalGapWarning = None
    profeAdvice = ""

    complexity_map = {
        'ecommerce': 'medium', 'pos': 'high', 'landing': 'low',
        'saas': 'high', 'mobile': 'high', 'ai': 'high'
    }
    
    complexity = complexity_map.get(type_, 'medium')

    isFastCheapAndComplex = (timeline in ['days', 'weeks']) and budget == 'low' and complexity == 'high'
    isBeginnerCustom = skill == 'beginner' and type_ in ['saas', 'pos', 'ai'] and timeline == 'days'

    if isFastCheapAndComplex:
        logicalGapWarning = "¡Atención! Estás intentando construir algo complejo, sin dinero y sin tiempo. En ingeniería de software existe el 'Triángulo de Hierro'. Debes sacrificar alcance (hacer menos funcionalidades), conseguir más tiempo, o usar herramientas No-Code (SaaS)."
    elif isBeginnerCustom:
        logicalGapWarning = "Laguna lógica detectada: El equipo es principiante pero quiere lanzar un sistema complejo en días. Esto resultará en código inmanejable (deuda técnica). La recomendación forzosa es usar No-Code o plantillas."

    if timeline == 'days' or (skill == 'beginner' and budget == 'low') or (type_ == 'ecommerce' and budget == 'low' and timeline != 'months'):
        approachTitle = "Producto Viable Mínimo (PVM) mediante SaaS / No-Code"
        approach = "No reinventes la rueda. Para validar tu idea rápido y sin presupuesto, usa plataformas existentes. Un desarrollo a medida ahora mismo es un riesgo innecesario."
        hosting = "Plataformas SaaS (Cloud del proveedor)"
        backend = "Integrado en la plataforma"
        database = "Gestionada por la plataforma"
        
        if type_ == 'ecommerce':
            frontend = "Shopify, WooCommerce o Tiendanube"
            monthlyCost = "$20 - $40 USD / mes"
            roadmap = ["Registra tu dominio", "Configura la tienda base", "Añade productos de prueba", "Configura pasarela de pago"]
        elif type_ == 'pos':
            frontend = "Odoo POS, Square o Excel/Google Sheets (PVM extremo)"
            monthlyCost = "$0 - $30 USD / mes"
            roadmap = ["Define tu inventario base", "Configura el sistema POS", "Prueba flujos de venta en caja", "Capacita al personal"]
        elif type_ == 'landing':
            frontend = "Framer, Webflow o WordPress"
            monthlyCost = "$0 - $15 USD / mes"
            roadmap = ["Define el copy y estructura", "Elige una plantilla base", "Personaliza con tus colores/logo", "Publica y enlaza dominio"]
        elif type_ == 'mobile':
            frontend = "Glide, FlutterFlow o Adalo"
            monthlyCost = "$25 - $50 USD / mes"
            roadmap = ["Diseña el modelo de datos básico", "Crea las pantallas principales", "Configura acciones y flujos", "Prueba en dispositivo real"]
        elif type_ == 'ai':
            frontend = "Streamlit o Gradio"
            monthlyCost = "$10 - $30 USD / mes"
            roadmap = ["Define el caso de uso de IA", "Crea interfaz simple en Streamlit", "Conecta con API (OpenAI/Claude)", "Despliega en Streamlit Cloud"]
        else:
            frontend = "Bubble o Softr + Airtable"
            monthlyCost = "$20 - $50 USD / mes"
            roadmap = ["Define estructura de datos", "Crea flujos de usuario", "Diseña UI en la plataforma", "Lanza versión de prueba"]
    else:
        approachTitle = "Desarrollo a Medida (Custom Build)"
        approach = "Tienes las condiciones (tiempo, equipo o presupuesto) para construir una solución propia que pueda escalar y adaptarse exactamente a tus necesidades."
        
        if skill in ['beginner', 'intermediate']:
            frontend = "React Native (Expo)" if type_ == 'mobile' else "React.js / Next.js"
            backend = "Supabase (Backend as a Service) o Firebase"
            database = "PostgreSQL (Supabase) o Firestore"
            hosting = "Vercel (Frontend) + Supabase (Backend)"
            monthlyCost = "$0 - $25 USD / mes (Capa gratuita inicial)"
            roadmap = ["Configura proyecto en Supabase", "Crea esquema de Base de Datos", "Configura proyecto Vite/Next.js", "Conecta UI con backend"]
        else:
            frontend = "Flutter / React Native" if type_ == 'mobile' else "Next.js / Angular"
            backend = "Node.js (NestJS / Express) o Python (FastAPI)"
            database = "PostgreSQL (Relacional) o MongoDB"
            hosting = "AWS, Google Cloud o VPS (DigitalOcean)"
            monthlyCost = "$20 - $100+ USD / mes (Depende del tráfico)"
            roadmap = ["Diseña arquitectura de microservicios o monolito", "Configura base de datos y migraciones", "Implementa APIs y autenticación", "Configura CI/CD para despliegues automáticos"]

        if type_ == 'pos':
            profeAdvice = "Profe tip: Un POS requiere funcionar offline o con mala conexión. Considera arquitecturas Local-first (ej. PWA con IndexedDB o aplicaciones de escritorio con Electron) si el internet del cliente final no es confiable."
        if type_ == 'ai':
            profeAdvice = "Profe tip: No reinventes la rueda entrenando modelos desde cero si no tienes experiencia. Usa APIs existentes (OpenAI, Anthropic) para validar tu idea de negocio primero."

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

@app.post("/api/diagnostico", response_model=Recommendation)
async def get_diagnostico(answers: Answers):
    
    # 1. Comprobar si hay una API Key de OpenAI configurada
    api_key = os.getenv("OPENAI_API_KEY")
    
    if api_key and api_key != "your_api_key_here":
        try:
            client = AsyncOpenAI(api_key=api_key)
            
            system_prompt = """
Eres el "Asesor de Tecnología by Choke", un profesor de ingeniería de software experto, directo, profesional y con un toque de sabiduría práctica (estilo "senior architect").
Tu objetivo es ayudar a los alumnos a elegir el stack tecnológico adecuado para su proyecto integrador, evitando "lagunas lógicas" (decisiones que no tienen sentido técnico o económico).

Recibirás 4 variables:
1. Tipo de Proyecto (ecommerce, pos, landing, saas, mobile, ai)
2. Presupuesto (low: $0-50, medium: $50-200, high: +$500)
3. Tiempo (days, weeks, months)
4. Nivel Técnico (beginner, intermediate, advanced)

DEBES RESPONDER ÚNICAMENTE EN FORMATO JSON siguiendo este esquema:
{
  "approachTitle": "Título corto del enfoque (ej: PVM con No-Code, Microservicios Escalables, etc.)",
  "approach": "Explicación detallada de por qué este enfoque es el mejor dada la situación.",
  "frontend": "Tecnología de frontend recomendada",
  "backend": "Tecnología de backend recomendada",
  "database": "Base de datos recomendada",
  "hosting": "Dónde desplegar el proyecto",
  "monthlyCost": "Costo estimado en USD (ej: $10 - $25 USD / mes)",
  "logicalGapWarning": "Opcional: Si hay una contradicción (ej: proyecto complejo en 3 días con $0), explica el riesgo.",
  "profeAdvice": "Un consejo 'Profe Tip' breve y valioso para el alumno.",
  "roadmap": ["Paso 1", "Paso 2", "Paso 3", "Paso 4"]
}

Sé realista. Si tienen poco tiempo y poco nivel, recomienda No-Code o frameworks simples. Si tienen nivel avanzado y tiempo, recomienda arquitecturas robustas.
"""

            user_message = f"""
Variables del Alumno:
- Tipo: {answers.type}
- Presupuesto: {answers.budget}
- Tiempo: {answers.timeline}
- Nivel Técnico: {answers.skill}
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

