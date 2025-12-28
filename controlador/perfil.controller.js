const express = require('express');
const bcrypt = require('bcrypt');
const conexion = require('../modelo/modelo');

const router = express.Router();

console.log('✅ perfil.controller CARGADO');

// ========== OBTENER PERFIL ==========
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = `SELECT id, dni, nombres, apellidos, email, telefono, direccion, ciudad, distrito, rol, activo, avatar, fecha_creacion, ultimo_acceso 
               FROM usuarios WHERE id = ? LIMIT 1`;
  
  conexion.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('Error obteniendo perfil:', err);
      return res.status(500).json({ ok: false, msg: 'Error obteniendo perfil' });
    }
    
    if (!rows.length) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
    
    // No enviar la contraseña
    const user = rows[0];
    res.json({ ok: true, user });
  });
});

// ========== ACTUALIZAR INFORMACIÓN PERSONAL ==========
router.put('/personal', (req, res) => {
  const { id, nombres, apellidos, telefono } = req.body;
  
  if (!id) {
    return res.status(400).json({ ok: false, msg: 'ID de usuario requerido' });
  }
  
  if (!nombres?.trim() || !apellidos?.trim()) {
    return res.status(400).json({ ok: false, msg: 'Nombres y apellidos son obligatorios' });
  }
  
  const sql = `UPDATE usuarios SET nombres = ?, apellidos = ?, telefono = ? WHERE id = ?`;
  
  conexion.query(sql, [nombres.trim(), apellidos.trim(), telefono?.trim() || null, id], (err, result) => {
    if (err) {
      console.error('Error actualizando información personal:', err);
      return res.status(500).json({ ok: false, msg: 'Error actualizando información' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
    
    res.json({ ok: true, msg: 'Información personal actualizada correctamente' });
  });
});

// ========== ACTUALIZAR INFORMACIÓN DE CONTACTO ==========
router.put('/contacto', (req, res) => {
  const { id, email, direccion, ciudad, distrito } = req.body;
  
  if (!id) {
    return res.status(400).json({ ok: false, msg: 'ID de usuario requerido' });
  }
  
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, msg: 'Email inválido' });
  }
  
  // Verificar si el email ya existe en otro usuario
  const sqlCheck = 'SELECT id FROM usuarios WHERE email = ? AND id != ? LIMIT 1';
  conexion.query(sqlCheck, [email.trim().toLowerCase(), id], (errCheck, rowsCheck) => {
    if (errCheck) {
      console.error('Error verificando email:', errCheck);
      return res.status(500).json({ ok: false, msg: 'Error verificando email' });
    }
    
    if (rowsCheck.length) {
      return res.status(409).json({ ok: false, msg: 'Este email ya está registrado en otra cuenta' });
    }
    
    const sql = `UPDATE usuarios SET email = ?, direccion = ?, ciudad = ?, distrito = ? WHERE id = ?`;
    
    conexion.query(sql, [
      email.trim().toLowerCase(),
      direccion?.trim() || null,
      ciudad?.trim() || null,
      distrito?.trim() || null,
      id
    ], (err, result) => {
      if (err) {
        console.error('Error actualizando contacto:', err);
        return res.status(500).json({ ok: false, msg: 'Error actualizando información' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
      }
      
      res.json({ ok: true, msg: 'Información de contacto actualizada correctamente' });
    });
  });
});

// ========== CAMBIAR CONTRASEÑA ==========
router.put('/password', (req, res) => {
  const { id, password_actual, password_nueva } = req.body;
  
  if (!id || !password_actual || !password_nueva) {
    return res.status(400).json({ ok: false, msg: 'Todos los campos son obligatorios' });
  }
  
  if (password_nueva.length < 8) {
    return res.status(400).json({ ok: false, msg: 'La nueva contraseña debe tener mínimo 8 caracteres' });
  }
  
  // Obtener contraseña actual
  const sqlGet = 'SELECT password FROM usuarios WHERE id = ? LIMIT 1';
  conexion.query(sqlGet, [id], (errGet, rows) => {
    if (errGet) {
      console.error('Error obteniendo usuario:', errGet);
      return res.status(500).json({ ok: false, msg: 'Error al verificar contraseña' });
    }
    
    if (!rows.length) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña actual
    const passwordMatch = bcrypt.compareSync(password_actual, rows[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ ok: false, msg: 'La contraseña actual es incorrecta' });
    }
    
    // Actualizar contraseña
    const newPasswordHash = bcrypt.hashSync(password_nueva, 10);
    const sqlUpdate = 'UPDATE usuarios SET password = ? WHERE id = ?';
    
    conexion.query(sqlUpdate, [newPasswordHash, id], (errUpdate, result) => {
      if (errUpdate) {
        console.error('Error actualizando contraseña:', errUpdate);
        return res.status(500).json({ ok: false, msg: 'Error al cambiar contraseña' });
      }
      
      res.json({ ok: true, msg: 'Contraseña actualizada correctamente' });
    });
  });
});

// ========== ACTUALIZAR AVATAR ==========
router.post('/avatar', (req, res) => {
  const { id, avatar } = req.body;
  
  if (!id || !avatar) {
    return res.status(400).json({ ok: false, msg: 'ID y avatar son requeridos' });
  }
  
  // Validar que sea base64 de imagen
  if (!avatar.startsWith('data:image/')) {
    return res.status(400).json({ ok: false, msg: 'Formato de imagen inválido' });
  }
  
  const sql = 'UPDATE usuarios SET avatar = ? WHERE id = ?';
  
  conexion.query(sql, [avatar, id], (err, result) => {
    if (err) {
      console.error('Error actualizando avatar:', err);
      return res.status(500).json({ ok: false, msg: 'Error al actualizar avatar' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
    
    res.json({ ok: true, msg: 'Avatar actualizado correctamente' });
  });
});

// ========== ESTADÍSTICAS DE CITAS ==========
router.get('/stats/:userId', (req, res) => {
  const { userId } = req.params;
  
  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
      SUM(CASE WHEN estado = 'pendiente' OR estado = 'confirmada' THEN 1 ELSE 0 END) as pendientes
    FROM citas 
    WHERE usuario_id = ?
  `;
  
  conexion.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Error obteniendo estadísticas:', err);
      return res.status(500).json({ ok: false, msg: 'Error obteniendo estadísticas' });
    }
    
    const stats = rows[0] || { total: 0, completadas: 0, pendientes: 0 };
    res.json({ 
      ok: true, 
      total: stats.total || 0,
      completadas: stats.completadas || 0,
      pendientes: stats.pendientes || 0
    });
  });
});

module.exports = router;
