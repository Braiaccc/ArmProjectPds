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


const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:8080", 
  "https://arm-weld-gamma.vercel.app" 
];

app.use(cors({
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);

   
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


app.use(['/api/auth', '/auth'], authRoutes);


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