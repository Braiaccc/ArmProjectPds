const { connectToRentalsDB } = require('../../config/db');
const { ObjectId } = require('mongodb');

/**
 * Retorna as estatísticas do Dashboard baseadas apenas nos dados do usuário logado.
 */
async function getDashboardStats(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');
    
    // ID do usuário vindo do Token JWT (Middleware)
    const userId = req.user.userId;
    const hoje = new Date();

    // Helper de filtro de data para reutilizar lógica
    // Lógica: Se dataDevolucao existe, converte para Date, senão usa data zero.
    const dateConversionLogic = {
      $toDate: {
        $cond: [
          { $and: [{ $ne: ["$dataDevolucao", ""] }, { $ne: ["$dataDevolucao", null] }] },
          "$dataDevolucao",
          new Date(0) // Data fallback
        ]
      }
    };

    // 1. Total Ativos (userId + status ativo + data >= hoje)
    const totalActive = await rentalsCollection.countDocuments({
      userId: userId, // 🔒 Segurança
      status: "ativo",
      $expr: { $gte: [dateConversionLogic, hoje] }
    });

    // 2. Total Atrasados (userId + data < hoje)
    const totalLate = await rentalsCollection.countDocuments({
      userId: userId, // 🔒 Segurança
      $expr: { $lt: [dateConversionLogic, hoje] }
    });

    // 3. Em Dia (userId + pago + data >= hoje)
    const totalOnTime = await rentalsCollection.countDocuments({
      userId: userId, // 🔒 Segurança
      pagamento: "pago",
      $expr: { $gte: [dateConversionLogic, hoje] }
    });

    // 4. Pagamento Pendente (userId + pendente/parcial + data >= hoje)
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

/**
 * Retorna aluguéis recentes válidos do usuário.
 */
async function getRecentRentals(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');
    const userId = req.user.userId;
    const hoje = new Date();

    const recentRentals = await rentalsCollection
      .find({
        userId: userId, // 🔒 Segurança: Apenas do usuário
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
      .sort({ _id: -1 }) // Mais recentes primeiro
      .limit(10) // Boas práticas: limitar retorno recente
      .toArray();

    return res.status(200).json(recentRentals);

  } catch (error) {
    console.error("Erro ao buscar aluguéis recentes:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

/**
 * Cria um novo aluguel vinculado ao usuário logado.
 */
async function createRental(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');
    
    const newRental = req.body;
    
    // 🔒 Segurança: Vincula o documento ao dono do token
    newRental.userId = req.user.userId;
    newRental.createdAt = new Date(); // Auditabilidade

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

/**
 * Busca todos os aluguéis (apenas do usuário logado).
 */
async function getRentals(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');

    // 🔒 Segurança: Filtra pelo userId do token
    const rentals = await rentalsCollection.find({ userId: req.user.userId }).toArray();

    res.status(200).json(rentals);

  } catch (error) {
    console.error("Erro ao buscar aluguéis:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

/**
 * Atualiza um aluguel existente (se pertencer ao usuário).
 */
async function updateRental(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');
    const { id } = req.params;
    const updateData = req.body;

    // 🔒 Segurança: Evita alteração de dono ou id
    delete updateData._id;
    delete updateData.userId;

    const result = await rentalsCollection.updateOne(
      { 
        _id: new ObjectId(id),
        userId: req.user.userId // 🔒 Garante que só o dono edita
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

/**
 * Remove um aluguel (se pertencer ao usuário).
 */
async function deleteRental(req, res) {
  try {
    const db = await connectToRentalsDB();
    const rentalsCollection = db.collection('rentals');
    const { id } = req.params;

    const result = await rentalsCollection.deleteOne({ 
      _id: new ObjectId(id),
      userId: req.user.userId // 🔒 Garante que só o dono deleta
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