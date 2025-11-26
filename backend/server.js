require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToRentalsDB } = require('../backend/src/config/db');
const { connectToMateriaisDB } = require('../backend/src/config/dbMateriais');

// ✅ Importações de Autenticação ajustadas para os arquivos criados
const authRoutes = require('./src/routes/auth'); 
const verifyToken = require('./src/middleware/auth.middleware'); // Nome do arquivo ajustado

const rentalsRouter = require('./src/routes/rentals');
const materiaisRouter = require('./src/routes/materiais');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Rotas públicas (Login/Registro não precisam de token)
// O prefixo será /api/auth para manter consistência
app.use('/api/auth', authRoutes);

// ✅ Middleware de proteção global para rotas /api
// ATENÇÃO: Isso protege TUDO abaixo de /api. 
// Como a rota de auth está em /api/auth, precisamos garantir que o middleware ignore ela,
// OU declaramos a rota de auth ANTES de aplicar o middleware nas outras (como fiz acima).
// Porém, se você usar app.use('/api', verifyToken), ele vai interceptar /api/materiais e /api/rentals.
// Mas se /api/auth também começar com /api, ela pode ser interceptada se estiver abaixo.
// Como defini app.use('/api/auth'...) ANTES, o Express resolve ela primeiro se for match exato, 
// mas para garantir, vou aplicar o middleware especificamente nas rotas privadas abaixo.

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

// ✅ Aplicando segurança nas rotas privadas
// O middleware verifyToken garante que req.user.userId esteja disponível
app.use('/api/materiais', verifyToken, materiaisRouter);
app.use('/api/rentals', verifyToken, rentalsRouter);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});