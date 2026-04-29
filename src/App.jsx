import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFReport from './PDFReport';
import { 
  Calculator, Code2, Store, Server, Smartphone, Globe, 
  Clock, Banknote, GraduationCap, AlertTriangle, CheckCircle2, 
  Cpu, Database, Cloud, Sparkles, Laptop, Rocket, ArrowRight, ArrowLeft,
  Download, Copy, Check
} from 'lucide-react';

const PROJECT_TYPES = [
  { id: 'ecommerce', label: 'E-commerce / Tienda', icon: <Store className="w-6 h-6" />, complexity: 'medium', desc: 'Tiendas online y catálogos' },
  { id: 'pos', label: 'Punto de Venta (POS)', icon: <Calculator className="w-6 h-6" />, complexity: 'high', desc: 'Sistemas de inventario y caja' },
  { id: 'landing', label: 'Landing Page / Blog', icon: <Globe className="w-6 h-6" />, complexity: 'low', desc: 'Sitios informativos' },
  { id: 'saas', label: 'Plataforma SaaS', icon: <Server className="w-6 h-6" />, complexity: 'high', desc: 'Software como servicio' },
  { id: 'mobile', label: 'App Móvil', icon: <Smartphone className="w-6 h-6" />, complexity: 'high', desc: 'Aplicaciones nativas/híbridas' },
  { id: 'ai', label: 'IA / Datos', icon: <Sparkles className="w-6 h-6" />, complexity: 'high', desc: 'Modelos y análisis' }
];

const BUDGETS = [
  { id: 'low', label: 'Casi nulo ($0 - $50)', icon: <Banknote className="w-6 h-6" />, desc: 'Solo para lo básico' },
  { id: 'medium', label: 'Moderado ($50 - $200)', icon: <Banknote className="w-6 h-6" />, desc: 'Para servicios cloud/SaaS' },
  { id: 'high', label: 'Alto (+$500)', icon: <Banknote className="w-6 h-6" />, desc: 'Desarrollo sin límites cloud' }
];

const TIMELINES = [
  { id: 'days', label: 'Urgentísimo (Días)', icon: <Clock className="w-6 h-6" />, desc: 'Lanzamiento rápido' },
  { id: 'weeks', label: 'Un par de semanas', icon: <Clock className="w-6 h-6" />, desc: 'Desarrollo estándar' },
  { id: 'months', label: 'Varios meses', icon: <Rocket className="w-6 h-6" />, desc: 'Arquitectura sólida' }
];

const SKILL_LEVELS = [
  { id: 'beginner', label: 'Principiante', icon: <GraduationCap className="w-6 h-6" />, desc: 'Bases de HTML/CSS/JS' },
  { id: 'intermediate', label: 'Intermedio', icon: <Code2 className="w-6 h-6" />, desc: 'Frameworks (React, Node)' },
  { id: 'advanced', label: 'Avanzado', icon: <Cpu className="w-6 h-6" />, desc: 'Arquitecturas completas' }
];

