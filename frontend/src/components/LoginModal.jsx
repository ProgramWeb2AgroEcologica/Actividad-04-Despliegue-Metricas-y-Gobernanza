import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  LogIn, 
  LogOut, 
  X, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { DEMO_ROLES } from '../services/apiClient';

export function LoginModal({ isOpen, onClose, currentUser, onLogin, onLogout, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor ingresa correo electrónico y contraseña.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const user = await onLogin(email.trim(), password);
      if (showToast) {
        showToast(
          `¡¡Bienvenido ${user?.nombre || email}! Token JWT emitido eéxitosamente.`, 
          'success', 
          'Autenticación JWT (200 OK)'
        );
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales inválidas (401 Unauthorized). Verifique correo y clave.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginDemo = async (demoKey) => {
    const demo = DEMO_ROLES[demoKey];
    if (!demo) return;
    setEmail(demo.email);
    setPassword(demo.password);
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await onLogin(demo.email, demo.password);
      if (showToast) {
        showToast(
          `Sesión iniciada como ${user?.nombre || demo.nombre} (${demo.badge}).`,
          'success',
          'RBAC Autorizado'
        );
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error en inicio de sesión rápido.');
    } finally {
      setLoading(false);
    }
  };

  const isGuest = !currentUser || currentUser.id === 'guest' || !currentUser.email;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in-50 duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        {/* Header con Gradiente Esmeralda */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 relative border-b border-emerald-800/40">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar ventana de login"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 id="login-modal-title" className="text-lg font-extrabold tracking-tight text-white">
                Control de Acceso (RBAC)
              </h2>
              <p className="text-xs text-emerald-200/80 font-medium">
                Autenticación segura con JWT & Supabase
              </p>
            </div>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Tarjeta de Sesión Activa */}
          {!isGuest && (
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Sesión Activa
                </span>
                <p className="font-extrabold text-slate-900 truncate">
                  {currentUser.nombre || currentUser.email}
                </p>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 text-[11px] mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 
                  <span>Rol: <strong className="capitalize">{currentUser.rol}</strong></span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  if (showToast) showToast('Sesión cerrada correctamente. Modo visitante activo.', 'info');
                  onClose();
                }}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Salir
              </button>
            </div>
          )}

          {/* Cuentas Demo de 1-Clic para Defensa en Vivo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Cuentas Demo (Cátedra):
              </span>
              <span className="text-[10px] text-slate-400">1 clic para ingresar</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {/* Demo Productor */}
              <button
                type="button"
                onClick={() => handleQuickLoginDemo('productor')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-950 text-left text-xs font-bold transition-all hover:scale-[1.02] shadow-2xs group cursor-pointer"
                title="Don Mario: Publica productos, edita stock y despacha pedidos"
              >
                <span className="text-xs block font-bold">👨‍🌾 Productor</span>
                <p className="text-[10px] text-amber-800 font-semibold truncate mt-0.5">Don Mario</p>
                <span className="text-[9px] text-amber-600 font-normal block truncate">productor@...</span>
              </button>

              {/* Demo Admin */}
              <button
                type="button"
                onClick={() => handleQuickLoginDemo('administrador')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-950 text-left text-xs font-bold transition-all hover:scale-[1.02] shadow-2xs group cursor-pointer"
                title="Admin: Acceso completo a auditoría, productos y gobernanza"
              >
                <span className="text-xs block font-bold">🛡️ Admin</span>
                <p className="text-[10px] text-purple-800 font-semibold truncate mt-0.5">Cátedra UPDS</p>
                <span className="text-[9px] text-purple-600 font-normal block truncate">admin@...</span>
              </button>

              {/* Demo Consumidor */}
              <button
                type="button"
                onClick={() => handleQuickLoginDemo('consumidor')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-950 text-left text-xs font-bold transition-all hover:scale-[1.02] shadow-2xs group cursor-pointer"
                title="Carlos Pérez: Explora catálogo y reserva canastas agroecológicas"
              >
                <span className="text-xs block font-bold">🛒 Cliente</span>
                <p className="text-[10px] text-emerald-800 font-semibold truncate mt-0.5">Carlos Pérez</p>
                <span className="text-[9px] text-emerald-600 font-normal block truncate">cliente@...</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="shrink-0 mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              o ingresa credenciales
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Formulario Manual de Inicio de Sesión */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in-50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. productor@ecoferia.bo"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Verificando firma JWT en Backend...' : 'Iniciar Sesión en Producción'}</span>
            </button>
          </form>

          {/* Pie informativo técnico */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400 leading-tight">
              🔒 Tokens JWT firmados con algoritmo HS256. Rúbrica Actividad 04 (UPDS).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
