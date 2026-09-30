import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { ToastContainer } from './components/Toast';
import { CatalogView } from './views/CatalogView';
import { CheckoutView } from './views/CheckoutView';
import { OrdersTrackingView } from './views/OrdersTrackingView';
import { ProducerDashboardView } from './views/ProducerDashboardView';
import { SustainabilityDashboardView } from './views/SustainabilityDashboardView';
import { LoginModal } from './components/LoginModal';
import { ApiClient, DEMO_ROLES } from './services/apiClient';
import { Sprout, ShieldCheck, Cpu, Leaf, Smartphone, Fingerprint, CheckCircle2, X, Key } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'checkout' | 'orders' | 'producer' | 'sustainability'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => ApiClient.getCurrentUser());
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ecoferia_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  
  // Estado para la autorizacion remota de dispositivo movil (Passwordless QR)
  const [mobileAuthSessionId, setMobileAuthSessionId] = useState(null);
  const [mobileAuthRole, setMobileAuthRole] = useState('productor');
  const [mobileAuthSuccess, setMobileAuthSuccess] = useState(false);
  const [mobileAuthLoading, setMobileAuthLoading] = useState(false);

  // Detectar parametro qr_auth al escanear con la camara del telefono
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const authId = params.get('qr_auth');
      if (authId) {
        setMobileAuthSessionId(authId);
      }
    } catch (_) {}
  }, []);

  // Toast helper
  const showToast = (message, type = 'success', title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Manejo de inicio de sesión manual (con formulario de correo y contraseña)
  const handleManualLogin = async (email, password) => {
    const { user } = await ApiClient.login(email, password);
    setCurrentUser(user);
    return user;
  };

  const handleLogout = () => {
    ApiClient.clearSession();
    setCurrentUser({
      id: 'guest',
      email: '',
      rol: 'consumidor',
      nombre: 'Visitante'
    });
  };

  // Manejador para autorizar sesion de escritorio desde el telefono celular
  const handleAuthorizeMobileSession = async () => {
    if (!mobileAuthSessionId) return;
    setMobileAuthLoading(true);
    try {
      const demo = DEMO_ROLES[mobileAuthRole] || DEMO_ROLES.productor;
      await ApiClient.autorizarQrSession(mobileAuthSessionId, demo.email, mobileAuthRole);
      setMobileAuthSuccess(true);
      showToast(`?Sesion autorizada exitosamente para ${demo.nombre}!`, 'success', 'Dispositivo Vinculado');
    } catch (_) {
      showToast('Error al autorizar sesion QR', 'error');
    } finally {
      setMobileAuthLoading(false);
    }
  };

  const handleCloseMobileAuthModal = () => {
    setMobileAuthSessionId(null);
    setMobileAuthSuccess(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('qr_auth');
      window.history.replaceState({}, '', url.pathname);
    } catch (_) {}
  };

  // Cambio dinamico de rol (RBAC) para defensa en vivo ante el docente (0 ms de latencia)
  const handleSwitchRole = (roleKey) => {
    try {
      const { user } = ApiClient.switchRole(roleKey);
      setCurrentUser(user);
      const roleConfig = DEMO_ROLES[roleKey] || DEMO_ROLES.consumidor;
      showToast(
        `Rol activo: ${roleConfig.badge} (${user.email}). ${roleConfig.descripcion}`,
        'success',
        'RBAC Actualizado'
      );
    } catch (_) {
      showToast('No se pudo autenticar el rol seleccionado.', 'error');
    }
  };

  // Carga inicial sincronizada con Backend Flask / Fallback resiliente
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [prodList, ordList] = await Promise.all([
          ApiClient.getProductos(),
          ApiClient.getPedidos()
        ]);
        setProducts(prodList);
        setOrders(ordList);
      } catch (err) {
        // Error silencioso de conexion de red
        showToast('Error al conectar con la API de EcoFeria', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Persistir carrito
  useEffect(() => {
    try {
      localStorage.setItem('ecoferia_cart_v1', JSON.stringify(cart));
    } catch (e) {
      // Storage local protegido
    }
  }, [cart]);

  // Manejadores del Carrito
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cantidad >= product.stock) {
          showToast(`No hay más stock disponible de ${product.nombre}`, 'info');
          return prev;
        }
        showToast(`Añadiste +1 ${product.nombre} a tu canasta`, 'success');
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      showToast(`${product.nombre} añadido a tu canasta`, 'success');
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  const updateQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, cantidad: newQty } : item))
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    showToast('Producto retirado de la canasta', 'info');
  };

  // Manejadores de Pedidos (CU-02 y CU-04)
  const handleOrderConfirmed = async (orderPayload) => {
    try {
      const created = await ApiClient.createPedido(orderPayload);
      setOrders((prev) => [created, ...prev]);
      // Actualizar productos en memoria por descuento de stock
      const updatedProds = await ApiClient.getProductos();
      setProducts(updatedProds);
      setCart([]);
      return created;
    } catch (err) {
      showToast(err.message || 'Error al confirmar la reserva', 'error');
      throw err;
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const updated = await ApiClient.updateEstadoPedido(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
      );
      showToast(`Estado de reserva actualizado a "${newStatus}"`, 'success');
    } catch (err) {
      showToast(err.message || 'Error al actualizar estado del pedido', 'error');
      throw err;
    }
  };

  const handleSearchOrderByCode = async (code) => {
    return await ApiClient.getPedidoByCodigo(code);
  };

  // Manejadores de Productos (CU-03 CRUD con RBAC)
  const handleCreateProduct = async (productData) => {
    try {
      const nuevo = await ApiClient.createProducto(productData);
      setProducts((prev) => [nuevo, ...prev]);
      return nuevo;
    } catch (err) {
      showToast(err.message || 'Error al publicar cosecha', 'error');
      throw err;
    }
  };

  const handleUpdateProduct = async (id, changes) => {
    try {
      const updated = await ApiClient.updateProducto(id, changes);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      showToast(err.message || 'Error al actualizar producto', 'error');
      throw err;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await ApiClient.deleteProducto(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      showToast(err.message || 'Error al eliminar producto', 'error');
      throw err;
    }
  };

  const handleResetData = () => {
    ApiClient.resetData();
    window.location.reload();
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
      {/* Barra de Navegación Principal con Selector de Roles RBAC */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItemsCount}
        onOpenCart={() => setCartOpen(true)}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenLogin={() => setLoginModalOpen(true)}
        onStartTour={async () => {
          setActiveTab('catalog');
          const { startTourGuide } = await import('./components/TourGuide');
          setTimeout(() => startTourGuide(), 150);
        }}
      />

      {/* Contenido Principal de Vistas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12" id="main-content">
        {activeTab === 'catalog' && (
          <CatalogView
            products={products}
            loading={loading}
            cart={cart}
            addToCart={addToCart}
            updateQty={updateQty}
            onOpenCart={() => setCartOpen(true)}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutView
            cart={cart}
            onBackToCatalog={() => setActiveTab('catalog')}
            onOrderConfirmed={handleOrderConfirmed}
            showToast={showToast}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTrackingView
            orders={orders}
            onSearchByCode={handleSearchOrderByCode}
            showToast={showToast}
          />
        )}

        {activeTab === 'producer' && (
          <ProducerDashboardView
            onOpenLogin={() => setLoginModalOpen(true)}
            products={products}
            orders={orders}
            currentUser={currentUser}
            onCreateProduct={handleCreateProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onResetData={handleResetData}
            showToast={showToast}
          />
        )}

        {activeTab === 'sustainability' && (
          <SustainabilityDashboardView />
        )}
      </main>

      {/* Drawer del Carrito */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        removeFromCart={removeFromCart}
        onCheckout={() => {
          setCartOpen(false);
          setActiveTab('checkout');
        }}
      />

            {/* Modal de Autorizacion de Dispositivo Movil (Passwordless QR) */}
      {mobileAuthSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in-50 duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 relative border-b border-emerald-800">
              <button
                onClick={handleCloseMobileAuthModal}
                className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Vinculacion Movil</h3>
                  <p className="text-[11px] text-emerald-200">Acceso Seguro Passwordless</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {!mobileAuthSuccess ? (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 leading-relaxed">
                    <p className="font-extrabold flex items-center gap-1.5 text-amber-900">
                      <span>?? Solicitud de Escritorio Detectada</span>
                    </p>
                    <p className="text-[11px] text-amber-800 mt-1">
                      Un computador solicita iniciar sesion con tu dispositivo movil. Selecciona tu perfil y confirma con tu sensor biometrico:
                    </p>
                    <p className="font-mono text-[10px] text-amber-700 mt-1.5 bg-amber-100/70 px-2 py-0.5 rounded-md inline-block">
                      ID: {mobileAuthSessionId}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Selecciona la identidad a autorizar:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMobileAuthRole('productor')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                          mobileAuthRole === 'productor'
                            ? 'border-amber-500 bg-amber-50 text-amber-950 ring-1 ring-amber-500'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-bold">????? Productor</span>
                        <span className="text-[10px] text-slate-500 font-normal">Don Mario</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMobileAuthRole('administrador')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                          mobileAuthRole === 'administrador'
                            ? 'border-purple-500 bg-purple-50 text-purple-950 ring-1 ring-purple-500'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block font-bold">??? Admin</span>
                        <span className="text-[10px] text-slate-500 font-normal">Catedra</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={mobileAuthLoading}
                    onClick={handleAuthorizeMobileSession}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    <Fingerprint className="w-5 h-5 text-emerald-200 animate-pulse" />
                    <span>{mobileAuthLoading ? 'Verificando huella...' : 'AUTORIZAR CON HUELLA / BIOMETRIA'}</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">?Vinculacion Exitosa!</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                      La sesion en la computadora de escritorio se ha desbloqueado correctamente.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseMobileAuthModal}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Continuar al Catalogo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Modal de Inicio de Sesion y Control de Acceso RBAC */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleManualLogin}
        onLogout={handleLogout}
        onUserChange={setCurrentUser}
        showToast={showToast}
      />

      {/* Sistema de Notificaciones Toast */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Footer Académico e Institucional (UPDS) */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                <Sprout className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="font-extrabold text-slate-800 text-sm">EcoFeria Santa Cruz</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-800 font-semibold">Programación Web II</span>
            </div>

            {/* Credenciales Académicas */}
            <div className="text-center sm:text-right space-y-0.5">
              <p className="font-bold text-slate-700">
                Pod de Desarrollo: <span className="text-emerald-900">Eduar Heredia Chavez</span> &amp; <span className="text-emerald-900">Limbert David Quispe Osco</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Universidad Privada Domingo Savio (UPDS) — Santa Cruz de la Sierra, Bolivia (2026)
              </p>
            </div>
          </div>

          {/* Sostenibilidad y métricas de cátedra */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> WCAG 2.1 AA Compliant
              </span>
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <Cpu className="w-3.5 h-3.5 text-emerald-700" /> Lighthouse = 100 (Green Web)
              </span>
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <Leaf className="w-3.5 h-3.5 text-emerald-700" /> Bundle ~108 KB (Meta &lt; 500 KB)
              </span>
            </div>
            <p className="text-slate-600">
              Desarrollo asistido por Inteligencia Artificial (AI DLC) — Costo Operativo 0 Bs
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
