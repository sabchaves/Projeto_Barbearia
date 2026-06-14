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

const clientNames = [
  'Roberto Alencar', 'Carlos Santoro', 'Eduardo Costa', 'Julio Prestes', 
  'Arthur Nogueira', 'Lucas Lima', 'Diego Alcântara', 'Marcos Rangel', 
  'Gustavo Lima', 'Felipe Marques', 'Matheus Pereira', 'Rodrigo Faro',
  'Bruno Covas', 'Thiago Lacerda', 'Guilherme Briggs', 'Fabio Assunção',
  'Renato Aragão', 'Claudio Castro', 'Alexandre Frota', 'Neymar Junior',
  'Gabriel Barbosa', 'Everton Ribeiro', 'Giorgian Arrascaeta', 'Pedro Guilherme'
];

const servicesList = [
  { name: 'Corte Clássico', price: 50 },
  { name: 'Barba Terapia', price: 45 },
  { name: 'Cabelo e Barba', price: 85 },
  { name: 'Sobrancelha Navallada', price: 25 },
  { name: 'Tratamento Capilar', price: 120 }
];

const timesList = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

// Programmatically generate a rich set of 60 mock appointments spanning the last 30 days
let mockAppointments = [];

// Ensure we have some fixed today appointments
mockAppointments.push(
  {
    _id: 'mock-app-today-1',
    clientName: 'Roberto Alencar',
    clientPhone: '(11) 98765-4321',
    service: 'Corte Clássico',
    date: d(0),
    time: '09:00',
    price: 50,
    status: 'Finalizado',
    user: 'mock-admin-id'
  },
  {
    _id: 'mock-app-today-2',
    clientName: 'Carlos Santoro',
    clientPhone: '(11) 99876-5432',
    service: 'Cabelo e Barba',
    date: d(0),
    time: '14:00',
    price: 85,
    status: 'Confirmado',
    user: 'mock-admin-id'
  },
  {
    _id: 'mock-app-today-3',
    clientName: 'Lucas Lima',
    clientPhone: '(11) 91234-5678',
    service: 'Barba Terapia',
    date: d(0),
    time: '16:30',
    price: 45,
    status: 'Pendente',
    user: 'mock-admin-id'
  }
);

// Generate other randomized records spread over the past 30 days
for (let i = 0; i < 55; i++) {
  const dayOffset = Math.floor(Math.random() * 30); // 0 to 29 days ago
  if (dayOffset === 0) continue; // Skip today, already seeded
  
  const client = clientNames[Math.floor(Math.random() * clientNames.length)];
  const serviceObj = servicesList[Math.floor(Math.random() * servicesList.length)];
  const time = timesList[Math.floor(Math.random() * timesList.length)];
  
  let status = 'Finalizado';
  if (Math.random() < 0.08) {
    status = 'Cancelado';
  } else if (Math.random() < 0.05) {
    status = 'Confirmado';
  }

  mockAppointments.push({
    _id: `mock-app-${100 + i}`,
    clientName: client,
    clientPhone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    service: serviceObj.name,
    date: d(dayOffset),
    time: time,
    price: serviceObj.price,
    status: status,
    user: 'mock-admin-id'
  });
}

// Sort mock appointments by date ascending, then time
mockAppointments.sort((a, b) => {
  const dateDiff = new Date(a.date) - new Date(b.date);
  if (dateDiff !== 0) return dateDiff;
  return a.time.localeCompare(b.time);
});

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
