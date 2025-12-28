/**
 * NAVBAR.JS - Cita Eficiente
 * Manejo dinámico del navbar según estado de sesión y rol de usuario
 */

// ========== CONFIGURACIÓN DE NAVEGACIÓN POR ROL ==========
const NAV_CONFIG = {
  // Usuario no logueado
  guest: {
    links: [
      { href: 'agendarcita.html', label: 'Inicio', icon: 'home' },
      { href: 'servicios.html', label: 'Servicios', icon: 'services' },
      { href: 'especialidades.html', label: 'Especialidades', icon: 'specialties' }
    ],
    dropdownItems: []
  },
  
  // Usuario normal (paciente)
  usuario: {
    links: [
      { href: 'agendarcita.html', label: 'Inicio', icon: 'home' },
      { href: 'reserva.html', label: 'Reservar Cita', icon: 'calendar' },
      { href: 'servicios.html', label: 'Servicios', icon: 'services' },
      { href: 'especialidades.html', label: 'Especialidades', icon: 'specialties' }
    ],
    dropdownItems: [
      { href: 'perfil.html', label: 'Mi Perfil', icon: 'user' },
      { href: 'historial.html', label: 'Mis Citas', icon: 'calendar-check' },
      { href: 'recetas.html', label: 'Mis Recetas', icon: 'file-text' }
    ]
  },
  
  // Administrador
  admin: {
    links: [
      { href: 'agendarcita.html', label: 'Inicio', icon: 'home' },
      { href: 'reserva.html', label: 'Reservar Cita', icon: 'calendar' },
      { href: 'servicios.html', label: 'Servicios', icon: 'services' },
      { href: 'especialidades.html', label: 'Especialidades', icon: 'specialties' },
      { href: 'agendaSemanal.html', label: 'Dashboard', icon: 'dashboard', isAdmin: true }
    ],
    dropdownItems: [
      { href: 'perfil.html', label: 'Mi Perfil', icon: 'user' },
      { href: 'VistaEmpleados.html', label: 'Gestión Usuarios', icon: 'users', isAdmin: true },
      { href: 'historial.html', label: 'Historial Citas', icon: 'calendar-check' },
      { href: 'reportes.html', label: 'Reportes', icon: 'chart', isAdmin: true }
    ]
  }
};

// ========== ICONOS SVG ==========
const ICONS = {
  home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,
  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  services: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  specialties: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  'calendar-check': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>`,
  'file-text': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>`,
  chart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
};

// ========== CLASE PRINCIPAL NAVBAR ==========
class NavbarManager {
  constructor() {
    this.user = null;
    this.isLoggedIn = false;
    this.init();
  }

  init() {
    // Cargar datos de sesión
    this.loadSession();
    
    // Renderizar navbar
    this.renderNavbar();
    
    // Configurar eventos
    this.setupEventListeners();
    
    // Añadir clase al body
    document.body.classList.add('has-navbar');
  }

