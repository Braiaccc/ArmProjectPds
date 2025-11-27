// backend/src/models/Rental.js
const { ObjectId } = require('mongodb');


const RentalModel = {
  id: String,
  cliente: String,
  materiais: [String],
  dataRetirada: String,
  dataDevolucao: String,
  dataRealDevolucao: String,
  status: String,
  pagamento: String,
  valor: Number,
  diasAtraso: Number
};

module.exports = RentalModel;