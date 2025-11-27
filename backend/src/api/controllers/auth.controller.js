const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToRentalsDB } = require('../../config/db');
const { ObjectId } = require('mongodb'); 


const JWT_SECRET = process.env.JWT_SECRET || 'chave_super_secreta_padrao_dev';

async function register(req, res) {
  try {
    const db = await connectToRentalsDB();
    const usersCollection = db.collection('users');
    
    const { name, email, password, company } = req.body;

  
    const userExists = await usersCollection.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email já cadastrado." });
    }

 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      company,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

  
    const token = jwt.sign(
      { userId: result.insertedId.toString(), email }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      message: "Usuário criado com sucesso!", 
      token,
      user: { id: result.insertedId, name, email, company } 
    });

  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function login(req, res) {
  try {
    const db = await connectToRentalsDB();
    const usersCollection = db.collection('users');
    const { email, password } = req.body;

    // 1. Busca usuário
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Credenciais inválidas." });
    }

    // 2. Compara senhas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Credenciais inválidas." });
    }

    // 3. Gera Token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, company: user.company } 
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function getMe(req, res) {
    try {
        const db = await connectToRentalsDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne(
            { _id: new ObjectId(req.user.userId) },
            { projection: { password: 0 } } // Segurança: não retorna a senha
        );

        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        
        // Retorna dados do usuário para o frontend manter a sessão
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            company: user.company
        });
    } catch (error) {
        console.error("Erro no getMe:", error);
        res.status(500).json({ error: "Erro ao buscar usuário" });
    }
}

module.exports = { register, login, getMe };