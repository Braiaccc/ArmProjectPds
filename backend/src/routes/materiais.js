const express = require('express');
const router = express.Router();
const materiaisController = require('../api/controllers/materiais.controller');

// GET all materials
router.get('/', materiaisController.getMateriais);

// POST a new material
router.post('/', materiaisController.createMaterial);

// PUT (update) an existing material
router.put('/:id', materiaisController.updateMaterial);

// DELETE a material
router.delete('/:id', materiaisController.deleteMaterial);

module.exports = router;
