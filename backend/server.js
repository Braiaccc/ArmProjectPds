require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToRentalsDB } = require('../backend/src/config/db');
const { connectToMateriaisDB } = require('../backend/src/config/dbMateriais');

const authRoutes = require('./src/routes/auth');
const verifyToken = require('./src/middleware/auth.middleware');

const rentalsRouter = require('./src/routes/rentals');
const materiaisRouter = require('./src/routes/materiais');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORREÇÃO DE CORS: Permitir explicitamente a Vercel e Localhost
app.use(cors({
  origin: [
    "http://localhost:5173", // Seu frontend local
    "https://arm-weld-gamma.vercel.app", // Sua URL na Vercel
    "https://arm-weld-gamma.vercel.app/" // As vezes o browser manda com barra
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Rotas públicas
app.use('/api/auth', authRoutes);

// Conectar ao MongoDB
Promise.all([
  connectToRentalsDB(),
  connectToMateriaisDB()
]).then(() => {
  console.log('Servidor conectado a ambos os bancos de dados.');
}).catch(err => {
  console.error('Erro na conexão com o MongoDB:', err);
  process.exit(1);
});

// Rotas privadas protegidas
app.use('/api/materiais', verifyToken, materiaisRouter);
app.use('/api/rentals', verifyToken, rentalsRouter);

// Rota de teste para verificar se a API está no ar
app.get('/', (req, res) => {
  res.send('API ARM rodando com sucesso!');
});

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});