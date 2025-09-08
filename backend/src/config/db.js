const { MongoClient } = require('mongodb');

// URL de conexão com o seu banco de dados MongoDB
const uri = "mongodb://localhost:27017/rentalsdb";
const client = new MongoClient(uri);

async function connectToRentalsDB() {
  try {
    await client.connect();
    console.log("Conectado ao MongoDB!");
    return client.db();
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1); // Encerra a aplicação em caso de erro
  }
}

module.exports = { connectToRentalsDB, client };
