const { ObjectId } = require('mongodb');
const { connectToMateriaisDB } = require('../../config/dbMateriais');

async function getMateriais(req, res) {
  try {
    const db = await connectToMateriaisDB();
    const materiaisCollection = db.collection('materiais');
    const materiais = await materiaisCollection.find({}).toArray();
    res.status(200).json(materiais);
  } catch (error) {
    console.error("Erro ao buscar materiais:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

async function createMaterial(req, res) {
  try {
    const db = await connectToMateriaisDB();
    const materiaisCollection = db.collection('materiais');
    const newMaterial = req.body;
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

async function updateMaterial(req, res) {
  try {
    const db = await connectToMateriaisDB();
    const materiaisCollection = db.collection('materiais');
    const { id } = req.params;
    const updateData = req.body;

    // Remove o _id para evitar erros de imutabilidade
    delete updateData._id;

    const result = await materiaisCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.status(200).json({ message: 'Material updated successfully' });
  } catch (error) {
    console.error("Erro ao atualizar material:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

async function deleteMaterial(req, res) {
  try {
    const db = await connectToMateriaisDB();
    const materiaisCollection = db.collection('materiais');
    const { id } = req.params;

    const result = await materiaisCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.status(200).json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error("Erro ao excluir material:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

module.exports = {
  getMateriais,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
