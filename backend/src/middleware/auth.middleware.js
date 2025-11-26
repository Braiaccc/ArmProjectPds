const jwt = require('jsonwebtoken');

// Garante a mesma chave usada no controller
const JWT_SECRET = process.env.JWT_SECRET || 'chave_super_secreta_padrao_dev';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Log para depuração (Verifique isso no terminal do backend quando der erro)
  // console.log("--> [AuthMiddleware] Header recebido:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("--> [AuthMiddleware] Erro: Cabeçalho ausente ou formato errado");
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token || token === 'undefined' || token === 'null') {
    console.log("--> [AuthMiddleware] Erro: Token é 'undefined' ou 'null'");
    return res.status(403).json({ error: 'Token inválido (formato incorreto).' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("--> [AuthMiddleware] Erro ao verificar token:", error.message);
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = verifyToken;