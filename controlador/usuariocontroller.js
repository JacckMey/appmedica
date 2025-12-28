const express = require('express');
const bcrypt = require('bcrypt');
const conexion = require('../modelo/modelo');

const router = express.Router();

console.log('✅ usuario.controller CARGADO');
router.get('/ping', (_req, res) => res.send('pong usuarios'));

// ========== FUNCIÓN AUXILIAR: Validar Email ==========
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ========== REGISTRAR ==========
router.post(['/registrar', '/registrar/'], (req, res) => {
  let { dni, nombres, apellidos, email, password, confirmar } = req.body;
  
  // Sanitizar inputs
  dni = (dni || '').trim();
  nombres = (nombres || '').trim();
  apellidos = (apellidos || '').trim();
  email = (email || '').trim().toLowerCase();

  // Validaciones básicas
  if (!dni || !nombres || !apellidos || !email || !password)
    return res.status(400).json({ ok: false, msg: 'Faltan campos obligatorios' });
  
  if (!/^\d{8}$/.test(dni))
    return res.status(400).json({ ok: false, msg: 'DNI inválido (debe tener 8 dígitos)' });
  
  // Validar formato de email
  if (!validarEmail(email))
    return res.status(400).json({ ok: false, msg: 'Email inválido' });
  
  if (password.length < 8)
    return res.status(400).json({ ok: false, msg: 'La contraseña debe tener mínimo 8 caracteres' });
  
  if (confirmar && password !== confirmar)
    return res.status(400).json({ ok: false, msg: 'Las contraseñas no coinciden' });

  // Verificar duplicados
  const sqlDup = 'SELECT id FROM usuarios WHERE dni = ? OR email = ? LIMIT 1';
  conexion.query(sqlDup, [dni, email], (err, rows) => {
    if (err) {
      console.error('❌ Error verificando duplicados:', err);
      return res.status(500).json({ ok: false, msg: 'Error verificando usuario' });
    }
    
    if (rows.length) 
      return res.status(409).json({ ok: false, msg: 'DNI o email ya registrados' });

    // Encriptar contraseña
    const password_hash = bcrypt.hashSync(password, 10);
    
    // Insertar usuario
    const sqlIns = `INSERT INTO usuarios (dni, nombres, apellidos, email, password, rol, activo, fecha_creacion)
                    VALUES (?, ?, ?, ?, ?, 'usuario', 1, NOW())`;
    
    conexion.query(sqlIns, [dni, nombres, apellidos, email, password_hash], (err2, result) => {
      if (err2?.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ ok: false, msg: 'DNI o email ya registrados' });
      
      if (err2) {
        console.error('❌ Error al insertar usuario:', err2);
        return res.status(500).json({ ok: false, msg: 'Error al registrar usuario' });
      }
      
      console.log('✅ Usuario registrado exitosamente:', dni);
      
      res.json({ 
        ok: true, 
        success: true,
        msg: '¡Registro exitoso! Ya puedes iniciar sesión',
        message: '¡Registro exitoso! Ya puedes iniciar sesión',
        id: result.insertId 
      });
    });
  });
});

// ========== LOGIN ==========
router.post(['/login', '/login/'], (req, res) => {
  const { dni, password } = req.body;
  
  console.log('📥 Login recibido:', { dni, password: password ? '***' : 'vacío' });
  
  // Validaciones básicas
  if (!dni || !password) 
    return res.status(400).json({ ok: false, msg: 'DNI y contraseña son obligatorios' });
  
  if (!/^\d{8}$/.test(dni)) 
    return res.status(400).json({ ok: false, msg: 'DNI inválido (debe tener 8 dígitos)' });

  // Buscar usuario
  const sqlSel = 'SELECT id, dni, nombres, apellidos, email, password, rol, activo FROM usuarios WHERE dni = ? LIMIT 1';
  
  conexion.query(sqlSel, [dni], (err, rows) => {
    if (err) {
      console.error('❌ Error consultando usuario:', err);
      return res.status(500).json({ ok: false, msg: 'Error consultando usuario' });
    }
    
    console.log('🔍 Usuario encontrado:', rows.length > 0 ? 'SÍ' : 'NO');
    
    if (!rows.length) 
      return res.status(401).json({ 
        ok: false, 
        success: false, 
        msg: 'DNI o contraseña incorrectos', 
        message: 'DNI o contraseña incorrectos' 
      });

    const u = rows[0];
    
    // Verificar si está activo
    if (u.activo !== 1) 
      return res.status(403).json({ ok: false, msg: 'Usuario inactivo. Contacte al administrador' });

    // Verificar contraseña
    console.log('🔐 Verificando contraseña...');
    const okPass = bcrypt.compareSync(password, u.password);
    console.log('✅ Contraseña válida:', okPass ? 'SÍ' : 'NO');
    
    if (!okPass) 
      return res.status(401).json({ 
        ok: false, 
        success: false, 
        msg: 'DNI o contraseña incorrectos', 
        message: 'DNI o contraseña incorrectos' 
      });

    // Actualizar último acceso
    const sqlUpd = 'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?';
    conexion.query(sqlUpd, [u.id], (errUpd) => {
      if (errUpd) console.error('⚠️ Error actualizando último acceso:', errUpd);
    });

    // Determinar redirección según rol
    const redirect = u.rol === 'admin' ? '/agendarcita.html' : '/agendarcita.html';

    console.log(`✅ Login exitoso: ${u.nombres} ${u.apellidos} (${u.rol})`);

    res.json({ 
      ok: true, 
      success: true,
      msg: `¡Bienvenido ${u.nombres}!`,
      message: `¡Bienvenido ${u.nombres}!`,
      rol: u.rol,
      redirect: redirect,
      user: { 
        id: u.id, 
        dni: u.dni, 
        nombres: u.nombres,
        apellidos: u.apellidos,
        email: u.email,
        rol: u.rol
      } 
    });
  });
});

// ========== CERRAR SESIÓN (opcional) ==========
router.post('/logout', (req, res) => {
  // Si usas sesiones, aquí las destruirías
  // req.session.destroy();
  res.json({ ok: true, msg: 'Sesión cerrada' });
});

module.exports = router;