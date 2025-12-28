// server.js
const express = require('express');
const path = require('path');
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, _res, next) => {
  console.log('📍', req.method, req.url);
  next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'vista')));

console.log('📂 Cargando controladores...\n');

// ========== CARGAR CONTROLADORES ==========
let usuarioRouter = null;
let historialController = null;
let reservaController = null;

try {
  usuarioRouter = require('./controlador/usuariocontroller');
  console.log('✅ usuariocontroller.js cargado');
} catch (err) {
  console.error('❌ usuariocontroller.js:', err.message);
}

try {
  historialController = require('./controlador/historialcontroller');
  console.log('✅ historialcontroller.js cargado');
} catch (err) {
  console.error('❌ historialcontroller.js:', err.message);
}

try {
  reservaController = require('./controlador/reservaController');
  console.log('✅ reservaController.js cargado');
} catch (err) {
  console.error('❌ reservaController.js:', err.message);
}

console.log('\n📋 Registrando rutas...\n');

// ========== RUTAS DE USUARIOS ==========
if (usuarioRouter) {
  app.use('/', usuarioRouter);
  console.log('✅ Rutas de usuarios registradas');
}

// ========== RUTAS DE HISTORIAL ========== // ← MODIFICADO (COMPLETO)
if (historialController) {
  
  // Ruta antigua (si existe)
  if (historialController.obtenerTodos) {
    app.get('/historial/datos', historialController.obtenerTodos);
    console.log('✅ Ruta: GET /historial/datos');
  }
  
  // ← NUEVO: Rutas del módulo historial clínico
  if (historialController.listarPacientes) {
    app.get('/api/historial/pacientes', historialController.listarPacientes);
    console.log('✅ Ruta: GET /api/historial/pacientes');
  }
  
  if (historialController.verDetallePaciente) {
    app.get('/api/historial/pacientes/:id', historialController.verDetallePaciente);
    console.log('✅ Ruta: GET /api/historial/pacientes/:id');
  }
  
  if (historialController.obtenerEspecialidades) {
    app.get('/api/historial/especialidades', historialController.obtenerEspecialidades);
    console.log('✅ Ruta: GET /api/historial/especialidades');
  }
  
} else {
  console.error('❌ historialController NO SE CARGÓ - Verifica el archivo');
}

// ========== RUTAS DE RESERVAS ==========
if (reservaController) {
  
  // RUTA PRINCIPAL: Crear cita
  if (reservaController.crearCita) {
    app.post('/api/citas/crear', reservaController.crearCita);
    console.log('✅ Ruta: POST /api/citas/crear');
  } else {
    console.error('❌ reservaController.crearCita NO EXISTE');
  }
  
  // Otras rutas opcionales
  if (reservaController.obtenerHorariosOcupados) {
    app.get('/api/horarios-ocupados/:fecha/:especialidadId', reservaController.obtenerHorariosOcupados);
    console.log('✅ Ruta: GET /api/horarios-ocupados/:fecha/:especialidadId');
  }
  
  if (reservaController.obtenerEspecialidades) {
    app.get('/api/especialidades', reservaController.obtenerEspecialidades);
    console.log('✅ Ruta: GET /api/especialidades');
  }
  
  if (reservaController.obtenerCitasPorPaciente) {
    app.get('/api/paciente/:dni/citas', reservaController.obtenerCitasPorPaciente);
    console.log('✅ Ruta: GET /api/paciente/:dni/citas');
  }
  
} else {
  console.error('❌ reservaController NO SE CARGÓ - Verifica el archivo');
}

// Health check
app.get('/_health', (req, res) => res.send('ok'));

// Manejo de errores
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}\n`);
  console.log('Páginas disponibles:');
  console.log(`   📄 http://localhost:${PORT}/index.html`);
  console.log(`   📄 http://localhost:${PORT}/agendarcita.html`);
  console.log(`   📄 http://localhost:${PORT}/reserva.html`);
  console.log(`   📄 http://localhost:${PORT}/historial.html`);
  console.log(`   📄 http://localhost:${PORT}/perfil.html\n`);
});