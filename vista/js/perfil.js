/**
 * PERFIL.JS - Cita Eficiente
 * Manejo de la página de perfil de usuario
 */

// ========== ESTADO GLOBAL ==========
let isEditMode = false;
let originalData = {};
let currentUser = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación
  if (!requireAuth()) return;
  
  // Cargar datos del usuario
  loadUserData();
  
  // Configurar eventos
  setupEventListeners();
  
  // Cargar estadísticas
  loadStats();
});

// ========== CARGAR DATOS DEL USUARIO ==========
function loadUserData() {
  currentUser = getCurrentUser();
  
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // Actualizar UI con datos del usuario
  updateProfileUI(currentUser);
  
  // Guardar datos originales
  originalData = { ...currentUser };
}

// ========== ACTUALIZAR UI DEL PERFIL ==========
function updateProfileUI(user) {
  // Nombre completo
  const fullName = `${user.nombres || ''} ${user.apellidos || ''}`.trim() || 'Usuario';
  document.getElementById('profile-fullname').textContent = fullName;
  
  // Iniciales
  const initials = getInitials(user.nombres, user.apellidos);
  document.getElementById('profile-initials').textContent = initials;
  
  // Rol
  const roleEl = document.getElementById('profile-role');
  const isAdmin = user.rol === 'admin';
  roleEl.textContent = isAdmin ? 'Administrador Principal' : 'Paciente';
  roleEl.classList.toggle('is-admin', isAdmin);
  
  // Badge de estado
  const statusBadge = document.getElementById('status-badge');
  const statusText = document.getElementById('status-text');
  if (isAdmin) {
    statusBadge.classList.remove('active');
    statusBadge.classList.add('admin');
    statusText.textContent = 'Administrador';
  }
  
  // Avatar (si existe)
  if (user.avatar) {
    const avatarImg = document.getElementById('profile-avatar-img');
    avatarImg.src = user.avatar;
    avatarImg.style.display = 'block';
    document.getElementById('profile-initials').style.display = 'none';
  }
  
  // Campos del formulario
  document.getElementById('nombres').value = user.nombres || '';
  document.getElementById('apellidos').value = user.apellidos || '';
  document.getElementById('dni').value = user.dni || '';
  document.getElementById('telefono').value = user.telefono || '';
  document.getElementById('email').value = user.email || '';
  document.getElementById('direccion').value = user.direccion || '';
  document.getElementById('ciudad').value = user.ciudad || '';
  document.getElementById('distrito').value = user.distrito || '';
}

// ========== OBTENER INICIALES ==========
function getInitials(nombres, apellidos) {
  const first = (nombres || '').charAt(0).toUpperCase();
  const last = (apellidos || '').charAt(0).toUpperCase();
  return `${first}${last}` || 'US';
}

// ========== CONFIGURAR EVENTOS ==========
function setupEventListeners() {
  // Botón editar perfil
  const btnToggleEdit = document.getElementById('btn-toggle-edit');
  btnToggleEdit.addEventListener('click', toggleEditMode);
  
  // Botones cancelar
  document.getElementById('btn-cancel-personal')?.addEventListener('click', () => cancelEdit('personal'));
  document.getElementById('btn-cancel-contact')?.addEventListener('click', () => cancelEdit('contact'));
  
  // Formularios
  document.getElementById('form-personal')?.addEventListener('submit', handlePersonalSubmit);
  document.getElementById('form-contact')?.addEventListener('submit', handleContactSubmit);
  document.getElementById('form-password')?.addEventListener('submit', handlePasswordSubmit);
  
  // Validación de contraseña en tiempo real
  const passwordNueva = document.getElementById('password-nueva');
  const passwordConfirmar = document.getElementById('password-confirmar');
  
  passwordNueva?.addEventListener('input', validatePassword);
  passwordConfirmar?.addEventListener('input', validatePassword);
  
  // Avatar input
  document.getElementById('avatar-input')?.addEventListener('change', handleAvatarChange);
  
  // Modal
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
}