  // Cargar sesión desde localStorage
  loadSession() {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData);
        this.isLoggedIn = true;
      }
    } catch (e) {
      console.error('Error cargando sesión:', e);
      this.user = null;
      this.isLoggedIn = false;
    }
  }

  // Obtener rol del usuario
  getRole() {
    if (!this.isLoggedIn || !this.user) return 'guest';
    return this.user.rol || 'usuario';
  }

  // Obtener iniciales del usuario
  getInitials() {
    if (!this.user) return 'US';
    const nombres = this.user.nombres || '';
    const apellidos = this.user.apellidos || '';
    const firstInitial = nombres.charAt(0).toUpperCase();
    const lastInitial = apellidos.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}` || 'US';
  }

  // Obtener nombre completo
  getFullName() {
    if (!this.user) return 'Usuario';
    return `${this.user.nombres || ''} ${this.user.apellidos || ''}`.trim() || 'Usuario';
  }

  // Obtener email
  getEmail() {
    return this.user?.email || 'usuario@email.com';
  }

  // Renderizar navbar
  renderNavbar() {
    const role = this.getRole();
    const config = NAV_CONFIG[role];

    // Renderizar links de navegación
    this.renderNavLinks(config.links);

    // Mostrar/ocultar secciones según login
    const btnLogin = document.getElementById('btn-login');
    const navbarUser = document.getElementById('navbar-user');

    if (this.isLoggedIn) {
      if (btnLogin) btnLogin.style.display = 'none';
      if (navbarUser) navbarUser.style.display = 'flex';
      
      // Actualizar info del usuario
      this.updateUserInfo();
      
      // Renderizar items del dropdown
      this.renderDropdownItems(config.dropdownItems);
    } else {
      if (btnLogin) btnLogin.style.display = 'flex';
      if (navbarUser) navbarUser.style.display = 'none';
    }

    // Renderizar links móviles
    this.renderMobileLinks(config.links);
  }

  // Renderizar links de navegación
  renderNavLinks(links) {
    const navContainer = document.getElementById('navbar-nav');
    if (!navContainer) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navContainer.innerHTML = links.map(link => {
      const isActive = currentPage === link.href ? 'active' : '';
      const isAdmin = link.isAdmin ? 'nav-admin' : '';
      return `<a href="${link.href}" class="${isActive} ${isAdmin}">${link.label}</a>`;
    }).join('');
  }

  // Renderizar items del dropdown
  renderDropdownItems(items) {
    const container = document.getElementById('dropdown-items');
    if (!container) return;

    container.innerHTML = items.map(item => {
      const icon = ICONS[item.icon] || '';
      const isAdmin = item.isAdmin ? 'item-admin' : '';
      return `
        <a href="${item.href}" class="dropdown-item ${isAdmin}">
          <i>${icon}</i>
          <span>${item.label}</span>
        </a>
      `;
    }).join('');
  }

  // Renderizar links móviles
  renderMobileLinks(links) {
    const container = document.getElementById('mobile-nav-links');
    if (!container) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    let html = links.map(link => {
      const isActive = currentPage === link.href ? 'active' : '';
      return `<a href="${link.href}" class="${isActive}">${link.label}</a>`;
    }).join('');

    // Añadir enlaces de sesión en móvil
    if (this.isLoggedIn) {
      html += `
        <div style="border-top: 1px solid var(--gray-200); margin: 12px 0; padding-top: 12px;">
          <a href="perfil.html">Mi Perfil</a>
          <a href="#" id="mobile-logout" style="color: var(--accent-danger);">Cerrar Sesión</a>
        </div>
      `;
    } else {
      html += `
        <div style="border-top: 1px solid var(--gray-200); margin: 12px 0; padding-top: 12px;">
          <a href="index.html" style="background: var(--primary-500); color: white; text-align: center;">Iniciar Sesión</a>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  // Actualizar información del usuario en UI
  updateUserInfo() {
    const initials = this.getInitials();
    const fullName = this.getFullName();
    const email = this.getEmail();
    const role = this.getRole();
    const roleLabel = role === 'admin' ? 'Administrador' : 'Paciente';

    // Avatar e iniciales
    document.querySelectorAll('#avatar-initials, #dropdown-initials').forEach(el => {
      el.textContent = initials;
    });

    // Nombre
    document.querySelectorAll('#user-name, #dropdown-name').forEach(el => {
      el.textContent = fullName;
    });

    // Email
    const emailEl = document.getElementById('dropdown-email');
    if (emailEl) emailEl.textContent = email;

    // Rol
    const roleEl = document.getElementById('user-role');
    if (roleEl) {
      roleEl.textContent = roleLabel;
      roleEl.classList.toggle('role-admin', role === 'admin');
    }

    // Avatar imagen (si existe)
    if (this.user?.avatar) {
      document.querySelectorAll('#user-avatar-img, #dropdown-avatar-img').forEach(img => {
        img.src = this.user.avatar;
        img.style.display = 'block';
      });
      document.querySelectorAll('#avatar-initials, #dropdown-initials').forEach(el => {
        el.style.display = 'none';
      });
    }
  }

  // Configurar eventos
  setupEventListeners() {
    // Toggle dropdown
    const userAvatarBtn = document.getElementById('user-avatar-btn');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userAvatarBtn && userDropdown) {
      userAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
      });

      // Cerrar al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target)) {
          userDropdown.classList.remove('active');
        }
      });

      // Cerrar con Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          userDropdown.classList.remove('active');
        }
      });
    }

    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (mobileMenuBtn && mobileNav) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
      });
    }

    // Mobile logout
    document.addEventListener('click', (e) => {
      if (e.target.id === 'mobile-logout') {
        e.preventDefault();
        this.logout();
      }
    });
  }

  // Cerrar sesión
  logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('user');
      sessionStorage.clear();
      window.location.href = 'index.html';
    }
  }
}

// ========== FUNCIÓN PARA CARGAR NAVBAR HTML ==========
async function loadNavbar() {
  try {
    const response = await fetch('components/navbar.html');
    if (!response.ok) throw new Error('No se pudo cargar el navbar');
    
    const html = await response.text();
    
    // Insertar al inicio del body
    const navbarContainer = document.createElement('div');
    navbarContainer.id = 'navbar-wrapper';
    navbarContainer.innerHTML = html;
    document.body.insertBefore(navbarContainer, document.body.firstChild);
    
    // Inicializar NavbarManager
    window.navbarManager = new NavbarManager();
    
  } catch (error) {
    console.error('Error cargando navbar:', error);
    // Fallback: intentar con navbar inline si existe
    if (document.querySelector('.navbar-main')) {
      window.navbarManager = new NavbarManager();
    }
  }
}

// ========== FUNCIÓN PARA GUARDAR SESIÓN (usar después del login) ==========
function saveUserSession(userData) {
  try {
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  } catch (e) {
    console.error('Error guardando sesión:', e);
    return false;
  }
}

// ========== FUNCIÓN PARA VERIFICAR SI ESTÁ LOGUEADO ==========
function isUserLoggedIn() {
  return !!localStorage.getItem('user');
}

// ========== FUNCIÓN PARA OBTENER USUARIO ACTUAL ==========
function getCurrentUser() {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    return null;
  }
}

// ========== FUNCIÓN PARA VERIFICAR ROL ==========
function hasRole(requiredRole) {
  const user = getCurrentUser();
  if (!user) return false;
  return user.rol === requiredRole;
}

// ========== PROTEGER PÁGINAS ==========
function requireAuth(redirectTo = 'index.html') {
  if (!isUserLoggedIn()) {
    alert('Debes iniciar sesión para acceder a esta página');
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

function requireAdmin(redirectTo = 'agendarcita.html') {
  if (!hasRole('admin')) {
    alert('No tienes permisos para acceder a esta página');
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

// ========== AUTO-INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', loadNavbar);

// Exportar funciones globales
window.NavbarManager = NavbarManager;
window.loadNavbar = loadNavbar;
window.saveUserSession = saveUserSession;
window.isUserLoggedIn = isUserLoggedIn;
window.getCurrentUser = getCurrentUser;
window.hasRole = hasRole;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