export default function App() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem('asesor-answers');
    return saved ? JSON.parse(saved) : {
      type: null,
      budget: null,
      timeline: null,
      skill: null
    };
  });
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem('asesor-result');
    return saved ? JSON.parse(saved) : null;
  });

  const resultRef = useRef();

  // Save to LocalStorage whenever answers or result change
  useEffect(() => {
    localStorage.setItem('asesor-answers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (result) {
      localStorage.setItem('asesor-result', JSON.stringify(result));
    } else {
      localStorage.removeItem('asesor-result');
    }
  }, [result]);

  // Also save the step if they are in the middle of the flow
  useEffect(() => {
    if (result) {
      localStorage.setItem('asesor-step', 5);
    } else {
      localStorage.setItem('asesor-step', step);
    }
  }, [step, result]);

  // Load step on mount
  useEffect(() => {
    const savedStep = localStorage.getItem('asesor-step');
    if (savedStep) {
      setStep(parseInt(savedStep, 10));
    }
  }, []);

  const handleSelect = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    setDirection(1);
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  const handleCopy = () => {
    if (!result) return;
    
    const textToCopy = `
ASESOR DE TECNOLOGÍA BY CHOKE
=======================================
Enfoque: ${result.approachTitle}
${result.approach}

Stack Sugerido:
- Frontend: ${result.frontend}
- Backend: ${result.backend}
- Base de Datos: ${result.database}
- Hosting: ${result.hosting}

Costos Estimados: ${result.monthlyCost}

${result.roadmap?.length ? `Hoja de Ruta:\n${result.roadmap.map((s, i) => `${i+1}. ${s}`).join('\n')}` : ''}
    `.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecommendation = async () => {
    setDirection(1);
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const rec = await response.json();
      setResult(rec);
      setStep(5);
    } catch (error) {
      console.error("Error al consultar la API:", error);
      alert("Hubo un error al conectar con la Inteligencia Artificial (Backend). Asegúrate de que el servidor FastAPI esté corriendo en el puerto 8000.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetFlow = () => {
    setDirection(-1);
    setStep(1);
    setAnswers({ type: null, budget: null, timeline: null, skill: null });
    setResult(null);
    localStorage.removeItem('asesor-answers');
    localStorage.removeItem('asesor-result');
    localStorage.removeItem('asesor-step');
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <SelectionGrid 
            title="1. ¿Qué tipo de sistema quieren construir?" 
            options={PROJECT_TYPES} 
            selected={answers.type} 
            onSelect={(val) => handleSelect('type', val)} 
          />
        );
      case 2:
        return (
          <SelectionGrid 
            title="2. ¿Cuál es el presupuesto para infraestructura y herramientas?" 
            options={BUDGETS} 
            selected={answers.budget} 
            onSelect={(val) => handleSelect('budget', val)} 
          />
        );
      case 3:
        return (
          <SelectionGrid 
            title="3. ¿En cuánto tiempo necesitan lanzarlo al público?" 
            options={TIMELINES} 
            selected={answers.timeline} 
            onSelect={(val) => handleSelect('timeline', val)} 
          />
        );
      case 4:
        return (
          <SelectionGrid 
            title="4. Nivel de conocimiento técnico del equipo" 
            options={SKILL_LEVELS} 
            selected={answers.skill} 
            onSelect={(val) => handleSelect('skill', val)} 
          />
        );
      case 5:
        return renderResult();
      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="space-y-6">
        
        <div ref={resultRef} className="space-y-6 bg-white p-2">
          
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Diagnóstico del Proyecto</h2>
          
          {result.logicalGapWarning && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start space-x-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 w-6 h-6 mt-1" />
              <div>
                <h3 className="text-red-800 font-bold">¡Laguna Lógica Detectada!</h3>
                <p className="text-red-700 mt-1">{result.logicalGapWarning}</p>
              </div>
            </div>
          )}

          <div className={`p-5 rounded-lg border ${result.approachTitle.includes('PVM') ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 className={`w-6 h-6 ${result.approachTitle.includes('PVM') ? 'text-blue-600' : 'text-emerald-600'}`} />
              <h3 className="text-xl font-bold text-gray-900">Enfoque: {result.approachTitle}</h3>
            </div>
            <p className="text-gray-700 ml-8">{result.approach}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center"><Code2 className="w-5 h-5 mr-2" /> Stack Tecnológico Sugerido</h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <TechItem icon={<Laptop />} title="Frontend / UI" desc={result.frontend} />
              <TechItem icon={<Server />} title="Backend / Lógica" desc={result.backend} />
              <TechItem icon={<Database />} title="Base de Datos" desc={result.database} />
              <TechItem icon={<Cloud />} title="Hosting / Infraestructura" desc={result.hosting} />
            </div>
          </div>

          {result.roadmap && result.roadmap.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 flex items-center"><Rocket className="w-5 h-5 mr-2" /> Hoja de Ruta (Primeros Pasos)</h3>
              </div>
              <div className="p-5">
                <ol className="list-decimal pl-5 space-y-2 text-gray-700 font-medium">
                  {result.roadmap.map((step, idx) => (
                    <li key={idx} className="pl-2">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-yellow-800 flex items-center"><Banknote className="w-5 h-5 mr-2" /> Costos Estimados (Mantenimiento)</h3>
              <p className="text-yellow-700 text-sm mt-1">Costos de servidores, dominios o licencias SaaS.</p>
            </div>
            <div className="text-xl font-black text-yellow-900 bg-yellow-100 px-4 py-2 rounded-lg text-center min-w-[120px]">
              {result.monthlyCost}
            </div>
          </div>

          {result.profeAdvice && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
              <h3 className="font-bold text-indigo-800 flex items-center mb-2"><GraduationCap className="w-5 h-5 mr-2" /> Nota del Profesor</h3>
              <p className="text-indigo-700 italic">{result.profeAdvice}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
          <PDFDownloadLink
            document={<PDFReport result={result} />}
            fileName="Asesor_de_Tecnologia_by_Choke.pdf"
            className="flex-1"
          >
            {({ loading }) => (
              <button 
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
              >
                <Download className={`w-5 h-5 ${loading ? 'animate-bounce' : ''}`} /> 
                {loading ? 'Generando Documento...' : 'Descargar Reporte (PDF)'}
              </button>
            )}
          </PDFDownloadLink>
          
          <button 
            onClick={handleCopy}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${isCopied ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          >
            {isCopied ? <><Check className="w-5 h-5" /> Copiado</> : <><Copy className="w-5 h-5" /> Copiar Texto</>}
          </button>
        </div>

        <button 
          onClick={resetFlow}
          className="w-full mt-4 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Evaluar otro proyecto
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 overflow-hidden">
      <AnimatePresence>
        {isGenerating && <LoadingOverlay />}
      </AnimatePresence>

      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-white rounded-2xl mb-4 shadow-xl border border-gray-100 overflow-hidden w-24 h-24">
            <img 
              src="/thumbs-up-nice.gif" 
              alt="Nice!" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Asesor de Arquitectura de Software</h1>
          <p className="mt-2 text-lg text-gray-600">
            Descubre qué tecnologías usar (y cuánto costará) para tu próximo proyecto integrador.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          
          {/* Progress Bar */}
          {step < 5 && (
            <div className="mb-8">
              <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
                <span>Paso {step} de 4</span>
                <span>{Math.round((step / 4) * 100)}% Completado</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Content with Framer Motion */}
          <div className="min-h-[350px] relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
                className="w-full absolute top-0 left-0"
                style={{ position: step === 5 ? 'relative' : 'absolute' }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Spacer to push controls down since absolute positioning collapses parent height for steps 1-4 */}
          {step < 5 && <div className="h-[350px] sm:h-[280px]"></div>}

          {/* Footer Controls */}
          {step < 5 && (
            <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
              <button 
                onClick={prevStep}
                disabled={step === 1}
                className={`px-6 py-2.5 rounded-lg font-medium transition flex items-center ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
              </button>
              
              {step < 4 ? (
                <button 
                  onClick={nextStep}
                  disabled={!Object.values(answers)[step - 1]}
                  className={`px-6 py-2.5 rounded-lg font-medium transition flex items-center ${!Object.values(answers)[step - 1] ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
                >
                  Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button 
                  onClick={generateRecommendation}
                  disabled={!answers.skill || isGenerating}
                  className={`px-8 py-2.5 rounded-lg font-bold transition flex items-center ${(!answers.skill || isGenerating) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'}`}
                >
                  {isGenerating ? 'Consultando IA...' : 'Generar Diagnóstico'} 
                  {!isGenerating && <CheckCircle2 className="w-5 h-5 ml-2" />}
                </button>
              )}
            </div>
          )}
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-8">
          Diseñado para ayudar a los alumnos a evitar "lagunas lógicas" en el diseño de sistemas.
        </p>
      </div>
    </div>
  );
}

