# 🎓 Asesor de Tecnología by Choke

¡Bienvenido al **Asesor de Arquitectura de Software Pro**! Esta es una herramienta inteligente diseñada para ayudar a estudiantes de ingeniería y desarrolladores novatos a elegir el stack tecnológico ideal para sus proyectos integradores, evitando las temidas "lagunas lógicas".

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React-61dafb.svg)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)
![OpenAI](https://img.shields.io/badge/AI-GPT--4o--mini-orange.svg)

---

## 🚀 Características Principales

- **🧠 Diagnóstico Inteligente**: Utiliza IA (GPT-4o-mini) para analizar tu proyecto basándose en presupuesto, tiempo, nivel técnico y tipo de sistema.
- **👨‍🏫 Persona "Profe Choke"**: Recibe consejos directos y profesionales con el estilo de un arquitecto de software senior.
- **🚩 Detección de Lagunas Lógicas**: El sistema te avisará si tus metas son poco realistas (ej: un sistema complejo en 3 días sin presupuesto).
- **📄 Reportes Profesionales**: Genera y descarga un reporte en PDF con tu hoja de ruta personalizada.
- **✨ UI Premium**: Interfaz moderna, responsiva y con estados de carga animados.
- **🌙 Modo Oscuro Ready**: Estructura preparada para una experiencia visual superior.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React.js, Tailwind CSS, Framer Motion (animaciones), Lucide React (iconos).
- **Backend**: Python, FastAPI, Mangum (serverless wrapper).
- **IA**: OpenAI API (GPT-4o-mini).
- **Despliegue**: Netlify (Frontend + Netlify Functions para el backend).

---

## 💻 Instalación y Uso Local

### Requisitos Previos
- Node.js (v18+)
- Python (v3.9+)
- Una API Key de OpenAI

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/asesor-tecnologico.git
cd asesor-tecnologico
```

### 2. Configurar el Backend
```bash
cd api
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Crea un archivo `.env` dentro de la carpeta `api/` y añade tu clave:
```env
OPENAI_API_KEY=tu_clave_aqui
```
Inicia el servidor:
```bash
python main.py
```

### 3. Configurar el Frontend
En otra terminal (en la raíz del proyecto):
```bash
npm install
npm run dev
```

---

## 🌍 Despliegue en Netlify

Este proyecto está configurado para desplegarse en Netlify con un solo clic:

1. Conecta tu repositorio a Netlify.
2. Configura la variable de entorno `OPENAI_API_KEY` en el panel de Netlify.
3. El archivo `netlify.toml` se encargará de configurar las funciones y los redireccionamientos.

---

## 🤝 Contribuciones

¡Las contribuciones son lo que hacen a la comunidad de software un lugar increíble para aprender e inspirar!

1. Haz un **Fork** del proyecto.
2. Crea tu **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3. Haz un **Commit** de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Haz un **Push** a la rama (`git push origin feature/AmazingFeature`).
5. Abre un **Pull Request**.

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más información.

---

**Desarrollado con ❤️ por la comunidad para los alumnos de ingeniería.**
