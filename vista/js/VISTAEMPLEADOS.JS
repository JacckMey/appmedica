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

    // Generar datos de ejemplo para los doctores
    generarDoctoresEjemplo();
});

// Función para generar datos de ejemplo de doctores
function generarDoctoresEjemplo() {
    const especialidades = {
        pediatria: 'Pediatra',
        dermatologia: 'Dermatólogo',
        ginecologia: 'Ginecólogo',
        oftalmologia: 'Oftalmólogo',
        ortopedia: 'Ortopedista'
    };

    // Generar doctores para cada especialidad
    for (const [especialidadId, titulo] of Object.entries(especialidades)) {
        const contenedor = document.getElementById(especialidadId);
        if (!contenedor) continue;
        
        const doctoresGrid = contenedor.querySelector('.doctores-grid');
        if (!doctoresGrid) continue;
        
        // Generar entre 5 y 7 doctores por especialidad
        const cantidadDoctores = Math.floor(Math.random() * 3) + 5; // 5-7 doctores
        
        for (let i = 0; i < cantidadDoctores; i++) {
            const genero = Math.random() > 0.5 ? 'men' : 'women';
            const idFoto = Math.floor(Math.random() * 99) + 1;
            const estados = ['online', 'offline', 'away'];
            const estado = estados[Math.floor(Math.random() * estados.length)];
            const horarios = [
                'Lun-Vie: 8:00 AM - 4:00 PM',
                'Lun-Vie: 9:00 AM - 5:00 PM',
                'Lun-Vie: 10:00 AM - 6:00 PM',
                'Lun-Vie: 7:00 AM - 3:00 PM'
            ];
            const horario = horarios[Math.floor(Math.random() * horarios.length)];
            
            const doctorCard = document.createElement('div');
            doctorCard.className = 'doctor-card';
            doctorCard.innerHTML = `
                <div class="doctor-avatar">
                    <img src="https://randomuser.me/api/portraits/${genero}/${idFoto}.jpg" alt="Doctor">
                    <span class="status ${estado}"></span>
                </div>
                <h3>Dr. ${generarNombreAleatorio()}</h3>
                <p class="especialidad">${titulo}</p>
                <p class="horario">${horario}</p>
                <div class="doctor-actions">
                    <button class="btn btn-ver">Ver Perfil</button>
                    <button class="btn btn-agendar">Agendar Cita</button>
                </div>
            `;
            
            doctoresGrid.appendChild(doctorCard);
        }
    }
}

// Función auxiliar para generar nombres aleatorios
function generarNombreAleatorio() {
    const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofía', 'Andrés', 'Valentina'];
    const apellidos = ['Pérez', 'González', 'Rodríguez', 'López', 'Martínez', 'García', 'Sánchez', 'Romero', 'Torres', 'Flores'];
    
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
    
    return `${nombre} ${apellido}`;
}