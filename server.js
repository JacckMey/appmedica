// Importamos Express
const express = require('express');

// Creamos la app
const app = express();

// Definimos el puerto (puedes cambiarlo si quieres)
const PORT = 3000;

// Middleware para servir los archivos estáticos (tu carpeta vista)
app.use(express.static('vista'));

// Ruta principal (solo para probar que funciona)
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente 🚀');
});

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
