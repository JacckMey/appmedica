// Mapeo de especialidades a sus IDs en la interfaz
const especialidadesMap = {
    'Cardiología': 'cardiologia',
    'Pediatría': 'pediatria',
    'Dermatología': 'dermatologia',
    'Ginecología': 'ginecologia',
    'Oftalmología': 'oftalmologia',
    'Ortopedia': 'ortopedia',
    'Sin especialidad': 'cardiologia'  // Valor por defecto
};

// Función para cambiar entre pestañas
document.addEventListener('DOMContentLoaded', function() {
    // Obtener todos los botones de pestaña
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    // Agregar evento de clic a cada botón
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Obtener el ID de la pestaña objetivo
            const tabId = this.getAttribute('data-tab');
            
            // Remover clase 'active' de todos los botones y paneles
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            
            // Agregar clase 'active' al botón y panel actual
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Cargar los médicos desde la base de datos
    cargarMedicos();
});

// Función para cargar los médicos desde la API
async function cargarMedicos() {
    try {
        console.log('Cargando médicos...');
        // Usar una ruta absoluta para evitar problemas de rutas relativas
        const response = await fetch('../api/obtener_medicos.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin' // Importante para manejar cookies si es necesario
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data && data.success) {
            mostrarMedicos(data.data || []);
        } else {
            const errorMsg = data?.error || 'Error desconocido al cargar los médicos';
            console.error('Error en la respuesta del servidor:', errorMsg);
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error('Error al cargar los médicos:', error);
        // Mostrar un mensaje de error más detallado en la consola
        console.error('Detalles del error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Mostrar un mensaje de error al usuario
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.style.color = 'red';
        errorContainer.style.padding = '10px';
        errorContainer.style.margin = '10px 0';
        errorContainer.style.border = '1px solid #ffcccc';
        errorContainer.style.borderRadius = '4px';
        errorContainer.textContent = `Error al cargar los médicos: ${error.message || 'Error desconocido'}`;
        
        // Insertar el mensaje de error al principio del contenedor principal
        const mainContainer = document.querySelector('main') || document.body;
        if (mainContainer.firstChild) {
            mainContainer.insertBefore(errorContainer, mainContainer.firstChild);
        } else {
            mainContainer.appendChild(errorContainer);
        }
    }
}


// Función para mostrar los médicos en la interfaz
function mostrarMedicos(medicos) {
    console.log('Mostrando médicos:', medicos);
    
    // Limpiar los contenedores de médicos
    Object.values(especialidadesMap).forEach(especialidadId => {
        const contenedor = document.getElementById(especialidadId);
        if (contenedor) {
            const doctoresGrid = contenedor.querySelector('.doctores-grid');
            if (doctoresGrid) {
                doctoresGrid.innerHTML = ''; // Limpiar contenido existente
            }
        }
    });

    // Verificar si hay médicos para mostrar
    if (!medicos || medicos.length === 0) {
        console.log('No hay médicos para mostrar');
        // Mostrar un mensaje en cada sección de especialidad
        Object.values(especialidadesMap).forEach(especialidadId => {
            const contenedor = document.getElementById(especialidadId);
            if (contenedor) {
                const doctoresGrid = contenedor.querySelector('.doctores-grid');
                if (doctoresGrid) {
                    doctoresGrid.innerHTML = '<p class="no-doctors">No hay médicos disponibles en esta especialidad.</p>';
                }
            }
        });
        return;
    }

    // Agregar cada médico a su respectiva especialidad
    medicos.forEach(medico => {
        // Usar el nombre de la especialidad de la consulta SQL (nombre_especialidad)
        const especialidadNombre = medico.nombre_especialidad || 'Sin especialidad';
        const especialidadId = especialidadesMap[especialidadNombre] || 'cardiologia';
        
        const contenedor = document.getElementById(especialidadId);
        
        if (contenedor) {
            const doctoresGrid = contenedor.querySelector('.doctores-grid');
            
            if (doctoresGrid) {
                const doctorCard = document.createElement('div');
                doctorCard.className = 'doctor-card';
                
                // Usar una imagen por defecto (puedes personalizar esto)
                const genero = Math.random() > 0.5 ? 'men' : 'women';
                const imagenUrl = `https://randomuser.me/api/portraits/${genero}/${Math.floor(Math.random() * 100)}.jpg`;
                
                // Determinar el estado (puedes ajustar esta lógica según tus necesidades)
                const estados = ['online', 'offline', 'away'];
                const estado = estados[Math.floor(Math.random() * estados.length)];
                
                // Obtener el consultorio si está disponible
                const consultorio = medico.consultorio ? `Consultorio: ${medico.consultorio}` : 'Consultorio no especificado';
                
                doctorCard.innerHTML = `
                    <div class="doctor-avatar">
                        <img src="${imagenUrl}" alt="${medico.nombres}">
                        <span class="status ${estado}"></span>
                    </div>
                    <h3>${medico.titulo || 'Dr.'} ${medico.nombres} ${medico.apellidos}</h3>
                    <p class="especialidad">${especialidadNombre}</p>
                    <p class="horario">${consultorio}</p>
                    <p class="cmp">CMP: ${medico.cmp || 'No disponible'}</p>
                    <p class="email">${medico.email || ''}</p>
                    <p class="telefono">${medico.telefono ? 'Tel: ' + medico.telefono : ''}</p>
                    <div class="doctor-actions">
                        <button class="btn btn-ver" data-id="${medico.id}">Ver Perfil</button>
                        <button class="btn btn-agendar" data-id="${medico.id}">Agendar Cita</button>
                    </div>
                `;
                
                doctoresGrid.appendChild(doctorCard);
            }
        } else {
            console.warn(`No se encontró el contenedor para la especialidad: ${especialidadNombre} (${especialidadId})`);
        }
    });
    
    // Agregar eventos a los botones de ver perfil y agendar cita
    document.querySelectorAll('.btn-ver').forEach(btn => {
        btn.addEventListener('click', function() {
            const medicoId = this.getAttribute('data-id');
            // Aquí puedes redirigir a la página de perfil del médico o mostrar un modal
            console.log('Ver perfil del médico:', medicoId);
        });
    });
    
    document.querySelectorAll('.btn-agendar').forEach(btn => {
        btn.addEventListener('click', function() {
            const medicoId = this.getAttribute('data-id');
            // Aquí puedes abrir un modal para agendar cita
            console.log('Agendar cita con el médico:', medicoId);
        });
    });
}