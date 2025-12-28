// controlador/historialcontroller.js
const db = require('../modelo/modelo');

const historialController = {
    
    // ========== LISTAR TODOS LOS PACIENTES ==========
    listarPacientes: (req, res) => {
        console.log('📊 Cargando pacientes...');
        
        const query = `
            SELECT 
                p.id,
                p.nombre,
                p.edad,
                p.genero,
                p.tipo_sangre,
                p.telefono,
                p.email,
                p.direccion,
                p.ultima_cita,
                p.total_citas,
                p.estado,
                p.condiciones,
                p.alergias,
                p.medicamentos,
                e.nombre AS especialidad,
                d.nombre AS doctor
            FROM pacientes p
            LEFT JOIN especialidades e ON p.especialidad_id = e.id
            LEFT JOIN doctores d ON p.doctor_id = d.id
            ORDER BY p.ultima_cita DESC
        `;
        
        db.query(query, (err, pacientes) => {
            if (err) {
                console.error('❌ Error al listar pacientes:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al cargar pacientes',
                    error: err.message
                });
            }
            
            console.log(`✅ ${pacientes.length} pacientes encontrados`);
            
            res.json({
                success: true,
                data: pacientes
            });
        });
    },

    // ========== VER DETALLE DE UN PACIENTE ==========
    verDetallePaciente: (req, res) => {
        const { id } = req.params;
        
        console.log(`📋 Cargando detalle del paciente ${id}...`);
        
        // Obtener datos del paciente
        const queryPaciente = `
            SELECT 
                p.id,
                p.nombre,
                p.edad,
                p.genero,
                p.tipo_sangre,
                p.telefono,
                p.email,
                p.direccion,
                p.ultima_cita,
                p.total_citas,
                p.estado,
                p.condiciones,
                p.alergias,
                p.medicamentos,
                e.nombre AS especialidad,
                d.nombre AS doctor
            FROM pacientes p
            LEFT JOIN especialidades e ON p.especialidad_id = e.id
            LEFT JOIN doctores d ON p.doctor_id = d.id
            WHERE p.id = ?
        `;
        
        db.query(queryPaciente, [id], (err, paciente) => {
            if (err) {
                console.error('❌ Error al ver detalle del paciente:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al cargar detalle del paciente',
                    error: err.message
                });
            }
            
            if (paciente.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Paciente no encontrado'
                });
            }
            
            // Obtener historial de consultas
            const queryHistorial = `
                SELECT 
                    c.id,
                    c.fecha_consulta AS date,
                    c.motivo AS reason,
                    c.notas AS notes,
                    d.nombre AS doctor
                FROM consultas c
                LEFT JOIN doctores d ON c.doctor_id = d.id
                WHERE c.paciente_id = ?
                ORDER BY c.fecha_consulta DESC
            `;
            
            db.query(queryHistorial, [id], (err2, historial) => {
                if (err2) {
                    console.error('❌ Error al obtener historial:', err2);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al cargar historial',
                        error: err2.message
                    });
                }
                
                // Agregar historial al paciente
                const pacienteCompleto = {
                    ...paciente[0],
                    history: historial
                };
                
                console.log(`✅ Paciente ${id} cargado con ${historial.length} consultas`);
                
                res.json({
                    success: true,
                    data: pacienteCompleto
                });
            });
        });
    },

    // ========== OBTENER ESPECIALIDADES ÚNICAS ==========
    obtenerEspecialidades: (req, res) => {
        console.log('🏥 Cargando especialidades...');
        
        const query = `
            SELECT DISTINCT e.nombre
            FROM especialidades e
            INNER JOIN pacientes p ON e.id = p.especialidad_id
            ORDER BY e.nombre
        `;
        
        db.query(query, (err, especialidades) => {
            if (err) {
                console.error('❌ Error al obtener especialidades:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al cargar especialidades',
                    error: err.message
                });
            }
            
            console.log(`✅ ${especialidades.length} especialidades encontradas`);
            
            res.json({
                success: true,
                data: especialidades
            });
        });
    }
};

module.exports = historialController;