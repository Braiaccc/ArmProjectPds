const express = require('express');
const router = express.Router();
const rentalsController = require('../api/controllers/rentals.controller');

// Rotas CRUD de Aluguéis
router.post('/', rentalsController.createRental);
router.get('/', rentalsController.getRentals);
router.put('/:id', rentalsController.updateRental);
router.delete('/:id', rentalsController.deleteRental);
// 2) Rota para estatísticas do Dashboard
router.get('/stats/dashboard', rentalsController.getDashboardStats);
// 4) Rota para aluguéis recentes
router.get('/recent', rentalsController.getRecentRentals);


module.exports = router;
