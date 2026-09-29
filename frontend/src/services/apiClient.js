/**
 * EcoFeria Santa Cruz - Cliente de API REST & Gesti?n de Roles (RBAC)
 * Actividad 04 - Programaci?n Web II (UPDS)
 * 
 * Conecta con el Backend Flask en Producci?n (Render) o Local con fallback resiliente.
 * Maneja tokens JWT en cabeceras Bearer y deduplicaci?n de usuarios.
 */

import { MockApi } from './mockApi';

// URL del Backend Flask (configurable por variable de entorno o fallback a Render)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecoferia.onrender.com/api';

// Cuentas de demostraci?n pre-configuradas para la defensa oral de roles (RBAC)
export const DEMO_ROLES = {
  consumidor: {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'cliente@ecoferia.bo',
    password: 'Cliente123!',
    nombre: 'Carlos P?rez',
    rol: 'consumidor',
    badge: 'Consumidor',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    descripcion: 'Explora cosechas, a?ade productos a la canasta y reserva pedidos.'
  },
  productor: {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'productor@ecoferia.bo',
    password: 'Productor123!',
    nombre: 'Don Mario Productor',
    rol: 'productor',
    badge: 'Productor Campesino',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    descripcion: 'Publica cosechas, actualiza stock y gestiona estados de pedidos de feria.'
  },
  administrador: {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@ecoferia.bo',
    password: 'Admin123!',
    nombre: 'Administrador General',
    rol: 'administrador',
    badge: 'Administrador (C?tedra)',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    descripcion: 'Acceso total: auditor?a, gesti?n de productos, ?rdenes y control de roles.'
  }
};

const STORAGE_KEYS = {
  USER: 'ecoferia_auth_user_v4',
  TOKEN: 'ecoferia_auth_token_v4'
};

// Normalizadores bidireccionales entre Backend Flask (Marshmallow) y Frontend React
function normalizarProductoParaFrontend(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria || 'Hortalizas',
    comunidad: p.comunidad || 'Valles Cruce?os',
    productor_nombre: p.productor_nombre || 'Asociaci?n EcoFeria',
    unidad: p.unidad || 'Kg',
    precio_bs: p.precio !== undefined ? Number(p.precio) : (p.precio_bs !== undefined ? Number(p.precio_bs) : 0),
    stock: p.stock !== undefined ? parseInt(p.stock, 10) : 0,
    activo: p.activo !== undefined ? p.activo : true,
    imagen_url: p.imagen || p.imagen_url || '/images/lechuga.jpg',
    descripcion: p.descripcion || 'Producto agroecol?gico cosechado en los Valles Cruce?os sin agroqu?micos sint?ticos.'
  };
}

function normalizarPedidoParaFrontend(o) {
  return {
    id: o.id,
    codigo: o.codigo,
    cliente_nombre: o.cliente || o.cliente_nombre,
    cliente_telefono: o.celular || o.cliente_telefono,
    punto_retiro: o.puntoRetiro || o.punto_retiro,
    fecha_retiro: o.fechaRetiro || o.fecha_retiro,
    estado: o.estado || 'Registrado',
    fecha_creacion: o.fecha_creacion || new Date().toISOString(),
    total_bs: o.totalBs !== undefined ? Number(o.totalBs) : (o.total_bs !== undefined ? Number(o.total_bs) : 0),
    items: (o.items || []).map(i => ({
      producto_id: i.productoId || i.producto_id,
      nombre: i.nombre,
      cantidad: i.cantidad,
      precio_bs: i.precioUnitario !== undefined ? Number(i.precioUnitario) : Number(i.precio_bs || 0),
      subtotal: i.subtotal !== undefined ? Number(i.subtotal) : 0
    }))
  };
}

