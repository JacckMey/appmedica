const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger para ver qué llega
app.use((req, _res, next) => {
  console.log('>>', req.method, req.url);
  next();
});

app.use(express.static(path.join(__dirname, 'vista')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'vista', 'index.html'));
});

// Monta el router EN RAÍZ explícitamente
const usuarioRouter = require('./controlador/usuario.controller');
app.use('/', usuarioRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
