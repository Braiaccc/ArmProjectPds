const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI_RENTALS || "mongodb://localhost:27017/rentalsdb";
const client = new MongoClient(uri);

async function connectToRentalsDB() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
        console.log("Conectado ao MongoDB (Rentals)!");
    }
    return client.db();
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB (Rentals):", error);
    process.exit(1);
  }
}

module.exports = { connectToRentalsDB, client };