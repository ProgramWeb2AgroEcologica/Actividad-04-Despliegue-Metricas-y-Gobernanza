import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  LogIn, 
  LogOut, 
  X, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  QrCode,
  Smartphone,
  Fingerprint,
  RefreshCw,
  UserPlus,
  ExternalLink,
  Copy
} from 'lucide-react';
import { ApiClient, DEMO_ROLES } from '../services/apiClient';
import QRCode from 'qrcode';

export function LoginModal({ isOpen, onClose, currentUser, onLogin, onLogout, onUserChange, showToast }) {
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'registro' | 'qr'
  
  // Estado para Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estado para Registro
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRol, setRegRol] = useState('consumidor'); // 'consumidor' | 'productor'
  const [regLoading, setRegLoading] = useState(false);

  // Estado para Código QR
  const [qrSessionId, setQrSessionId] = useState('');
  const [qrStatus, setQrStatus] = useState('esperando'); // 'esperando' | 'autorizado' | 'expirado'
  const [qrCountdown, setQrCountdown] = useState(120);
  const [qrSimulatingBio, setQrSimulatingBio] = useState(false);
  const [qrImageDataUrl, setQrImageDataUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [qrCopied, setQrCopied] = useState(false);

  // Iniciar sesión QR y configurar listener en tiempo real (Broadcast + Storage + Polling)
  useEffect(() => {
    let timer = null;
    let pollInterval = null;
    let bc = null;

    if (isOpen && authTab === 'qr') {
      const fallbackId = 'qr-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
      setQrSessionId(fallbackId);
      setQrStatus('esperando');
      setQrCountdown(120);
      setQrImageDataUrl('');

      ApiClient.iniciarQrSession(fallbackId).then((initData) => {
        const activeId = initData?.session_id || fallbackId;
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const targetBase = isLocal ? 'https://actividad-04-despliegue-metricas-y-gobernanza.pages.dev' : window.location.origin;
        const fullUrl = targetBase + '/?qr_auth=' + activeId;

        setQrSessionId(activeId);
        setQrUrl(fullUrl);

        QRCode.toDataURL(fullUrl, {
          width: 260,
          margin: 1,
          color: { dark: '#064e3b', light: '#ffffff' }
        }).then((url) => {
          setQrImageDataUrl(url);
        }).catch(() => {
          setQrImageDataUrl('https://api.qrserver.com/v1/create-qr-code/?size=260x260&color=064e3b&data=' + encodeURIComponent(fullUrl));
        });
      }).catch(() => {});
      const sessionId = fallbackId;

      // 2. Escuchar evento de BroadcastChannel (Cross-tab)
      if (window.BroadcastChannel) {
        try {
          bc = new BroadcastChannel('ecoferia_qr_channel');
          bc.onmessage = (event) => {
            if (event.data && event.data.session_id === sessionId && event.data.estado === 'autorizado') {
              handleQrSuccess(event.data.user, event.data.tokens ? event.data.tokens.access_token : null);
            }
          };
        } catch (_) {}
      }

      // 3. Escuchar evento de localStorage (Cross-tab en el mismo navegador)
      const handleStorageEvent = (e) => {
        if (e.key === 'ecoferia_qr_approved_' + sessionId && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            handleQrSuccess(data.user, data.tokens ? data.tokens.access_token : null);
          } catch (_) {}
        }
      };
      window.addEventListener('storage', handleStorageEvent);

      // 4. Polling periódico al backend
      pollInterval = setInterval(async () => {
        try {
          const res = await ApiClient.consultarQrEstado(sessionId);
          if (res && res.estado === 'autorizado' && res.user) {
            handleQrSuccess(res.user, res.tokens ? res.tokens.access_token : null);
          }
        } catch (_) {}
      }, 1500);

      // 5. Contador regresivo
      timer = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            setQrStatus('expirado');
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timer) clearInterval(timer);
        if (pollInterval) clearInterval(pollInterval);
        if (bc) bc.close();
        window.removeEventListener('storage', handleStorageEvent);
      };
    }
  }, [isOpen, authTab]);

  const handleQrSuccess = (user, token) => {
    setQrStatus('autorizado');
    const validUser = user || DEMO_ROLES.productor;
    const validToken = token || (validUser && validUser.rol ? ('jwt-qr-' + validUser.rol + '-' + Date.now()) : 'jwt-qr-session');

    // Persistir sesion de inmediato en localStorage para evitar reseteo al recargar
    ApiClient.setSession(validUser, validToken);

    if (onUserChange) {
      onUserChange(validUser);
    }
    if (showToast) {
      showToast(
        '¡Dispositivo vinculado con éxito! Bienvenido ' + (validUser.nombre || validUser.email) + '.',
        'success',
        'Acceso QR Passwordless'
      );
    }
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  // Manejo de Login Manual
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor ingresa correo electrónico y contraseña.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const user = await onLogin(email.trim(), password);
      if (onUserChange) onUserChange(user);
      if (showToast) {
        showToast(
          `¡Bienvenido ${user?.nombre || email}! Sesión JWT iniciada.`, 
          'success', 
          'Autenticación Exitosa'
        );
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales incorrectas (401 Unauthorized). Verifique correo o clave.');
    } finally {
      setLoading(false);
    }
  };

  // Login Instantáneo con Cuentas Demo (0 ms de latencia)
  const handleQuickLoginDemo = (demoKey) => {
    const demo = DEMO_ROLES[demoKey];
    if (!demo) return;
    setErrorMsg('');
    try {
      const { user } = ApiClient.switchRole(demoKey);
      if (onUserChange) onUserChange(user);
      if (showToast) {
        showToast(
          `Sesión activa como ${user.nombre} (${demo.badge}).`,
          'success',
          'RBAC Autorizado'
        );
      }
      onClose();
    } catch (_) {
      onClose();
    }
  };

  // Manejo de Registro de Usuario
  const handleSubmitRegistro = async (e) => {
    e.preventDefault();
    if (!regNombre.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Por favor completa todos los campos del registro.');
      return;
    }

    setRegLoading(true);
    setErrorMsg('');
    try {
      const { user } = await ApiClient.registro(regNombre, regEmail, regPassword, regRol);
      if (onUserChange) onUserChange(user);
      if (showToast) {
        showToast(
          `¡Cuenta creada con éxito! Bienvenido a EcoFeria, ${user.nombre}.`,
          'success',
          'Usuario Registrado (201 Created)'
        );
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo completar el registro.');
    } finally {
      setRegLoading(false);
    }
  };

  // Simulación de Huella / Sensor Biométrico (Desafío Cátedra)
  const handleSimulateQrBiometric = async (rol = 'productor') => {
    setQrSimulatingBio(true);
    setErrorMsg('');
    try {
      await new Promise(r => setTimeout(r, 800));
      const res = await ApiClient.autorizarQrSession(qrSessionId, DEMO_ROLES[rol].email, rol);
      handleQrSuccess(res.user, res.tokens ? res.tokens.access_token : null);
    } catch (_) {
      setErrorMsg('Error en la verificación biométrica.');
    } finally {
      setQrSimulatingBio(false);
    }
  };

  const isGuest = !currentUser || currentUser.id === 'guest' || !currentUser.email;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in-50 duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        {/* Header con Pestañas */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 relative border-b border-emerald-800/40">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              {authTab === 'login' && <Key className="w-5 h-5" />}
              {authTab === 'registro' && <UserPlus className="w-5 h-5" />}
              {authTab === 'qr' && <QrCode className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="login-modal-title" className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>{authTab === 'login' ? 'Iniciar Sesión' : authTab === 'registro' ? 'Crear Nueva Cuenta' : 'Acceso QR Móvil'}</span>
                <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 uppercase">
                  RBAC
                </span>
              </h2>
              <p className="text-xs text-emerald-200/80 font-medium">
                EcoFeria Santa Cruz • Plataforma Agroecológica
              </p>
            </div>
          </div>

          {/* Selector de Pestañas: Login | Registro | Código QR */}
          <div className="flex gap-1.5 mt-4 pt-3 border-t border-emerald-800/60">
            <button
              type="button"
              onClick={() => { setAuthTab('login'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                authTab === 'login' 
                  ? 'bg-white text-emerald-950 shadow-sm' 
                  : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-800/60'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthTab('registro'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                authTab === 'registro' 
                  ? 'bg-white text-emerald-950 shadow-sm' 
                  : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-800/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registro</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthTab('qr'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer relative ${
                authTab === 'qr' 
                  ? 'bg-amber-400 text-amber-950 shadow-sm' 
                  : 'bg-emerald-950/60 text-amber-300 hover:bg-emerald-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>QR Móvil</span>
            </button>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Tarjeta de Sesión Activa */}
          {!isGuest && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                  Sesión Activa
                </span>
                <p className="font-extrabold text-slate-900 truncate">
                  {currentUser.nombre || currentUser.email}
                </p>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 text-[11px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" /> 
                  <span>Rol: <strong className="capitalize">{currentUser.rol}</strong></span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  if (showToast) showToast('Sesión cerrada. Modo visitante.', 'info');
                  onClose();
                }}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Salir
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA 1: INICIAR SESIÓN                                         */}
          {/* ================================================================= */}
          {authTab === 'login' && (
            <>
              {/* Cuentas Demo de 1-Clic (0 ms de latencia) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Cuentas Demo (1 clic):
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Respuesta instantánea</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLoginDemo('productor')}
                    className="p-2 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-950 text-left text-xs font-bold transition-all hover:scale-[1.02] shadow-2xs group cursor-pointer"
                  >
                    <span className="text-[11px] block font-bold truncate">👨‍🌾 Productor</span>
                    <p className="text-[10px] text-amber-800 font-semibold truncate">Don Mario</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLoginDemo('administrador')}
                    className="p-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-950 text-left text-xs font-bold transition-all hover:scale-[1.02] shadow-2xs group cursor-pointer"
                  >
                    <span className="text-[11px] block font-bold truncate">🛡️ Admin</span>
                    <p className="text-[10px] text-purple-800 font-semibold truncate">Cátedra</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLoginDemo('consumidor')}
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-950 text-left text-xs font-bold transition-all hover:scale-[1.02] shadow-2xs group cursor-pointer"
                  >
                    <span className="text-[11px] block font-bold truncate">🛒 Cliente</span>
                    <p className="text-[10px] text-emerald-800 font-semibold truncate">Carlos Pérez</p>
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink-0 mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  o credenciales manuales
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Formulario Manual de Login */}
              <form onSubmit={handleSubmitLogin} className="space-y-3">
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
                      placeholder="productor@ecoferia.bo"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
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
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
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
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
                </button>
              </form>
            </>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA 2: REGISTRO DE NUEVO USUARIO                               */}
          {/* ================================================================= */}
          {authTab === 'registro' && (
            <form onSubmit={handleSubmitRegistro} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  placeholder="ej. Doña Teodora Agricultora"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="teodora@ecoferia.bo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Contraseña Segura
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Tipo de Cuenta (Rol RBAC)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRol('consumidor')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      regRol === 'consumidor'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🛒 Consumidor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRol('productor')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      regRol === 'productor'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-extrabold ring-1 ring-amber-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>👨‍🌾 Productor</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{regLoading ? 'Registrando...' : 'Crear Cuenta y Entrar'}</span>
              </button>
            </form>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA 3: CÓDIGO QR MÓVIL (REAL & SIMULADO)                      */}
          {/* ================================================================= */}
          {authTab === 'qr' && (
            <div className="space-y-3.5 text-center">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 text-left">
                <p className="text-[11px] text-amber-900 leading-snug">
                  <strong>⭐ Desafío Especial de Cátedra:</strong> Escanea este código con la cámara de tu celular para autorizar el acceso en la computadora sin contraseñas (análogo al sistema biométrico de la universidad).
                </p>
              </div>

              {/* Contenedor del Código QR */}
              <div className="relative inline-block mx-auto p-3.5 bg-white rounded-3xl border-2 border-emerald-800/30 shadow-md">
                <div className="relative w-44 h-44 mx-auto flex items-center justify-center bg-white rounded-2xl p-1.5 overflow-hidden border border-emerald-100 shadow-inner">{qrImageDataUrl ? (<img src={qrImageDataUrl} alt="QR" className="w-full h-full object-contain rounded-xl" />) : (<div className="flex flex-col items-center justify-center text-slate-500 text-xs"><RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mb-2" /><span>Generando QR real...</span></div>)}{qrStatus === "autorizado" && (<div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white rounded-xl"><CheckCircle2 className="w-12 h-12 text-emerald-400 mb-1" /><span className="text-xs font-extrabold">¡Vinculado con éxito!</span></div>)}</div><div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono px-1"><span className="truncate max-w-[130px]" title={qrSessionId}>{qrSessionId || "sesion-activa"}</span><span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">⏱️ {qrCountdown}s</span></div></div>

                            {qrStatus === 'esperando' && (
                <div className="space-y-2">
                  <p className="text-xs font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span>Esperando escaneo con la cámara del teléfono...</span>
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-0.5"><button type="button" onClick={() => { if (qrUrl) { navigator.clipboard.writeText(qrUrl); setQrCopied(true); setTimeout(() => setQrCopied(false), 2000); if (showToast) showToast("Enlace copiado", "success"); } }} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl cursor-pointer"><Copy className="w-3.5 h-3.5" /><span>{qrCopied ? "¡Enlace Copiado!" : "Copiar Enlace"}</span></button><button type="button" onClick={() => window.open(qrUrl || (window.location.origin + "/?qr_auth=" + qrSessionId), "_blank")} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl cursor-pointer shadow-2xs"><ExternalLink className="w-3.5 h-3.5 text-emerald-700" /><span>Simulador Pestaña</span></button></div>
                </div>
              )}

              {qrStatus === 'autorizado' && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>¡Dispositivo autorizado! Desbloqueando...</span>
                </div>
              )}

              {/* Botón para Simular Huella en esta misma pantalla */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  O prueba la verificación biométrica con 1 clic:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={qrSimulatingBio || qrStatus === 'autorizado'}
                    onClick={() => handleSimulateQrBiometric('productor')}
                    className="p-2 rounded-xl border border-amber-300 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Fingerprint className="w-4 h-4 text-slate-950" />
                    <span>{qrSimulatingBio ? 'Validando...' : '🖐️ Huella Productor'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={qrSimulatingBio || qrStatus === 'autorizado'}
                    onClick={() => handleSimulateQrBiometric('administrador')}
                    className="p-2 rounded-xl border border-purple-300 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Fingerprint className="w-4 h-4 text-purple-200" />
                    <span>{qrSimulatingBio ? 'Validando...' : '🖐️ Huella Admin'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
