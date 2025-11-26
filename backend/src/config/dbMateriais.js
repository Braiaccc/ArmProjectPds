const { MongoClient } = require('mongodb');

// Usa a variável de ambiente na nuvem OU localhost se estiver no seu PC
const uri = process.env.MONGO_URI_MATERIAIS || "mongodb://localhost:27017/aluguel_materiais";
const client = new MongoClient(uri);

async function connectToMateriaisDB() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
        console.log("Conectado ao MongoDB (Materiais)!");
    }
    return client.db();
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB (Materiais):", error);
    process.exit(1);
  }
}

module.exports = { connectToMateriaisDB, client };