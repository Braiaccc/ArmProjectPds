const { ObjectId } = require('mongodb');
const { connectToMateriaisDB } = require('../../config/dbMateriais');

// ✅ Busca todos os materiais do usuário logado
async function getMateriais(req, res) {
  try {
    const db = await connectToMateriaisDB();
    const materiaisCollection = db.collection('materiais');
    
    const materiais = await materiaisCollection.find({ userId: req.user.userId }).toArray();
    
    res.status(200).json(materiais);
  } catch (error) {
    console.error("Erro ao buscar materiais:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

// ✅ Buscar categorias
async function getCategorias(req, res) {
  try {
    const db = await connectToMateriaisDB();
    const materiaisCollection = db.collection('materiais');
    const categorias = await materiaisCollection.distinct("categoria", { userId: req.user.userId });
    res.status(200).json(categorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({ error: "Erro interno." });
  }
}

// ✅ Cria novo material
async function createMaterial(req, res) {
  try {
    const db = await connectToMateriaisDB();
    const materiaisCollection = db.collection('materiais');
    const newMaterial = req.body;

    newMaterial.userId = req.user.userId;
    newMaterial.createdAt = new Date();
    
    // CORREÇÃO: Permite 0. Se for undefined ou não número, aí sim usa 1.
    const qtd = Number(newMaterial.quantidade);
    newMaterial.quantidade = isNaN(qtd) ? 1 : qtd; 

    const result = await materiaisCollection.insertOne(newMaterial);

    res.status(201).json({
      message: "Material criado com sucesso!",
      materialId: result.insertedId,
      material: newMaterial
    });
  } catch (error) {
    console.error("Erro ao salvar material:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

// ✅ Atualiza material
async function updateMaterial(req, res) {
  try {
    const db = await connectToMateriaisDB();
    const materiaisCollection = db.collection('materiais');
    const { id } = req.params;
    const updateData = req.body;

    delete updateData._id;
    delete updateData.userId;

    // CORREÇÃO: Garante update correto da quantidade (inclusive 0)
    if (updateData.quantidade !== undefined) {
        updateData.quantidade = Number(updateData.quantidade);
    }

    const result = await materiaisCollection.updateOne(
      { _id: new ObjectId(id), userId: req.user.userId }, 
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Material not found or access denied' });
    }

    res.status(200).json({ message: 'Material updated successfully' });
  } catch (error) {
    console.error("Erro ao atualizar material:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

// ✅ Deleta material
async function deleteMaterial(req, res) {
  try {
    const db = await connectToMateriaisDB();
    const materiaisCollection = db.collection('materiais');
    const { id } = req.params;

    const result = await materiaisCollection.deleteOne({ 
      _id: new ObjectId(id),
      userId: req.user.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Material not found or access denied' });
    }

    res.status(200).json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error("Erro ao excluir material:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

module.exports = {
  getMateriais,
  getCategorias,
  createMaterial,
  updateMaterial,
  deleteMaterial
};