// --- Helper Components ---

function SelectionGrid({ title, options, selected, onSelect }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((opt) => (
          <div 
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`cursor-pointer border-2 rounded-xl p-5 transition-all duration-200 flex flex-col items-start ${
              selected === opt.id 
                ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className={`p-3 rounded-lg mb-3 ${selected === opt.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {opt.icon}
            </div>
            <h3 className={`font-semibold ${selected === opt.id ? 'text-blue-900' : 'text-gray-800'}`}>
              {opt.label}
            </h3>
            {opt.desc && <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TechItem({ icon, title, desc }) {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
      <div className="text-blue-500 mt-1">{icon}</div>
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h4>
        <p className="text-gray-900 font-medium mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function LoadingOverlay() {
  const [textIndex, setTextIndex] = useState(0);
  const loadingTexts = [
    "Consultando al Profe Choke...",
    "Analizando arquitectura sugerida...",
    "Buscando lagunas lógicas...",
    "Calculando costos de infraestructura...",
    "Generando hoja de ruta personalizada..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % loadingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md"
    >
      <div className="relative">
        <lord-icon
            src="https://cdn.lordicon.com/enzmyuau.json"
            trigger="loop"
            state="loop-cycle"
            colors="primary:#2563eb,secondary:#60a5fa"
            style={{ width: '120px', height: '120px' }}>
        </lord-icon>
      </div>
      <motion.p 
        key={textIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-6 text-xl font-bold text-gray-800 text-center"
      >
        {loadingTexts[textIndex]}
      </motion.p>
      <p className="mt-2 text-gray-500 animate-pulse">Esto tomará solo unos segundos...</p>
    </motion.div>
  );
}
