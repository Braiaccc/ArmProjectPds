const express = require('express');
const router = express.Router();
const rentalsController = require('../api/controllers/rentals.controller');

// Rotas CRUD de Aluguéis
router.post('/', rentalsController.createRental);
router.get('/', rentalsController.getRentals);
router.put('/:id', rentalsController.updateRental);
router.delete('/:id', rentalsController.deleteRental);

module.exports = router;
