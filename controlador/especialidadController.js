const conexion = require('../modelo/conexion');

// ========== OBTENER TODAS LAS ESPECIALIDADES ==========
exports.obtenerTodas = async (req, res) => {
    try {
        const [especialidades] = await conexion.query(
            'SELECT * FROM especialidades WHERE activo = 1 ORDER BY nombre'
        );

        res.json({
            success: true,
            data: especialidades
        });
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener especialidades'
        });
    }
};

// ========== OBTENER ESPECIALIDAD POR ID ==========
exports.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [especialidades] = await conexion.query(
            'SELECT * FROM especialidades WHERE id = ?',
            [id]
        );

        if (especialidades.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Especialidad no encontrada'
            });
        }

        res.json({
            success: true,
            data: especialidades[0]
        });
    } catch (error) {
        console.error('Error al obtener especialidad:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener la especialidad'
        });
    }
};