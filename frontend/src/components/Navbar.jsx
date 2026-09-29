import React, { useState } from 'react';
import { 
  Sprout, 
  ShoppingBag, 
  Menu, 
  X, 
  Sparkles, 
  ClipboardList, 
  Search, 
  UserCheck, 
  Leaf, 
  ChevronDown, 
  ShieldCheck, 
  User, 
  Briefcase,
  Key
} from 'lucide-react';
import { DEMO_ROLES } from '../services/apiClient';

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  cartCount, 
  onOpenCart, 
  onStartTour,
  currentUser,
  onSwitchRole,
  onOpenLogin
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'catalog', label: 'Cat?logo Semanal', icon: Sprout },
    { id: 'checkout', label: 'Reservar Cosecha', icon: ClipboardList },
    { id: 'orders', label: 'Mis Pedidos', icon: Search },
    { id: 'producer', label: 'Panel Productor', icon: UserCheck },
    { id: 'sustainability', label: 'Sostenibilidad', icon: Leaf }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleSelectRole = async (roleKey) => {
    setRoleDropdownOpen(false);
    if (onSwitchRole) {
      await onSwitchRole(roleKey);
    }
  };

  const currentRoleConfig = DEMO_ROLES[currentUser?.rol] || DEMO_ROLES.consumidor;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
            onClick={() => handleNavClick('catalog')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white shadow-sm shadow-emerald-800/30">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-emerald-950 tracking-tight">EcoFeria</span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  Santa Cruz
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden xs:block">Cosecha directa ? Cero intermediarios</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200" aria-label="Navegaci?n principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-${item.id}`}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                    isActive
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-white/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: RBAC Role Selector + Tour Button + Cart Button + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Bot?n de Login Manual */}
            <button
              onClick={onOpenLogin}
              id="login-btn-trigger"
              className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-colors shadow-2xs"
              title="Iniciar sesi?n con correo y contrase?a"
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Login</span>
            </button>

            {/* RBAC Role Selector Dropdown (C?tedra Live Demo) */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                id="role-switcher-btn"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold transition-all shadow-xs ${currentRoleConfig.badgeColor}`}
                title="Cambiar rol de usuario para prueba de permisos (RBAC)"
              >
                <Key className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[110px] sm:max-w-none truncate">{currentRoleConfig.badge}</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">Simulador de Roles (RBAC)</p>
                    <p className="text-[11px] text-slate-500">Prueba los permisos de acceso en vivo</p>
                  </div>

                  <div className="py-1 space-y-1">
                    {Object.entries(DEMO_ROLES).map(([key, role]) => {
                      const isSelected = currentUser?.rol === role.rol;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectRole(key)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                            isSelected ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                            role.rol === 'administrador' ? 'bg-purple-600' : role.rol === 'productor' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{role.badge}</span>
                              {isSelected && <span className="text-[10px] font-extrabold text-emerald-700">ACTIVO</span>}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{role.descripcion}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{role.email}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        if (onOpenLogin) onOpenLogin();
                      }}
                      className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Iniciar Sesi?n Manual / Credenciales</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Driver.js Onboarding button */}
            <button
              onClick={onStartTour}
              id="tour-guide-trigger-btn"
              className="hidden sm:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors min-h-[40px]"
              title="Iniciar tour guiado interactivo"
              aria-label="Ver tour guiado interactivo de EcoFeria"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Tour Gu?a</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              id="tour-cart-btn"
              className="relative flex items-center justify-center p-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs transition-all min-h-[40px] min-w-[40px]"
              aria-label={`Ver canasta, ${cartCount} productos`}
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Cerrar men?' : 'Abrir men? de navegaci?n'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-3 border-t border-slate-200 space-y-1 animate-in slide-in-from-top-2 duration-150" aria-label="Men? m?vil">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
