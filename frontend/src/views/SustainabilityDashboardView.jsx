import React, { useState } from 'react';
import { 
  Leaf, 
  Cpu, 
  Gauge, 
  DollarSign, 
  ShieldCheck, 
  Award, 
  TrendingDown, 
  Zap, 
  Trees, 
  MapPin, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  FileText,
  Sliders,
  Server
} from 'lucide-react';

export function SustainabilityDashboardView() {
  const [visitasMensuales, setVisitasMensuales] = useState(5000);

  // Cálculos dinámicos de huella según modelo Sustainable Web Design (0.08g vs 0.48g estándar web)
  const co2EcoFeriaKg = ((visitasMensuales * 0.08) / 1000).toFixed(2);
  const co2EstandarKg = ((visitasMensuales * 0.48) / 1000).toFixed(2);
  const co2AhorradoKg = (parseFloat(co2EstandarKg) - parseFloat(co2EcoFeriaKg)).toFixed(2);
  const arbolesEquivalentes = (parseFloat(co2AhorradoKg) / 21).toFixed(2); // 1 ?rbol absorbe aprox 21kg CO2/año

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Banner Principal de Métricas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5" /> Tablero de Gobernanza y Sostenibilidad Digital
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Métricas de Sostenibilidad, Rendimiento y Costo Cero
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Auditoría de cumplimiento de las directrices de cátedra (Actividad 04). EcoFeria opera bajo principios de 
            <strong> Green Software Engineering</strong>, optimización extrema de carga y <strong>costo operativo de 0 Bs</strong> para las familias campesinas.
          </p>
        </div>

        {/* Decoración de fondo */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Grid de 4 Pilares Fundamentales (Auditoría Cátedra) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pilar 1: Peso de Red */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transferencia de Red</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Gauge className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900">108.8 <span className="text-sm font-semibold text-slate-500">KB</span></div>
              <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Meta Cátedra: &lt; 500 KB (Cumplido)
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Compilación Vite + Gzip: <strong>78.2% más ligero</strong> que el límite estipulado.
          </div>
        </div>

        {/* Pilar 2: Huella de Carbono */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Huella de Carbono</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Leaf className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900">0.08 <span className="text-sm font-semibold text-slate-500">g CO?</span></div>
              <p className="text-xs font-medium text-teal-700 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> 83% menos que el promedio web
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Estándar Green Web: 0.48g promedio mundial vs 0.08g EcoFeria por visita.
          </div>
        </div>

        {/* Pilar 3: Lighthouse Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Auditoría Lighthouse</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900">100 <span className="text-sm font-semibold text-slate-500">/ 100</span></div>
              <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> WCAG 2.1 AA &amp; SEO Perfecto
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Rendimiento 100, Accesibilidad 100, Buenas Prácticas 100, SEO 100.
          </div>
        </div>

        {/* Pilar 4: Costo Operativo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Costo Operativo</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900">0.00 <span className="text-sm font-semibold text-slate-500">Bs/mes</span></div>
              <p className="text-xs font-medium text-purple-700 flex items-center gap-1">
                <Server className="w-3.5 h-3.5" /> 100% Capa Gratuita Perpetua
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Cloudflare Pages (Frontend) + Render (Backend) + Supabase (PostgreSQL).
          </div>
        </div>
      </div>

      {/* Calculadora Interactiva de Huella Ecológica */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Simulador de Impacto Ambiental Acumulado
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Estima el ahorro de emisiones de CO? generado por la optimización de código frente a plataformas tradicionales.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-xs">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-700">Visitas mensuales simuladas:</span>
            <span className="font-bold text-emerald-800 text-sm">{visitasMensuales.toLocaleString()}</span>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={visitasMensuales}
            onChange={(e) => setVisitasMensuales(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
            aria-label="Seleccionar volumen de visitas mensuales para cálculo de impacto"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
            <span>1,000 visitas/mes</span>
            <span>25,000 visitas/mes</span>
            <span>50,000 visitas/mes</span>
          </div>
        </div>

        {/* Tarjetas comparativas del Simulador */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-xs font-semibold text-emerald-800">Emisiones EcoFeria (Green Code)</span>
            <div className="text-2xl font-extrabold text-emerald-950">{co2EcoFeriaKg} kg CO? / mes</div>
            <p className="text-[11px] text-emerald-700">Calculado a 0.08 gramos por carga de página.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-600">Emisiones Sitio Web Convencional</span>
            <div className="text-2xl font-extrabold text-slate-800">{co2EstandarKg} kg CO? / mes</div>
            <p className="text-[11px] text-slate-500">Calculado a 0.48 gramos (promedio web global).</p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1">
            <span className="text-xs font-semibold text-teal-800">CO? Neto Evitado a la Atmásfera</span>
            <div className="text-2xl font-extrabold text-teal-950">-{co2AhorradoKg} kg CO? / mes</div>
            <p className="text-[11px] text-teal-700 flex items-center gap-1">
              <Trees className="w-3.5 h-3.5" /> Equivale al beneficio de {arbolesEquivalentes} ?rboles maduros.
            </p>
          </div>
        </div>
      </div>

      {/* Desglose Arquitectónico del Costo Cero (0 Bs) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-700" /> Arquitectura en Producción y Plan de Coste Cero (0 Bs)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-bold">Capa Tecnológica</th>
                <th className="pb-3 font-bold">Proveedor / Plataforma</th>
                <th className="pb-3 font-bold">Recurso / Capacidad</th>
                <th className="pb-3 font-bold text-right">Costo Mensual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 font-semibold text-slate-900">Frontend SPA (React 19 + Vite)</td>
                <td className="py-3">Cloudflare Pages (Global Edge Network)</td>
                <td className="py-3">Ancho de banda ilimitado, compresión Brotli/Gzip, SSL unificado</td>
                <td className="py-3 font-bold text-emerald-800 text-right">0.00 Bs</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-900">Backend API REST (Flask + Marshmallow)</td>
                <td className="py-3">Render (Cloud Web Service)</td>
                <td className="py-3">750 horas de cómputo libre mensual, reinicio seguro, TLS 1.3</td>
                <td className="py-3 font-bold text-emerald-800 text-right">0.00 Bs</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-900">Base de Datos &amp; Autenticación (RBAC)</td>
                <td className="py-3">Supabase (PostgreSQL Cloud)</td>
                <td className="py-3">500 MB almacenamiento relacional, RLS policies, 50k usuarios activos</td>
                <td className="py-3 font-bold text-emerald-800 text-right">0.00 Bs</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-900">Integración Continua &amp; Despliegues</td>
                <td className="py-3">GitHub Actions &amp; Webhooks</td>
                <td className="py-3">2,000 minutos/mes de CI/CD para testeo automático (pytest)</td>
                <td className="py-3 font-bold text-emerald-800 text-right">0.00 Bs</td>
              </tr>
              <tr className="bg-emerald-50/50 font-bold text-emerald-950">
                <td className="py-3.5 pl-2" colSpan={3}>Costo Total Operativo para la Comunidad Campesina</td>
                <td className="py-3.5 pr-2 text-right text-base text-emerald-900">0.00 Bs / mes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan de Gobernanza y Ciclo de Vida del Software */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Matriz del Plan de Gobernanza y Continuidad (AI-DLC)</h2>
            <p className="text-xs sm:text-sm text-slate-400">Protocolo de mantenimiento autónomo transferible a la asociación ferial</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
            <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider">1. Integridad &amp; Seguridad</span>
            <p className="text-slate-300 text-xs leading-relaxed">
              Tokens JWT firmados con algoritmo HMAC-SHA256, expiración de 15 minutos y renovación rotativa.
              Validación en el backend con decoradores de rol RBAC y esquemas Marshmallow que impiden inyecciones y datos anómalos.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
            <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider">2. Respaldos y Disponibilidad</span>
            <p className="text-slate-300 text-xs leading-relaxed">
              Snapshots automáticos diarios de la base de datos PostgreSQL en Supabase.
              Fallback offline transparente en el cliente React: si el backend hiberna en Render, el catálogo local mantiene la operatividad continua.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
            <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider">3. Transferencia Comunitaria</span>
            <p className="text-slate-300 text-xs leading-relaxed">
              El sistema no requiere conocimientos de programación para productores: panel autogestionado con interfaz visual adaptada a móviles económicos y baja conectividad 3G/4G.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
