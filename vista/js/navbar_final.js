// ========================================
// NAVBAR DINÁMICO GLOBAL
// Este archivo reemplaza el <header> en todas las páginas
// ========================================

// Obtener usuario actual
function obtenerUsuarioActual() {
    const usuarioStr = localStorage.getItem('usuario');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
}

// Verificar si está logueado
function estaLogueado() {
    return localStorage.getItem('usuario') !== null;
}

// Verificar si es admin
function esAdmin() {
    const usuario = obtenerUsuarioActual();
    return usuario && usuario.rol === 'admin';
}

// Cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        localStorage.removeItem('usuario');
        window.location.href = '/';
    }
}

// Crear el navbar
function crearNavbar() {
    const usuario = obtenerUsuarioActual();
    const logueado = estaLogueado();
    const admin = esAdmin();

    // Buscar el header existente
    const headerExistente = document.querySelector('header');
    
    if (headerExistente) {
        // Si existe un header, reemplazarlo
        headerExistente.remove();
    }

    const navbarHTML = `
        <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem 2rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000;">
            <div style="max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                
                <!-- Logo -->
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 2rem;">🏥</div>
                    <div>
                        <h1 style="color: white; font-size: 1.5rem; margin: 0; font-weight: 700; font-family: 'Poppins', sans-serif;">CITA EFICIENTE</h1>
                        <p style="color: rgba(255,255,255,0.8); font-size: 0.7rem; margin: 0; font-family: 'Poppins', sans-serif;">Sistema de Gestión de Citas</p>
                    </div>
                </div>

                <!-- Navegación -->
                <nav style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; font-family: 'Poppins', sans-serif;">
                    ${!logueado ? `
                        <a href="/" style="color: white; text-decoration: none; font-weight: 500; transition: opacity 0.2s; font-size: 0.9rem;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                            🔐 INICIO
                        </a>
                    ` : `
                        <a href="/agendarcita.html" style="color: white; text-decoration: none; font-weight: 500; transition: opacity 0.2s; font-size: 0.9rem;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                            🏠 INICIO
                        </a>
                        <a href="/reserva.html" style="color: white; text-decoration: none; font-weight: 500; transition: opacity 0.2s; font-size: 0.9rem;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                            📋 RESERVA
                        </a>
                        <a href="/historial.html" style="color: white; text-decoration: none; font-weight: 500; transition: opacity 0.2s; font-size: 0.9rem;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                            📝 HISTORIAL
                        </a>
                        ${admin ? `
                            <a href="/agendaSemanal.html" style="color: #FFD700; text-decoration: none; font-weight: 600; transition: opacity 0.2s; border: 2px solid #FFD700; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                                📊 DASHBOARD
                            </a>
                        ` : ''}
                    `}
                    
                    ${logueado ? `
                        <div style="display: flex; align-items: center; gap: 1rem; padding-left: 1rem; border-left: 2px solid rgba(255,255,255,0.3);">
                            <div style="text-align: right;">
                                <p style="color: white; margin: 0; font-size: 0.85rem; font-weight: 600;">${usuario.nombres} ${usuario.apellidos}</p>
                                <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 0.7rem;">${admin ? '👑 Administrador' : '👤 Usuario'}</p>
                            </div>
                            <button onclick="cerrarSesion()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s; font-size: 0.85rem; font-family: 'Poppins', sans-serif;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                                🚪 Salir
                            </button>
                        </div>
                    ` : ''}
                </nav>
            </div>
        </header>
    `;

    // Insertar el navbar al principio del body
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
}

// Verificar acceso a páginas protegidas
function verificarAcceso() {
    const paginasProtegidas = ['/reserva', '/agendar', '/historial', '/agendaSemanal'];
    const paginaActual = window.location.pathname;

    // Si está en una página protegida y no está logueado
    if (paginasProtegidas.some(p => paginaActual.includes(p)) && !estaLogueado()) {
        alert('⚠️ Debes iniciar sesión para acceder a esta página');
        window.location.href = '/';
        return false;
    }

    // Si está en dashboard y no es admin
    if (paginaActual.includes('/agendaSemanal') && !esAdmin()) {
        alert('⚠️ Solo los administradores pueden acceder al dashboard');
        window.location.href = '/agendarcita.html';
        return false;
    }

    return true;
}

// Inicializar cuando carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Verificar acceso primero
    if (!verificarAcceso()) return;
    
    // Crear navbar
    crearNavbar();
});

// Funciones auxiliares
function obtenerUsuarioId() {
    const usuario = obtenerUsuarioActual();
    return usuario ? usuario.id : null;
}

function obtenerUsuarioDNI() {
    const usuario = obtenerUsuarioActual();
    return usuario ? usuario.dni : null;
}