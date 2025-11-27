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

// ✅ LISTA DE ORIGENS PERMITIDAS (Frontend)
const allowedOrigins = [
  "http://localhost:5173", // Vite padrão
  "http://localhost:8080", // 👈 ADICIONADO: Sua porta atual
  "https://arm-weld-gamma.vercel.app" // Vercel produção
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origem (como Postman, Mobile Apps ou Server-to-Server)
    if (!origin) return callback(null, true);

    // Verifica se a origem está na lista fixa OU se é um subdomínio vercel.app
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log("Bloqueado pelo CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Rotas públicas (aceita com ou sem prefixo /api)
app.use(['/api/auth', '/auth'], authRoutes);

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
app.use(['/api/materiais', '/materiais'], verifyToken, materiaisRouter);
app.use(['/api/rentals', '/rentals'], verifyToken, rentalsRouter);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API ARM rodando com sucesso!');
});

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});