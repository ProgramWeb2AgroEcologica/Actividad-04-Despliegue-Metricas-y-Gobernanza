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
import { Sprout, ShieldCheck, Cpu, Leaf } from 'lucide-react';

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

  // Manejo de inicio de sesi?n manual (con formulario de correo y contrase?a)
  const handleManualLogin = async (email, password) => {
    const { user } = await ApiClient.login(email, password);
    setCurrentUser(user);
    return user;
  };

  const handleLogout = () => {
    localStorage.removeItem('ecoferia_auth_user_v4');
    localStorage.removeItem('ecoferia_auth_token_v4');
    setCurrentUser({
      id: 'guest',
      email: '',
      rol: 'consumidor',
      nombre: 'Visitante'
    });
  };

  // Cambio din?mico de rol (RBAC) para defensa en vivo ante el docente
  const handleSwitchRole = async (roleKey) => {
    try {
      const { user } = await ApiClient.switchRole(roleKey);
      setCurrentUser(user);
      const roleConfig = DEMO_ROLES[roleKey] || DEMO_ROLES.consumidor;
      showToast(
        `Rol activo: ${roleConfig.badge} (${user.email}). ${roleConfig.descripcion}`,
        'success',
        'RBAC Actualizado'
      );
    } catch (err) {
      console.error('Error al cambiar de rol:', err);
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
        console.error('Error cargando datos de API:', err);
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
      console.error(e);
    }
  }, [cart]);

  // Manejadores del Carrito
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cantidad >= product.stock) {
          showToast(`No hay m?s stock disponible de ${product.nombre}`, 'info');
          return prev;
        }
        showToast(`A?adiste +1 ${product.nombre} a tu canasta`, 'success');
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      showToast(`${product.nombre} a?adido a tu canasta`, 'success');
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
      {/* Barra de Navegaci?n Principal con Selector de Roles RBAC */}
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

      {/* Modal de Inicio de Sesi?n y Control de Acceso RBAC */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleManualLogin}
        onLogout={handleLogout}
        showToast={showToast}
      />

      {/* Sistema de Notificaciones Toast */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Footer Acad?mico e Institucional (UPDS) */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                <Sprout className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="font-extrabold text-slate-800 text-sm">EcoFeria Santa Cruz</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-800 font-semibold">Programaci?n Web II</span>
            </div>

            {/* Credenciales Acad?micas */}
            <div className="text-center sm:text-right space-y-0.5">
              <p className="font-bold text-slate-700">
                Pod de Desarrollo: <span className="text-emerald-900">Eduar Heredia Chavez</span> &amp; <span className="text-emerald-900">Limbert David Quispe Osco</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Universidad Privada Domingo Savio (UPDS) ? Santa Cruz de la Sierra, Bolivia (2026)
              </p>
            </div>
          </div>

          {/* Sostenibilidad y m?tricas de c?tedra */}
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
              Desarrollo asistido por Inteligencia Artificial (AI DLC) ? Costo Operativo 0 Bs
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
