const { connectToRentalsDB } = require('../../config/db');
const { ObjectId } = require('mongodb');

async function createRental(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');
    const newRental = req.body;
    
    // Insere o novo aluguel na coleção 'rentals'
    const result = await rentalsCollection.insertOne(newRental);

    res.status(201).json({
      message: "Aluguel criado com sucesso!",
      rentalId: result.insertedId,
      rental: newRental
    });

  } catch (error) {
    console.error("Erro ao salvar aluguel:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

async function getRentals(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');
    const rentals = await rentalsCollection.find({}).toArray();

    res.status(200).json(rentals);

  } catch (error) {
    console.error("Erro ao buscar aluguéis:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

async function updateRental(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');
    const { id } = req.params;
    const rentalAtualizado = req.body;

    const result = await rentalsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: rentalAtualizado }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Aluguel não encontrado." });
    }

    res.status(200).json({ message: "Aluguel atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar aluguel:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

async function deleteRental(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');
    const { id } = req.params;

    const result = await rentalsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Aluguel não encontrado." });
    }

    res.status(200).json({ message: "Aluguel excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar aluguel:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}


module.exports = {
  getRentals,
  createRental,
  updateRental,
  deleteRental
};
