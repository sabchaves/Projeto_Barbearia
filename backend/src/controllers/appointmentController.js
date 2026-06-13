const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const mockDb = require('../utils/mockDb');

// @desc    Get all user appointments with search and filter
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { search, status } = req.query;

    // CHECK MONGODB CONNECTIVITY FALLBACK
    if (mongoose.connection.readyState !== 1) {
      const appointments = mockDb.getAppointments(search, status);
      if (req.user.role === 'client') {
        return res.json(appointments.filter(app => app.user === req.user._id));
      }
      return res.json(appointments);
    }
    
    // Base query: only show appointments created by the logged-in user if client, show all if admin
    let query = {};
    if (req.user.role === 'client') {
      query.user = req.user._id;
    }

    // Apply Search Filter
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply Status Filter
    if (status) {
      query.status = status;
    }

    // Get appointments sorted by date (ascending) and time
    const appointments = await Appointment.find(query).sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error: error.message });
  }
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { clientName, clientPhone, service, date, time, price, status } = req.body;

    if (!clientName || !service || !date || !time || !price) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios' });
    }

    // CHECK MONGODB CONNECTIVITY FALLBACK
    if (mongoose.connection.readyState !== 1) {
      const newApp = mockDb.createAppointment(req.body, req.user._id);
      return res.status(201).json(newApp);
    }

    // Check conflict (same date, time, and user/barber)
    const conflict = await Appointment.findOne({
      user: req.user._id,
      date: new Date(date),
      time: time,
      status: { $ne: 'Cancelado' }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Conflito de horário! Já existe um agendamento para este momento.' });
    }

    const appointment = await Appointment.create({
      clientName,
      clientPhone,
      service,
      date,
      time,
      price,
      status: status || 'Confirmado',
      user: req.user._id
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar agendamento', error: error.message });
  }
};

// @desc    Update an appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const { clientName, clientPhone, service, date, time, price, status } = req.body;

    // CHECK MONGODB CONNECTIVITY FALLBACK
    if (mongoose.connection.readyState !== 1) {
      const updatedApp = mockDb.updateAppointment(req.params.id, req.body);
      if (!updatedApp) {
        return res.status(404).json({ message: 'Agendamento de teste não encontrado' });
      }
      return res.json(updatedApp);
    }

    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Check ownership
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Não autorizado a alterar este agendamento' });
    }

    // Check conflict if changing date/time
    if (date && time && (new Date(date).getTime() !== appointment.date.getTime() || time !== appointment.time)) {
      const conflict = await Appointment.findOne({
        _id: { $ne: req.params.id },
        user: req.user._id,
        date: new Date(date),
        time: time,
        status: { $ne: 'Cancelado' }
      });

      if (conflict) {
        return res.status(400).json({ message: 'Conflito de horário! Já existe um agendamento para este momento.' });
      }
    }

    // Update fields
    appointment.clientName = clientName || appointment.clientName;
    appointment.clientPhone = clientPhone !== undefined ? clientPhone : appointment.clientPhone;
    appointment.service = service || appointment.service;
    appointment.date = date ? new Date(date) : appointment.date;
    appointment.time = time || appointment.time;
    appointment.price = price !== undefined ? price : appointment.price;
    appointment.status = status || appointment.status;

    const updatedAppointment = await appointment.save();

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar agendamento', error: error.message });
  }
};

// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    // CHECK MONGODB CONNECTIVITY FALLBACK
    if (mongoose.connection.readyState !== 1) {
      const deleted = mockDb.deleteAppointment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Agendamento de teste não encontrado' });
      }
      return res.json({ message: 'Agendamento de teste removido com sucesso' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Check ownership
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Não autorizado a excluir este agendamento' });
    }

    await appointment.deleteOne();

    res.json({ message: 'Agendamento removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir agendamento', error: error.message });
  }
};

// @desc    Get dashboard metrics & weekly report statistics
// @route   GET /api/appointments/stats
// @access  Private
const getWeeklyReports = async (req, res) => {
  try {
    if (req.user.role === 'client') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem acessar relatórios.' });
    }

    // CHECK MONGODB CONNECTIVITY FALLBACK
    if (mongoose.connection.readyState !== 1) {
      const stats = mockDb.getStats();
      return res.json(stats);
    }

    const userId = req.user._id;

    // Get all user appointments
    const appointments = await Appointment.find({ user: userId });

    // 1. Total Metrics
    const totalAppointments = appointments.length;
    const totalRevenue = appointments
      .filter(app => app.status === 'Finalizado' || app.status === 'Confirmado')
      .reduce((sum, app) => sum + app.price, 0);

    const pendingCount = appointments.filter(app => app.status === 'Pendente').length;
    const confirmedCount = appointments.filter(app => app.status === 'Confirmado').length;
    const completedCount = appointments.filter(app => app.status === 'Finalizado').length;
    const cancelledCount = appointments.filter(app => app.status === 'Cancelado').length;

    // 2. Revenue per day of week (Sunday = 0 to Saturday = 6)
    const weeklyRevenueByDay = [
      { dayName: 'Dom', revenue: 0, count: 0 },
      { dayName: 'Seg', revenue: 0, count: 0 },
      { dayName: 'Ter', revenue: 0, count: 0 },
      { dayName: 'Qua', revenue: 0, count: 0 },
      { dayName: 'Qui', revenue: 0, count: 0 },
      { dayName: 'Sex', revenue: 0, count: 0 },
      { dayName: 'Sáb', revenue: 0, count: 0 }
    ];

    // Filter appointments from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    appointments.forEach(app => {
      const appDate = new Date(app.date);
      if (appDate >= sevenDaysAgo) {
        const dayIndex = appDate.getDay();
        if (app.status === 'Confirmado' || app.status === 'Finalizado') {
          weeklyRevenueByDay[dayIndex].revenue += app.price;
        }
        weeklyRevenueByDay[dayIndex].count += 1;
      }
    });

    // 3. Appointments by Service
    const serviceDistribution = {};
    appointments.forEach(app => {
      if (serviceDistribution[app.service]) {
        serviceDistribution[app.service].count += 1;
        serviceDistribution[app.service].revenue += app.price;
      } else {
        serviceDistribution[app.service] = {
          serviceName: app.service,
          count: 1,
          revenue: app.price
        };
      }
    });

    const services = Object.values(serviceDistribution).sort((a, b) => b.count - a.count);

    res.json({
      summary: {
        totalAppointments,
        totalRevenue,
        pendingCount,
        confirmedCount,
        completedCount,
        cancelledCount
      },
      weeklyRevenueByDay,
      servicesDistribution: services
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar relatórios estatísticos', error: error.message });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getWeeklyReports
};
