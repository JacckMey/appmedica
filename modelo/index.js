const mysql = require('mysql2');

function conectarBD() {
  const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'appmedica'
  });

  conexion.connect((err) => {
    if (err) {
      console.error('❌ Error al conectar a la BD:', err);
      setTimeout(conectarBD, 2000); // Reintentar en 2 segundos
    } else {
      console.log('✅ Conectado a la base de datos appmedica');
    }
  });

  // Si se pierde la conexión
  conexion.on('error', (err) => {
    console.error('⚠️ Error en conexión MySQL:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      conectarBD();
    } else {
      throw err;
    }
  });

  return conexion;
}

const conexion = conectarBD();
module.exports = conexion;
