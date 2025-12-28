// controlador/loginController.js
const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

// CONEXIÓN BD
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'appmedica'
});

// ============ LOGIN ============
router.post('/login', async (req, res) => {
    const { dni, password } = req.body;

    try {
        const [rows] = await pool.query(
            "SELECT * FROM usuarios WHERE dni = ? AND password = ? AND activo = 1",
            [dni, password]
        );

        if (rows.length === 0) {
            return res.status(400).json({ msg: "DNI o contraseña incorrectos" });
        }

        const user = rows[0];

        res.json({
            ok: true,
            msg: `Bienvenido ${user.nombres}`,
            rol: user.rol
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error en el servidor" });
    }
});

// ============ REGISTRO ============
router.post('/registrar', async (req, res) => {
    const { dni, nombres, apellidos, email, password } = req.body;

    try {
        const [existe] = await pool.query(
            "SELECT id FROM usuarios WHERE dni = ?",
            [dni]
        );

        if (existe.length > 0) {
            return res.status(400).json({ msg: "El usuario ya está registrado" });
        }

        await pool.query(
            "INSERT INTO usuarios(dni, nombres, apellidos, email, password, rol, activo) VALUES(?,?,?,?,?, 'usuario', 1)",
            [dni, nombres, apellidos, email, password]
        );

        res.json({ ok: true, msg: "Usuario registrado exitosamente" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Error en el servidor" });
    }
});

module.exports = router;
