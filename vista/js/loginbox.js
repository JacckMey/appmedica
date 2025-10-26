/* js para el login */

const container = document.getElementById('container');
const overlayCon = document.getElementById('overlayCon');
const overlayBtn = document.getElementById('overlayBtn');

overlayBtn.addEventListener('click', () => {
    container.classList.toggle('right-panel-active');

    overlayBtn.classList.remove('btnScaled');
    window.requestAnimationFrame( () => {
        overlayBtn.classList.add('btnScaled');
    });
});


// Forzar recarga cuando el usuario vuelve con el botón "atrás"
window.addEventListener("pageshow", function (event) {
    if (event.persisted || (performance.navigation.type === 2)) {
        location.reload();
    }
});


// Helper para POST JSON
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  const ct = res.headers.get('content-type') || '';
  const payload = ct.includes('application/json') ? await res.json() : { ok: res.ok, msg: await res.text() };
  if (!res.ok) throw new Error(payload.msg || 'Error de servidor');
  return payload;
}

// REGISTRO
const formRegistro = document.querySelector('.sign-up-container form');
if (formRegistro) {
  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(formRegistro);
    const data = Object.fromEntries(fd.entries());

    if ((data.password || '').length < 8) return alert('La contraseña debe tener mínimo 8 caracteres');
    if (data.password !== data.confirmar) return alert('Las contraseñas no coinciden');

    try {
      const r = await postJSON('/registrar', {
        dni: data.dni?.trim(),
        nombres: data.nombres?.trim(),
        apellidos: data.apellidos?.trim(),
        email: data.email?.trim(),
        password: data.password
      });
      alert(r.msg || '✅ Registrado correctamente');
      formRegistro.reset();
   
    } catch (err) {
      alert('❌ ' + err.message);
    }
  });
}

// LOGIN
const formLogin = document.querySelector('.sign-in-container form');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(formLogin);
    const data = Object.fromEntries(fd.entries());

    try {
      const r = await postJSON('/login', {
        dni: data.dni?.trim(),
        password: data.password
      });
      alert(r.msg || '✅ Login correcto');
      // Redirige a tu vista protegida:
     window.location.href = '/agendarcita.html';
    } catch (err) {
      alert('❌ ' + err.message);
    }
  });
}

