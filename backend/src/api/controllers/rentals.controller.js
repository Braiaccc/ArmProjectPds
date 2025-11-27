const { connectToRentalsDB } = require('../../config/db');
const { ObjectId } = require('mongodb');


async function getDashboardStats(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');
    
    
    const userId = req.user.userId;
    const hoje = new Date();

    
    const dateConversionLogic = {
      $toDate: {
        $cond: [
          { $and: [{ $ne: ["$dataDevolucao", ""] }, { $ne: ["$dataDevolucao", null] }] },
          "$dataDevolucao",
          new Date(0) 
        ]
      }
    };

    
    const totalActive = await rentalsCollection.countDocuments({
      userId: userId, // 🔒 Segurança
      status: "ativo",
      $expr: { $gte: [dateConversionLogic, hoje] }
    });

   
    const totalLate = await rentalsCollection.countDocuments({
      userId: userId, // 🔒 Segurança
      $expr: { $lt: [dateConversionLogic, hoje] }
    });

    
    const totalOnTime = await rentalsCollection.countDocuments({
      userId: userId, // 🔒 Segurança
      pagamento: "pago",
      $expr: { $gte: [dateConversionLogic, hoje] }
    });

    
    const totalPendingPayment = await rentalsCollection.countDocuments({
      userId: userId, // 🔒 Segurança
      pagamento: { $in: ["pendente", "parcial"] },
      $expr: { $gte: [dateConversionLogic, hoje] }
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
    const userId = req.user.userId;
    const hoje = new Date();

    const recentRentals = await rentalsCollection
      .find({
        userId: userId, 
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
      .limit(20) 
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
    
  
    newRental.userId = req.user.userId;
    newRental.createdAt = new Date(); 

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

    const rentals = await rentalsCollection.find({ userId: req.user.userId }).toArray();

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
    const updateData = req.body;

    delete updateData._id;
    delete updateData.userId;

    const result = await rentalsCollection.updateOne(
      { 
        _id: new ObjectId(id),
        userId: req.user.userId 
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Aluguel não encontrado ou acesso negado." });
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

    const result = await rentalsCollection.deleteOne({ 
      _id: new ObjectId(id),
      userId: req.user.userId 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Aluguel não encontrado ou acesso negado." });
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