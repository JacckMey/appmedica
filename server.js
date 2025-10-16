// Importamos dependencias
const express = require('express');
const path = require('path');

// Creamos la app
const app = express();

// Configuramos el puerto
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'vista')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'vista', 'index.html'));
});

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
