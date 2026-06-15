//Este arquivo define os caminhos de URL para gerenciar a agenda da barbearia (criar, listar e deletar cortes).

const express = require('express');
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getWeeklyReports
} = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');

// Mount protect middleware on all appointment routes
router.use(protect);

// Routes
router.get('/', getAppointments);
router.post('/', createAppointment);
router.get('/stats', getWeeklyReports); // Must be before /:id to prevent Express from routing stats as ID
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;
