
const express = require('express');
const bcrypt = require('bcrypt');
const conexion = require('../modelo/index');

const router = express.Router();

console.log('✅ usuario.controller CARGADO');
router.get('/ping', (_req,res)=>res.send('pong usuarios'));

// acepta registrar 
router.post(['/registrar', '/registrar/'], (req, res) => {
  let { dni, nombres, apellidos, email, password } = req.body;
  dni = (dni || '').trim();
  nombres = (nombres || '').trim();
  apellidos = (apellidos || '').trim();
  email = (email || '').trim().toLowerCase();

  if (!dni || !nombres || !apellidos || !email || !password)
    return res.status(400).json({ ok:false, msg:'Faltan campos obligatorios' });
  if (!/^\d{8}$/.test(dni))
    return res.status(400).json({ ok:false, msg:'DNI inválido (8 dígitos)' });
  if (password.length < 8)
    return res.status(400).json({ ok:false, msg:'La contraseña debe tener mínimo 8 caracteres' });

  const sqlDup = 'SELECT id FROM usuario WHERE dni = ? OR email = ? LIMIT 1';
  conexion.query(sqlDup, [dni, email], (err, rows) => {
    if (err) return res.status(500).json({ ok:false, msg:'Error verificando usuario' });
    if (rows.length) return res.status(409).json({ ok:false, msg:'DNI o email ya registrados' });

    const password_hash = bcrypt.hashSync(password, 10);
    const sqlIns = `INSERT INTO usuario (dni, nombres, apellidos, email, password_hash)
                    VALUES (?, ?, ?, ?, ?)`;
    conexion.query(sqlIns, [dni, nombres, apellidos, email, password_hash], (err2, result) => {
      if (err2?.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ ok:false, msg:'DNI o email ya registrados' });
      if (err2) return res.status(500).json({ ok:false, msg:'Error al registrar usuario' });
      res.json({ ok:true, msg:'Usuario registrado correctamente', id: result.insertId });
    });
  });
});

// acepta login 
router.post(['/login', '/login/'], (req, res) => {
  const { dni, password } = req.body;
  if (!dni || !password) return res.status(400).json({ ok:false, msg:'DNI y contraseña son obligatorios' });
  if (!/^\d{8}$/.test(dni)) return res.status(400).json({ ok:false, msg:'DNI inválido (8 dígitos)' });

  const sqlSel = 'SELECT id, dni, email, estado, password_hash FROM usuario WHERE dni = ? LIMIT 1';
  conexion.query(sqlSel, [dni], (err, rows) => {
    if (err) return res.status(500).json({ ok:false, msg:'Error consultando usuario' });
    if (!rows.length) return res.status(401).json({ ok:false, msg:'Credenciales inválidas' });

    const u = rows[0];
    if (u.estado && u.estado !== 'ACTIVO') return res.status(403).json({ ok:false, msg:'Usuario inactivo' });

    const okPass = bcrypt.compareSync(password, u.password_hash);
    if (!okPass) return res.status(401).json({ ok:false, msg:'Credenciales inválidas' });

    res.json({ ok:true, msg:'Login exitoso', user:{ id:u.id, dni:u.dni, email:u.email } });
  });
});

module.exports = router;