export const ApiClient = {
  // --- GESTI?N DE SESI?N Y ROLES (RBAC) ---

  getCurrentUser() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : DEMO_ROLES.consumidor;
    } catch {
      return DEMO_ROLES.consumidor;
    }
  },

  getToken() {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
    } catch {
      return null;
    }
  },

  setSession(user, token) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      else localStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (e) {
      console.error('Error guardando sesi?n:', e);
    }
  },

  async login(email, password) {
    const cleanEmail = email.trim();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const err = new Error(errorData.mensaje || (res.status === 401 ? 'Credenciales incorrectas (401 Unauthorized).' : `Error de autenticacion (${res.status})`));
        err.status = res.status;
        throw err;
      }

      const data = await res.json();
      const user = Object.values(DEMO_ROLES).find(u => u.email.toLowerCase() === cleanEmail.toLowerCase()) || {
        id: (data.user && data.user.id) || 'user-' + Date.now(),
        email: cleanEmail,
        nombre: (data.user && data.user.nombre) || cleanEmail.split('@')[0],
        rol: (data.user && data.user.rol) || 'consumidor',
        badge: 'Consumidor Registrado',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };

      this.setSession(user, data.access_token);
      return { user, token: data.access_token };
    } catch (err) {
      if (err.status === 401 || err.status === 400 || (err.message && err.message.toLowerCase().includes('credenciales'))) {
        throw err;
      }

      console.warn('API remota no respondió, verificando contingencia demo:', err.message);
      const demoUser = Object.values(DEMO_ROLES).find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());
      if (demoUser && demoUser.password === password) {
        this.setSession(demoUser, 'demo-jwt-token-' + demoUser.rol);
        return { user: demoUser, token: 'demo-jwt-token-' + demoUser.rol };
      }
      throw err;
    }
  },

  async switchRole(roleKey) {
    const demo = DEMO_ROLES[roleKey] || DEMO_ROLES.consumidor;
    return await this.login(demo.email, demo.password);
  },

  // --- CRUD PRODUCTOS (CU-01 & CU-03) ---

  async getProductos() {
    try {
      const res = await fetch(`${API_BASE_URL}/productos`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizarProductoParaFrontend);
        }
      }
    } catch (e) {
      console.warn('No se pudo conectar al endpoint remoto /productos, cargando respaldo local:', e);
    }
    const local = await MockApi.getProductos();
    return local.map(normalizarProductoParaFrontend);
  },

  async createProducto(productoData) {
    const token = this.getToken();
    const payload = {
      nombre: productoData.nombre,
      precio: parseFloat(productoData.precio_bs),
      categoria: productoData.categoria,
      comunidad: productoData.comunidad,
      stock: parseInt(productoData.stock, 10),
      unidad: productoData.unidad || 'Kg',
      imagen: productoData.imagen_url || '/images/lechuga.jpg',
      activo: true
    };

    try {
      const res = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 403) {
        throw new Error('ACCESO DENEGADO (403): Tu rol actual no tiene permisos para crear cosechas. Cambia a rol "Productor" o "Administrador".');
      }

      if (res.ok) {
        const created = await res.json();
        return normalizarProductoParaFrontend(created);
      }
    } catch (e) {
      if (e.message.includes('403') || e.message.includes('ACCESO DENEGADO')) {
        throw e;
      }
      console.warn('Fallback a almacenamiento local para crear producto:', e);
    }

    const localCreated = await MockApi.createProducto(productoData);
    return normalizarProductoParaFrontend(localCreated);
  },

  async updateProducto(id, changes) {
    const token = this.getToken();
    const payload = {};
    if (changes.nombre !== undefined) payload.nombre = changes.nombre;
    if (changes.precio_bs !== undefined) payload.precio = parseFloat(changes.precio_bs);
    if (changes.categoria !== undefined) payload.categoria = changes.categoria;
    if (changes.comunidad !== undefined) payload.comunidad = changes.comunidad;
    if (changes.stock !== undefined) payload.stock = parseInt(changes.stock, 10);
    if (changes.unidad !== undefined) payload.unidad = changes.unidad;
    if (changes.imagen_url !== undefined) payload.imagen = changes.imagen_url;
    if (changes.activo !== undefined) payload.activo = changes.activo;

    try {
      const res = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 403) {
        throw new Error('ACCESO DENEGADO (403): Tu rol actual no tiene permisos para modificar cosechas.');
      }

      if (res.ok) {
        const updated = await res.json();
        return normalizarProductoParaFrontend(updated);
      }
    } catch (e) {
      if (e.message.includes('403')) throw e;
      console.warn('Fallback local para update producto:', e);
    }

    const localUpdated = await MockApi.updateProducto(id, changes);
    return normalizarProductoParaFrontend(localUpdated);
  },

  async deleteProducto(id) {
    const token = this.getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (res.status === 403) {
        throw new Error('ACCESO DENEGADO (403): Tu rol actual no tiene permisos para eliminar productos.');
      }
      if (res.ok) return { ok: true, id };
    } catch (e) {
      if (e.message.includes('403')) throw e;
      console.warn('Fallback local para delete producto:', e);
    }

    return await MockApi.deleteProducto(id);
  },

  // --- PEDIDOS (CU-02 & CU-04) ---

  async getPedidos() {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizarPedidoParaFrontend);
        }
      }
    } catch (e) {
      console.warn('Fallback local para listar pedidos:', e);
    }
    const local = await MockApi.getPedidos();
    return local.map(normalizarPedidoParaFrontend);
  },

  async getPedidoByCodigo(codigo) {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos/${encodeURIComponent(codigo)}`);
      if (res.ok) {
        const data = await res.json();
        return normalizarPedidoParaFrontend(data);
      }
    } catch (e) {
      console.warn('Fallback local para buscar pedido por c?digo:', e);
    }
    const local = await MockApi.getPedidoByCodigo(codigo);
    return local ? normalizarPedidoParaFrontend(local) : null;
  },

  async createPedido(pedidoData) {
    const payload = {
      cliente: pedidoData.cliente_nombre.trim(),
      celular: pedidoData.cliente_telefono.trim(),
      puntoRetiro: pedidoData.punto_retiro,
      fechaRetiro: pedidoData.fecha_retiro,
      totalBs: parseFloat(pedidoData.total_bs),
      items: pedidoData.items.map(i => ({
        productoId: i.producto_id,
        nombre: i.nombre,
        cantidad: parseInt(i.cantidad, 10),
        precioUnitario: parseFloat(i.precio_bs),
        subtotal: parseFloat(i.subtotal)
      }))
    };

    try {
      const res = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        return normalizarPedidoParaFrontend(created);
      }
    } catch (e) {
      console.warn('Fallback local para registrar pedido:', e);
    }

    const localCreated = await MockApi.createPedido(pedidoData);
    return normalizarPedidoParaFrontend(localCreated);
  },

  async updateEstadoPedido(id, nuevoEstado) {
    const token = this.getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (res.status === 403) {
        throw new Error('ACCESO DENEGADO (403): Solo Productores o Administradores pueden cambiar el estado del pedido.');
      }

      if (res.ok) {
        const updated = await res.json();
        return normalizarPedidoParaFrontend(updated);
      }
    } catch (e) {
      if (e.message.includes('403')) throw e;
      console.warn('Fallback local para actualizar estado de pedido:', e);
    }

    const localUpdated = await MockApi.updateEstadoPedido(id, nuevoEstado);
    return normalizarPedidoParaFrontend(localUpdated);
  },

  resetData() {
    MockApi.resetData();
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    return { ok: true };
  }
};