// ========== MODO EDICIÓN ==========
function toggleEditMode() {
  isEditMode = !isEditMode;
  
  const inputs = document.querySelectorAll('#form-personal input:not([readonly]), #form-contact input');
  const actionSections = document.querySelectorAll('#actions-personal, #actions-contact');
  const btnToggle = document.getElementById('btn-toggle-edit');
  
  inputs.forEach(input => {
    input.disabled = !isEditMode;
  });
  
  actionSections.forEach(section => {
    section.style.display = isEditMode ? 'flex' : 'none';
  });
  
  // Actualizar botón
  btnToggle.innerHTML = isEditMode 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <line x1="18" y1="6" x2="6" y2="18"/>
         <line x1="6" y1="6" x2="18" y2="18"/>
       </svg>
       <span>Cancelar Edición</span>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
         <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
       </svg>
       <span>Editar Perfil</span>`;
  
  if (!isEditMode) {
    // Restaurar datos originales
    updateProfileUI(originalData);
  }
}

function cancelEdit(section) {
  updateProfileUI(originalData);
  toggleEditMode();
}

// ========== MANEJAR CAMBIO DE AVATAR ==========
async function handleAvatarChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    showAlert('alert-personal', 'Por favor selecciona una imagen válida', 'error');
    return;
  }
  
  // Validar tamaño (máx 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showAlert('alert-personal', 'La imagen no debe superar los 5MB', 'error');
    return;
  }
  
  // Convertir a base64 para preview
  const reader = new FileReader();
  reader.onload = async (event) => {
    const base64 = event.target.result;
    
    // Actualizar preview
    const avatarImg = document.getElementById('profile-avatar-img');
    avatarImg.src = base64;
    avatarImg.style.display = 'block';
    document.getElementById('profile-initials').style.display = 'none';
    
    // Aquí puedes enviar al servidor
    try {
      const response = await fetch('/api/perfil/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: currentUser.id,
          avatar: base64 
        })
      });
      
      if (response.ok) {
        // Actualizar localStorage
        currentUser.avatar = base64;
        localStorage.setItem('user', JSON.stringify(currentUser));
        showAlert('alert-personal', 'Foto de perfil actualizada', 'success');
      }
    } catch (error) {
      console.log('Servidor no disponible, guardando localmente');
      currentUser.avatar = base64;
      localStorage.setItem('user', JSON.stringify(currentUser));
      showAlert('alert-personal', 'Foto de perfil actualizada localmente', 'success');
    }
  };
  
  reader.readAsDataURL(file);
}

// ========== ENVIAR DATOS PERSONALES ==========
async function handlePersonalSubmit(e) {
  e.preventDefault();
  
  const formData = {
    id: currentUser.id,
    nombres: document.getElementById('nombres').value.trim(),
    apellidos: document.getElementById('apellidos').value.trim(),
    telefono: document.getElementById('telefono').value.trim()
  };
  
  // Validaciones
  if (!formData.nombres || !formData.apellidos) {
    showAlert('alert-personal', 'Nombres y apellidos son obligatorios', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/perfil/personal', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.ok) {
      // Actualizar localStorage
      Object.assign(currentUser, formData);
      localStorage.setItem('user', JSON.stringify(currentUser));
      originalData = { ...currentUser };
      
      updateProfileUI(currentUser);
      showAlert('alert-personal', 'Información personal actualizada correctamente', 'success');
      toggleEditMode();
      
      // Recargar navbar
      if (window.navbarManager) {
        window.navbarManager.loadSession();
        window.navbarManager.renderNavbar();
      }
    } else {
      showAlert('alert-personal', data.msg || 'Error al actualizar', 'error');
    }
  } catch (error) {
    // Guardar localmente si el servidor no está disponible
    Object.assign(currentUser, formData);
    localStorage.setItem('user', JSON.stringify(currentUser));
    originalData = { ...currentUser };
    
    updateProfileUI(currentUser);
    showAlert('alert-personal', 'Información actualizada localmente', 'success');
    toggleEditMode();
    
    if (window.navbarManager) {
      window.navbarManager.loadSession();
      window.navbarManager.renderNavbar();
    }
  }
}

// ========== ENVIAR DATOS DE CONTACTO ==========
async function handleContactSubmit(e) {
  e.preventDefault();
  
  const formData = {
    id: currentUser.id,
    email: document.getElementById('email').value.trim(),
    direccion: document.getElementById('direccion').value.trim(),
    ciudad: document.getElementById('ciudad').value.trim(),
    distrito: document.getElementById('distrito').value.trim()
  };
  
  // Validar email
  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    showAlert('alert-contact', 'Por favor ingresa un email válido', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/perfil/contacto', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.ok) {
      Object.assign(currentUser, formData);
      localStorage.setItem('user', JSON.stringify(currentUser));
      originalData = { ...currentUser };
      
      showAlert('alert-contact', 'Información de contacto actualizada', 'success');
      toggleEditMode();
    } else {
      showAlert('alert-contact', data.msg || 'Error al actualizar', 'error');
    }
  } catch (error) {
    Object.assign(currentUser, formData);
    localStorage.setItem('user', JSON.stringify(currentUser));
    originalData = { ...currentUser };
    
    showAlert('alert-contact', 'Información actualizada localmente', 'success');
    toggleEditMode();
  }
}

// ========== CAMBIAR CONTRASEÑA ==========
async function handlePasswordSubmit(e) {
  e.preventDefault();
  
  const passwordActual = document.getElementById('password-actual').value;
  const passwordNueva = document.getElementById('password-nueva').value;
  const passwordConfirmar = document.getElementById('password-confirmar').value;
  
  // Validaciones
  if (!passwordActual) {
    showAlert('alert-password', 'Ingresa tu contraseña actual', 'error');
    return;
  }
  
  if (passwordNueva.length < 8) {
    showAlert('alert-password', 'La nueva contraseña debe tener al menos 8 caracteres', 'error');
    return;
  }
  
  if (passwordNueva !== passwordConfirmar) {
    showAlert('alert-password', 'Las contraseñas no coinciden', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/perfil/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentUser.id,
        password_actual: passwordActual,
        password_nueva: passwordNueva
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.ok) {
      showAlert('alert-password', 'Contraseña actualizada correctamente', 'success');
      document.getElementById('form-password').reset();
      resetPasswordValidation();
    } else {
      showAlert('alert-password', data.msg || 'Error al cambiar la contraseña', 'error');
    }
  } catch (error) {
    showAlert('alert-password', 'Error de conexión. Intenta más tarde.', 'error');
  }
}

// ========== VALIDACIÓN DE CONTRASEÑA EN TIEMPO REAL ==========
function validatePassword() {
  const password = document.getElementById('password-nueva').value;
  const confirm = document.getElementById('password-confirmar').value;
  
  // Requisitos
  const reqLength = document.getElementById('req-length');
  const reqUpper = document.getElementById('req-upper');
  const reqNumber = document.getElementById('req-number');
  const reqMatch = document.getElementById('req-match');
  
  // Validar longitud
  toggleRequirement(reqLength, password.length >= 8);
  
  // Validar mayúscula
  toggleRequirement(reqUpper, /[A-Z]/.test(password));
  
  // Validar número
  toggleRequirement(reqNumber, /[0-9]/.test(password));
  
  // Validar coincidencia
  toggleRequirement(reqMatch, password && password === confirm);
}

function toggleRequirement(element, isValid) {
  element.classList.toggle('valid', isValid);
  
  const svg = element.querySelector('svg');
  if (isValid) {
    svg.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>';
  } else {
    svg.innerHTML = '<circle cx="12" cy="12" r="10"/>';
  }
}

function resetPasswordValidation() {
  ['req-length', 'req-upper', 'req-number', 'req-match'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('valid');
    el.querySelector('svg').innerHTML = '<circle cx="12" cy="12" r="10"/>';
  });
}

// ========== CARGAR ESTADÍSTICAS ==========
async function loadStats() {
  // Por ahora mostrar datos de ejemplo
  // En producción, obtener del servidor
  
  try {
    const response = await fetch(`/api/citas/stats/${currentUser.id}`);
    const data = await response.json();
    
    if (response.ok) {
      document.getElementById('stat-citas').textContent = data.total || 0;
      document.getElementById('stat-completadas').textContent = data.completadas || 0;
      document.getElementById('stat-pendientes').textContent = data.pendientes || 0;
    }
  } catch (error) {
    // Mostrar datos de ejemplo si no hay conexión
    document.getElementById('stat-citas').textContent = '5';
    document.getElementById('stat-completadas').textContent = '3';
    document.getElementById('stat-pendientes').textContent = '2';
  }
}

// ========== MOSTRAR ALERTAS ==========
function showAlert(containerId, message, type = 'success') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.className = `alert alert-${type}`;
  container.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' 
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
    </svg>
    <span>${message}</span>
  `;
  container.style.display = 'flex';
  
  // Auto ocultar después de 5 segundos
  setTimeout(() => {
    container.style.display = 'none';
  }, 5000);
}

// ========== MODAL ==========
function openModal(title, message, onConfirm) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = `<p>${message}</p>`;
  document.getElementById('modal-overlay').classList.add('active');
  
  const confirmBtn = document.getElementById('modal-confirm');
  confirmBtn.onclick = () => {
    onConfirm();
    closeModal();
  };
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// ========== FUNCIONES AUXILIARES (desde navbar.js) ==========
// Estas funciones deberían estar disponibles desde navbar.js
// pero las duplicamos por si se carga esta página sin navbar

if (typeof requireAuth === 'undefined') {
  function requireAuth(redirectTo = 'index.html') {
    const user = localStorage.getItem('user');
    if (!user) {
      alert('Debes iniciar sesión para acceder a esta página');
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }
}

if (typeof getCurrentUser === 'undefined') {
  function getCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      return null;
    }
  }
}
