const conexion = require('../modelo/conexion');

// ========== OBTENER TODOS LOS DOCTORES ==========
exports.obtenerTodos = async (req, res) => {
    try {
        const [doctores] = await conexion.query(
            `SELECT d.*, e.nombre as especialidad_nombre, e.emoji as especialidad_emoji
            FROM doctores d
            JOIN especialidades e ON d.especialidad_id = e.id
            WHERE d.activo = 1
            ORDER BY d.nombre, d.apellido`
        );

        res.json({
            success: true,
            data: doctores
        });
    } catch (error) {
        console.error('Error al obtener doctores:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener doctores'
        });
    }
};

// ========== OBTENER DOCTORES POR ESPECIALIDAD ==========
exports.obtenerPorEspecialidad = async (req, res) => {
    try {
        const { especialidadId } = req.params;

        const [doctores] = await conexion.query(
            `SELECT d.*, e.nombre as especialidad_nombre
            FROM doctores d
            JOIN especialidades e ON d.especialidad_id = e.id
            WHERE d.especialidad_id = ? AND d.activo = 1
            ORDER BY d.rating DESC`,
            [especialidadId]
        );

        res.json({
            success: true,
            data: doctores
        });
    } catch (error) {
        console.error('Error al obtener doctores por especialidad:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener doctores'
        });
    }
};

// ========== OBTENER DOCTOR POR ID ==========
exports.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [doctores] = await conexion.query(
            `SELECT d.*, e.nombre as especialidad_nombre, e.emoji as especialidad_emoji
            FROM doctores d
            JOIN especialidades e ON d.especialidad_id = e.id
            WHERE d.id = ?`,
            [id]
        );

        if (doctores.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Doctor no encontrado'
            });
        }

        res.json({
            success: true,
            data: doctores[0]
        });
    } catch (error) {
        console.error('Error al obtener doctor:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el doctor'
        });
    }
};