require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToRentalsDB } = require('../backend/src/config/db');
const { connectToMateriaisDB } = require('../backend/src/config/dbMateriais');
const rentalsRouter = require('./src/routes/rentals');
const materiaisRouter = require('./src/routes/materiais');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB para os dois bancos de dados
Promise.all([
  connectToRentalsDB(),
  connectToMateriaisDB()
]).then(() => {
  console.log('Servidor conectado a ambos os bancos de dados.');
}).catch(err => {
  console.error('Erro na conexão com o MongoDB:', err);
  process.exit(1);
});

// Rotas da API
// Rota para o backend de materiais
app.use('/api/materiais', materiaisRouter);
// Rota para o backend de aluguéis
app.use('/api/rentals', rentalsRouter);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
