/**
 * LOGINBOX.JS - Cita Eficiente
 * Manejo del formulario de login y registro
 * Compatible con el nuevo sistema de navbar
 */

// ========== ANIMACIÓN DEL CONTENEDOR ==========
const container = document.getElementById('container');
const overlayCon = document.getElementById('overlayCon');
const overlayBtn = document.getElementById('overlayBtn');

if (overlayBtn) {
  overlayBtn.addEventListener('click', () => {
    container.classList.toggle('right-panel-active');

    overlayBtn.classList.remove('btnScaled');
    window.requestAnimationFrame(() => {
      overlayBtn.classList.add('btnScaled');
    });
  });
}

// Botones del overlay para cambiar entre login y registro
document.querySelectorAll('.overlay-panel button').forEach(btn => {
  btn.addEventListener('click', () => {
    container.classList.toggle('right-panel-active');
  });
});

// ========== FORZAR RECARGA AL VOLVER ==========
window.addEventListener("pageshow", function (event) {
  if (event.persisted || (performance.navigation && performance.navigation.type === 2)) {
    location.reload();
  }
});

// ========== HELPER PARA POST JSON ==========
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const ct = res.headers.get('content-type') || '';
  const payload = ct.includes('application/json')
    ? await res.json()
    : { ok: res.ok, msg: await res.text() };

  if (!res.ok) throw new Error(payload.msg || 'Error de servidor');
  return payload;
}

// ========== GUARDAR SESIÓN ==========
function saveUserSession(userData) {
  try {
    // Mantengo tu "user" para no romper nada
    localStorage.setItem('user', JSON.stringify(userData));

    // ✅ Marca extra para controlar redirect (evita que se vaya solo por "user" viejo)
    localStorage.setItem('sesionActiva', 'true');

    return true;
  } catch (e) {
    console.error('Error guardando sesión:', e);
    return false;
  }
}

// ========== VERIFICAR SI YA ESTÁ LOGUEADO ==========
function checkExistingSession() {
  const user = localStorage.getItem('user');
  const sesionActiva = localStorage.getItem('sesionActiva') === 'true';

  // ✅ SOLO redirige si hay sesión activa (no basta con que exista "user")
  if (user && sesionActiva) {
    const userData = JSON.parse(user);

    // (No cambias tu lógica de roles; ambos van a agendar)
    const redirect = userData.rol === 'admin'
      ? '/agendarcita.html'
      : '/agendarcita.html';

    window.location.href = redirect;
  }

  // Si NO hay sesionActiva, se queda en index (login)
}

// Verificar al cargar
checkExistingSession();

// ========== REGISTRO ==========
const formRegistro = document.querySelector('.sign-up-container form');
if (formRegistro) {
  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(formRegistro);
    const data = Object.fromEntries(fd.entries());

    // Validaciones del cliente
    const dni = (data.dni || '').trim();
    const nombres = (data.nombres || '').trim();
    const apellidos = (data.apellidos || '').trim();
    const email = (data.email || '').trim();
    const password = data.password || '';
    const confirmar = data.confirmar || '';

    if (!dni || !/^\d{8}$/.test(dni)) {
      showNotification('El DNI debe tener 8 dígitos', 'error');
      return;
    }

    if (!nombres || !apellidos) {
      showNotification('Nombres y apellidos son obligatorios', 'error');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNotification('Ingresa un email válido', 'error');
      return;
    }

    if (password.length < 8) {
      showNotification('La contraseña debe tener mínimo 8 caracteres', 'error');
      return;
    }

    if (password !== confirmar) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    // Deshabilitar botón mientras procesa
    const submitBtn = formRegistro.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';

    try {
      const r = await postJSON('/registrar', {
        dni,
        nombres,
        apellidos,
        email,
        password,
        confirmar
      });

      showNotification(r.msg || '✅ Registrado correctamente', 'success');
      formRegistro.reset();

      // Cambiar al panel de login después de 2 segundos
      setTimeout(() => {
        container.classList.remove('right-panel-active');
      }, 2000);

    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// ========== LOGIN ==========
const formLogin = document.querySelector('.sign-in-container form');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(formLogin);
    const data = Object.fromEntries(fd.entries());

    const dni = (data.dni || '').trim();
    const password = data.password || '';

    // Validaciones
    if (!dni || !/^\d{8}$/.test(dni)) {
      showNotification('El DNI debe tener 8 dígitos', 'error');
      return;
    }

    if (!password) {
      showNotification('Ingresa tu contraseña', 'error');
      return;
    }

    // Deshabilitar botón mientras procesa
    const submitBtn = formLogin.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Iniciando...';

    try {
      const r = await postJSON('/login', { dni, password });

      // Guardar sesión en localStorage
      if (r.user) {
        saveUserSession(r.user);
      } else {
        // ✅ si tu backend no devuelve r.user, igual marcamos sesión activa
        localStorage.setItem('sesionActiva', 'true');
      }

      showNotification(r.msg || '✅ Login correcto', 'success');

      // Redirigir después de un breve momento
      setTimeout(() => {
        window.location.href = r.redirect || '/agendarcita.html';
      }, 1000);

    } catch (err) {
      showNotification(err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// ========== NOTIFICACIONES ==========
function showNotification(message, type = 'info') {
  // Remover notificación existente
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification-toast notification-${type}`;

  const icon = type === 'success'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

  notification.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <span class="notification-message">${message}</span>
    <button class="notification-close">&times;</button>
  `;

  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => notification.classList.add('show'), 10);

  // Cerrar al hacer clic
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  });

  // Auto cerrar después de 5 segundos
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// ========== ESTILOS PARA NOTIFICACIONES ==========
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  .notification-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    z-index: 10000;
    transform: translateX(120%);
    transition: transform 0.3s ease;
    max-width: 400px;
  }

  .notification-toast.show {
    transform: translateX(0);
  }

  .notification-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .notification-icon svg {
    width: 100%;
    height: 100%;
  }

  .notification-success .notification-icon {
    color: #06D6A0;
  }

  .notification-error .notification-icon {
    color: #EF476F;
  }

  .notification-info .notification-icon {
    color: #00B4D8;
  }

  .notification-message {
    font-size: 14px;
    color: #334155;
    font-weight: 500;
  }

  .notification-close {
    background: none;
    border: none;
    font-size: 20px;
    color: #94A3B8;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    margin-left: auto;
  }

  .notification-close:hover {
    color: #64748B;
  }

  .notification-success {
    border-left: 4px solid #06D6A0;
  }

  .notification-error {
    border-left: 4px solid #EF476F;
  }

  .notification-info {
    border-left: 4px solid #00B4D8;
  }
`;
document.head.appendChild(notificationStyles);
