const db = require('../modelo/modelo');

// ========== OBTENER TODAS LAS ESPECIALIDADES ==========
const obtenerEspecialidades = (req, res) => {
    const query = `
        SELECT id, nombre, descripcion, emoji, color, imagen_url
        FROM especialidades
        WHERE activo = 1
        ORDER BY nombre ASC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener especialidades:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener especialidades'
            });
        }

        res.json({
            success: true,
            total: results.length,
            data: results
        });
    });
};

// ========== OBTENER DOCTORES POR ESPECIALIDAD ==========
const obtenerDoctoresPorEspecialidad = (req, res) => {
    const { especialidadId } = req.params;

    const query = `
        SELECT 
            d.id,
            CONCAT(d.nombre, ' ', d.apellido) as nombre_completo,
            d.cmp,
            d.consultorio,
            d.años_experiencia,
            e.nombre as especialidad
        FROM doctores d
        INNER JOIN especialidades e ON d.especialidad_id = e.id
        WHERE d.especialidad_id = ? 
        AND d.activo = 1
        ORDER BY d.nombre ASC
    `;

    db.query(query, [especialidadId], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener doctores:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener doctores'
            });
        }

        res.json({
            success: true,
            total: results.length,
            data: results
        });
    });
};

// ========== OBTENER HORARIOS OCUPADOS POR ESPECIALIDAD Y FECHA ==========
const obtenerHorariosOcupados = (req, res) => {
    const { fecha, especialidadId } = req.params;

    const query = `
        SELECT DISTINCT TIME_FORMAT(hora, '%H:%i') as hora
        FROM citas
        WHERE fecha = ? 
        AND especialidad_id = ?
        AND estado != 'cancelada'
        ORDER BY hora
    `;

    db.query(query, [fecha, especialidadId], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener horarios ocupados:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener horarios'
            });
        }

        const horariosOcupados = results.map(row => row.hora);
        res.json({
            success: true,
            horariosOcupados,
            total: results.length
        });
    });
};

// ========== VERIFICAR DISPONIBILIDAD ==========
const verificarDisponibilidad = (req, res) => {
    const { fecha, hora, doctor_id } = req.body;

    if (!fecha || !hora || !doctor_id) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos requeridos: fecha, hora, doctor_id'
        });
    }

    const query = `
        SELECT COUNT(*) as ocupado 
        FROM citas 
        WHERE fecha = ? 
        AND hora = ? 
        AND doctor_id = ? 
        AND estado != 'cancelada'
    `;

    db.query(query, [fecha, hora, doctor_id], (err, results) => {
        if (err) {
            console.error('❌ Error al verificar disponibilidad:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar disponibilidad'
            });
        }

        const disponible = results[0].ocupado === 0;
        res.json({
            success: true,
            disponible: disponible,
            message: disponible ? 'Horario disponible' : 'Horario ocupado'
        });
    });
};

// ========== CREAR CITA (MEJORADO) ==========
const crearCita = (req, res) => {
    console.log('🔵 crearCita llamada con body:', req.body);
    
    // Extraer datos del body - Compatible con tu frontend
    let data = req.body;
    
    // Si viene el formato del frontend (con objeto 'paciente')
    if (data.paciente) {
        const { name, phone, email, dni, reason } = data.paciente;
        
        // Separar nombre completo en nombre y apellido
        const nombreCompleto = (name || '').trim().split(' ');
        const paciente_nombre = nombreCompleto[0] || '';
        const paciente_apellido = nombreCompleto.slice(1).join(' ') || '';
        
        data = {
            paciente_nombre,
            paciente_apellido,
            paciente_dni: dni,
            paciente_telefono: phone,
            paciente_email: email,
            fecha: data.fecha,
            hora: data.hora,
            especialidad_id: data.especialidad_id,
            doctor_id: data.doctor_id,
            motivo: reason || 'Consulta general'
        };
    }

    const {
        paciente_nombre,
        paciente_apellido,
        paciente_dni,
        paciente_telefono,
        paciente_email,
        fecha,
        hora,
        especialidad_id,
        doctor_id,
        motivo
    } = data;

    // Validar campos requeridos
    if (!paciente_nombre || !paciente_dni || !fecha || !hora || !especialidad_id) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos obligatorios',
            error: 'Se requieren: nombre, dni, fecha, hora, especialidad'
        });
    }

    // Asignar doctor automáticamente si no viene
    let finalDoctorId = doctor_id;
    
    if (!finalDoctorId) {
        // Buscar un doctor disponible de la especialidad
        const queryDoctor = `
            SELECT id FROM doctores 
            WHERE especialidad_id = ? AND activo = 1 
            LIMIT 1
        `;
        
        db.query(queryDoctor, [especialidad_id], (errDoc, docResults) => {
            if (errDoc || !docResults.length) {
                return res.status(400).json({
                    success: false,
                    message: 'No hay doctores disponibles para esta especialidad'
                });
            }
            
            finalDoctorId = docResults[0].id;
            continuarCreacion();
        });
    } else {
        continuarCreacion();
    }

    function continuarCreacion() {
        // Verificar disponibilidad
        const verificarQuery = `
            SELECT COUNT(*) as ocupado 
            FROM citas 
            WHERE fecha = ? 
            AND hora = ? 
            AND doctor_id = ? 
            AND estado != 'cancelada'
        `;

        db.query(verificarQuery, [fecha, hora, finalDoctorId], (err, results) => {
            if (err) {
                console.error('❌ Error al verificar:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al verificar disponibilidad',
                    error: err.message
                });
            }

            if (results[0].ocupado > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'El horario ya está ocupado'
                });
            }

            // Buscar si el paciente está registrado como usuario
            const queryUsuario = 'SELECT id FROM usuarios WHERE dni = ? LIMIT 1';
            
            db.query(queryUsuario, [paciente_dni], (errUsr, usrResults) => {
                const usuario_id = (usrResults && usrResults.length) ? usrResults[0].id : null;

                // Crear la cita
                const insertQuery = `
                    INSERT INTO citas (
                        paciente_nombre, 
                        paciente_apellido, 
                        paciente_dni, 
                        paciente_telefono,
                        paciente_email,
                        usuario_id,
                        fecha, 
                        hora, 
                        especialidad_id,
                        doctor_id, 
                        motivo, 
                        estado,
                        fecha_registro
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW())
                `;

                const valores = [
                    paciente_nombre,
                    paciente_apellido || '',
                    paciente_dni,
                    paciente_telefono || null,
                    paciente_email || null,
                    usuario_id,
                    fecha,
                    hora,
                    especialidad_id,
                    finalDoctorId,
                    motivo || 'Consulta general'
                ];

                db.query(insertQuery, valores, (err2, result) => {
                    if (err2) {
                        console.error('❌ Error al crear cita:', err2);
                        
                        if (err2.code === 'ER_DUP_ENTRY') {
                            return res.status(409).json({
                                success: false,
                                message: 'Ya existe una cita para este horario'
                            });
                        }
                        
                        return res.status(500).json({
                            success: false,
                            message: 'Error al crear la cita',
                            error: err2.message
                        });
                    }

                    console.log('✅ Cita creada exitosamente:', result.insertId);

                    res.status(201).json({
                        success: true,
                        message: '¡Cita creada exitosamente!',
                        citaId: result.insertId,
                        data: {
                            id: result.insertId,
                            fecha,
                            hora,
                            paciente: `${paciente_nombre} ${paciente_apellido}`,
                            estado: 'pendiente'
                        }
                    });
                });
            });
        });
    }
};

// ========== OBTENER CITAS OCUPADAS POR FECHA ==========
const obtenerCitasOcupadas = (req, res) => {
    const { fecha } = req.params;
    const { doctor_id, especialidad_id } = req.query;

    let query = `
        SELECT 
            c.id,
            TIME_FORMAT(c.hora, '%H:%i') as hora,
            c.doctor_id,
            CONCAT(d.nombre, ' ', d.apellido) as doctor_nombre,
            c.especialidad_id,
            e.nombre as especialidad_nombre,
            c.paciente_nombre,
            c.paciente_apellido
        FROM citas c
        INNER JOIN doctores d ON c.doctor_id = d.id
        INNER JOIN especialidades e ON c.especialidad_id = e.id
        WHERE c.fecha = ? 
        AND c.estado != 'cancelada'
    `;

    const params = [fecha];

    if (doctor_id) {
        query += ' AND c.doctor_id = ?';
        params.push(doctor_id);
    }

    if (especialidad_id) {
        query += ' AND c.especialidad_id = ?';
        params.push(especialidad_id);
    }

    query += ' ORDER BY c.hora ASC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener citas ocupadas:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener horarios ocupados'
            });
        }

        res.json({
            success: true,
            total: results.length,
            data: results
        });
    });
};

// ========== OBTENER CITA POR ID ==========
const obtenerCitaPorId = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            c.*,
            e.nombre as especialidad_nombre,
            e.emoji as especialidad_emoji,
            CONCAT(d.nombre, ' ', d.apellido) as doctor_nombre,
            d.cmp as doctor_cmp,
            d.consultorio
        FROM citas c
        INNER JOIN especialidades e ON c.especialidad_id = e.id
        INNER JOIN doctores d ON c.doctor_id = d.id
        WHERE c.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener cita:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener la cita'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
};

// ========== OBTENER CITAS POR PACIENTE (DNI) ==========
const obtenerCitasPorPaciente = (req, res) => {
    const { dni } = req.params;

    const query = `
        SELECT 
            c.*,
            e.nombre as especialidad_nombre,
            e.emoji as especialidad_emoji,
            CONCAT(d.nombre, ' ', d.apellido) as doctor_nombre,
            d.consultorio
        FROM citas c
        INNER JOIN especialidades e ON c.especialidad_id = e.id
        INNER JOIN doctores d ON c.doctor_id = d.id
        WHERE c.paciente_dni = ?
        ORDER BY c.fecha DESC, c.hora DESC
    `;

    db.query(query, [dni], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener citas del paciente:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener historial de citas'
            });
        }

        res.json({
            success: true,
            total: results.length,
            data: results
        });
    });
};

// ========== ACTUALIZAR ESTADO DE CITA ==========
const actualizarEstado = (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'confirmada', 'completada', 'cancelada'];

    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
            success: false,
            message: 'Estado inválido. Valores permitidos: ' + estadosValidos.join(', ')
        });
    }

    const query = 'UPDATE citas SET estado = ? WHERE id = ?';

    db.query(query, [estado, id], (err, result) => {
        if (err) {
            console.error('❌ Error al actualizar estado:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar el estado'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        res.json({
            success: true,
            message: `Cita actualizada a: ${estado}`
        });
    });
};

// ========== CANCELAR CITA ==========
const cancelarCita = (req, res) => {
    const { id } = req.params;

    const query = 'UPDATE citas SET estado = "cancelada" WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('❌ Error al cancelar cita:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al cancelar la cita'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Cita cancelada exitosamente'
        });
    });
};

// ========== EXPORTAR TODAS LAS FUNCIONES ==========
module.exports = {
    obtenerEspecialidades,
    obtenerDoctoresPorEspecialidad,
    obtenerHorariosOcupados,
    verificarDisponibilidad,
    crearCita,
    obtenerCitasOcupadas,
    obtenerCitaPorId,
    obtenerCitasPorPaciente,
    actualizarEstado,
    cancelarCita
};