// Mock In-Memory Database Fallback
// This allows the app to be fully functional out of the box even if MongoDB is not connected.

const mockUsers = [
  {
    _id: 'mock-admin-id',
    name: 'Mestre Cabeludo (Modo de Teste)',
    email: 'admin@cabeludos.com',
    password: 'admin123', // plain text for simplicity in mock
    role: 'admin'
  }
];

const today = new Date();
const d = (offsetDays) => {
  const date = new Date(today);
  date.setDate(today.getDate() - offsetDays);
  date.setHours(0, 0, 0, 0);
  return date;
};

let mockAppointments = [
  {
    _id: 'mock-app-1',
    clientName: 'Roberto Alencar',
    clientPhone: '(11) 98765-4321',
    service: 'Corte Clássico',
    date: d(0), // Today
    time: '09:00',
    price: 50,
    status: 'Finalizado',
    user: 'mock-admin-id'
  },
  {
    _id: 'mock-app-2',
    clientName: 'Carlos Santoro',
    clientPhone: '(11) 99876-5432',
    service: 'Cabelo e Barba',
    date: d(0), // Today
    time: '14:00',
    price: 85,
    status: 'Confirmado',
    user: 'mock-admin-id'
  },
  {
    _id: 'mock-app-3',
    clientName: 'Eduardo Costa',
    clientPhone: '(11) 97654-3210',
    service: 'Barba Terapia',
    date: d(1), // Yesterday
    time: '10:30',
    price: 45,
    status: 'Finalizado',
    user: 'mock-admin-id'
  },
  {
    _id: 'mock-app-4',
    clientName: 'Julio Prestes',
    clientPhone: '(21) 98888-7777',
    service: 'Sobrancelha Navallada',
    date: d(2), // 2 days ago
    time: '16:00',
    price: 25,
    status: 'Finalizado',
    user: 'mock-admin-id'
  },
  {
    _id: 'mock-app-5',
    clientName: 'Arthur Nogueira',
    clientPhone: '(11) 93333-2222',
    service: 'Tratamento Capilar',
    date: d(3), // 3 days ago
    time: '11:00',
    price: 120,
    status: 'Finalizado',
    user: 'mock-admin-id'
  },
  {
    _id: 'mock-app-6',
    clientName: 'Lucas Lima',
    clientPhone: '(11) 91234-5678',
    service: 'Barba Terapia',
    date: d(0), // Today
    time: '16:30',
    price: 45,
    status: 'Pendente',
    user: 'mock-admin-id'
  }
];

module.exports = {
  mockUsers,
  mockAppointments,
  
  // Helpers
  getAppointments: (search, status) => {
    let list = [...mockAppointments];
    if (search) {
      const regex = new RegExp(search, 'i');
      list = list.filter(app => regex.test(app.clientName) || regex.test(app.service));
    }
    if (status) {
      list = list.filter(app => app.status === status);
    }
    // Sort by date ascending, then time
    return list.sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      return a.time.localeCompare(b.time);
    });
  },

  createAppointment: (data, userId) => {
    const newApp = {
      _id: `mock-app-${Date.now()}`,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      service: data.service,
      date: new Date(data.date),
      time: data.time,
      price: Number(data.price),
      status: data.status || 'Confirmado',
      user: userId
    };
    mockAppointments.push(newApp);
    return newApp;
  },

  updateAppointment: (id, data) => {
    const app = mockAppointments.find(a => a._id === id);
    if (!app) return null;
    
    if (data.clientName) app.clientName = data.clientName;
    if (data.clientPhone !== undefined) app.clientPhone = data.clientPhone;
    if (data.service) app.service = data.service;
    if (data.date) app.date = new Date(data.date);
    if (data.time) app.time = data.time;
    if (data.price !== undefined) app.price = Number(data.price);
    if (data.status) app.status = data.status;
    
    return app;
  },

  deleteAppointment: (id) => {
    const initialLength = mockAppointments.length;
    mockAppointments = mockAppointments.filter(a => a._id !== id);
    return mockAppointments.length !== initialLength;
  },

  getStats: () => {
    const totalAppointments = mockAppointments.length;
    const totalRevenue = mockAppointments
      .filter(app => app.status === 'Finalizado' || app.status === 'Confirmado')
      .reduce((sum, app) => sum + app.price, 0);

    const pendingCount = mockAppointments.filter(app => app.status === 'Pendente').length;
    const confirmedCount = mockAppointments.filter(app => app.status === 'Confirmado').length;
    const completedCount = mockAppointments.filter(app => app.status === 'Finalizado').length;
    const cancelledCount = mockAppointments.filter(app => app.status === 'Cancelado').length;

    // Weekly Revenue By Day
    const weeklyRevenueByDay = [
      { dayName: 'Dom', revenue: 0, count: 0 },
      { dayName: 'Seg', revenue: 0, count: 0 },
      { dayName: 'Ter', revenue: 0, count: 0 },
      { dayName: 'Qua', revenue: 0, count: 0 },
      { dayName: 'Qui', revenue: 0, count: 0 },
      { dayName: 'Sex', revenue: 0, count: 0 },
      { dayName: 'Sáb', revenue: 0, count: 0 }
    ];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    mockAppointments.forEach(app => {
      const appDate = new Date(app.date);
      if (appDate >= sevenDaysAgo) {
        const dayIndex = appDate.getDay();
        if (app.status === 'Confirmado' || app.status === 'Finalizado') {
          weeklyRevenueByDay[dayIndex].revenue += app.price;
        }
        weeklyRevenueByDay[dayIndex].count += 1;
      }
    });

    // Service Distribution
    const serviceDistribution = {};
    mockAppointments.forEach(app => {
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

    return {
      summary: {
        totalAppointments,
        totalRevenue,
        pendingCount,
        confirmedCount,
        completedCount,
        cancelledCount
      },
      weeklyRevenueByDay,
      servicesDistribution: Object.values(serviceDistribution).sort((a, b) => b.count - a.count)
    };
  }
};
