//Define a estrutura de um agendamento de corte de cabelo ou barba (cliente, data, hora, serviço escolhido, preço).

const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Nome do cliente é obrigatório'],
    trim: true
  },
  clientPhone: {
    type: String,
    trim: true
  },
  service: {
    type: String,
    required: [true, 'Serviço é obrigatório'],
    enum: ['Corte Clássico', 'Barba Terapia', 'Cabelo e Barba', 'Sobrancelha Navallada', 'Tratamento Capilar']
  },
  date: {
    type: Date,
    required: [true, 'Data é obrigatória']
  },
  time: {
    type: String,
    required: [true, 'Horário é obrigatório']
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório']
  },
  status: {
    type: String,
    enum: ['Pendente', 'Confirmado', 'Finalizado', 'Cancelado'],
    default: 'Confirmado'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
