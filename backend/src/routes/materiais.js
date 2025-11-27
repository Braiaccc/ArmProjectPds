const express = require('express');
const router = express.Router();
const materiaisController = require('../api/controllers/materiais.controller');

router.get('/', materiaisController.getMateriais);

router.post('/', materiaisController.createMaterial);

router.put('/:id', materiaisController.updateMaterial);

router.delete('/:id', materiaisController.deleteMaterial);

module.exports = router;
