const { connectToRentalsDB } = require('../../config/db');
const { ObjectId } = require('mongodb');

async function getDashboardStats(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');

    // Agora conta apenas aluguéis cujo prazo ainda está válido (dataDevolucao >= hoje)
    const hoje = new Date();

    // total de aluguéis em andamento (status ativo) e ainda não vencidos
    const totalActive = await rentalsCollection.countDocuments({
      $expr: {
        $and: [
          {
            $gte: [
              {
                $cond: [
                  { $and: [{ $ne: ["$dataDevolucao", ""] }, { $ne: ["$dataDevolucao", null] }] },
                  { $toDate: "$dataDevolucao" },
                  new Date(0)
                ]
              },
              hoje
            ]
          },
          { $eq: ["$status", "ativo"] }
        ]
      }
    });

    // total de aluguéis atrasados (dataDevolucao < hoje)
    const totalLate = await rentalsCollection.countDocuments({
      $expr: {
        $lt: [
          {
            $cond: [
              { $and: [{ $ne: ["$dataDevolucao", ""] }, { $ne: ["$dataDevolucao", null] }] },
              { $toDate: "$dataDevolucao" },
              new Date(0)
            ]
          },
          hoje
        ]
      }
    });

    // Em Dia: aluguéis cujo prazo ainda está válido e pagamento está marcado como 'pago'
    const totalOnTime = await rentalsCollection.countDocuments({
      $expr: {
        $and: [
          {
            $gte: [
              {
                $cond: [
                  { $and: [{ $ne: ["$dataDevolucao", ""] }, { $ne: ["$dataDevolucao", null] }] },
                  { $toDate: "$dataDevolucao" },
                  new Date(0)
                ]
              },
              hoje
            ]
          },
          { $eq: ["$pagamento", "pago"] }
        ]
      }
    });

    // Pagamentos pendentes: ainda no prazo e com pagamento pendente ou parcial
    const totalPendingPayment = await rentalsCollection.countDocuments({
      $expr: {
        $and: [
          {
            $gte: [
              {
                $cond: [
                  { $and: [{ $ne: ["$dataDevolucao", ""] }, { $ne: ["$dataDevolucao", null] }] },
                  { $toDate: "$dataDevolucao" },
                  new Date(0)
                ]
              },
              hoje
            ]
          },
          { $in: ["$pagamento", ["pendente", "parcial"]] }
        ]
      }
    });

    return res.status(200).json({
      active: totalActive,
      late: totalLate,
      onTime: totalOnTime,
      pendingPayment: totalPendingPayment
    });

  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}


async function getRecentRentals(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');

    const hoje = new Date();

    // Busca TODOS os aluguéis cujo prazo ainda está válido (sem limite)
    const recentRentals = await rentalsCollection
      .find({
        $expr: {
          $gte: [
            {
              $cond: [
                { $and: [{ $ne: ["$dataDevolucao", ""] }, { $ne: ["$dataDevolucao", null] }] },
                { $toDate: "$dataDevolucao" },
                new Date(0)
              ]
            },
            hoje
          ]
        }
      })
      .sort({ _id: -1 })
      .toArray();

    return res.status(200).json(recentRentals);

  } catch (error) {
    console.error("Erro ao buscar aluguéis recentes:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}


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
  deleteRental,
  getDashboardStats,      
  getRecentRentals        
};

