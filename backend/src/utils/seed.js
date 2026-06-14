const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    const connString = process.env.MONGODB_URI;
    console.log('Conectando ao banco para executar o seed...');
    await mongoose.connect(connString);
    console.log('MongoDB Conectado para Seed.');

    // Clean current collection data
    console.log('Limpando coleções antigas...');
    await User.deleteMany();
    await Appointment.deleteMany();

    // Create a default administrator user
    console.log('Criando usuário administrador padrão...');
    const adminUser = await User.create({
      name: 'Mestre Cabeludo',
      email: 'admin@cabeludos.com',
      password: 'admin123' // Will be hashed via pre-save hook
    });

    console.log(`Administrador criado: ${adminUser.email}`);

    // Generate dates relative to today
    const today = new Date();
    
    const d = (offsetDays) => {
      const date = new Date(today);
      date.setDate(today.getDate() - offsetDays);
      // Keep date only to avoid time zone drift during raw date matching
      date.setHours(0, 0, 0, 0);
      return date;
    };

    console.log('Populando dados de agendamentos fictícios...');
    
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

    const seedAppointments = [];

    // Ensure some fixed today/tomorrow appointments exist
    seedAppointments.push(
      {
        clientName: 'Roberto Alencar',
        clientPhone: '(11) 98765-4321',
        service: 'Corte Clássico',
        date: d(0),
        time: '09:00',
        price: 50,
        status: 'Finalizado',
        user: adminUser._id
      },
      {
        clientName: 'Carlos Santoro',
        clientPhone: '(11) 99876-5432',
        service: 'Cabelo e Barba',
        date: d(0),
        time: '14:00',
        price: 85,
        status: 'Confirmado',
        user: adminUser._id
      },
      {
        clientName: 'Lucas Lima',
        clientPhone: '(11) 91234-5678',
        service: 'Barba Terapia',
        date: d(0),
        time: '16:30',
        price: 45,
        status: 'Pendente',
        user: adminUser._id
      },
      {
        clientName: 'Gustavo Lima',
        clientPhone: '(11) 96543-1289',
        service: 'Corte Clássico',
        date: d(-1), // Tomorrow
        time: '10:00',
        price: 50,
        status: 'Confirmado',
        user: adminUser._id
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

      seedAppointments.push({
        clientName: client,
        clientPhone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        service: serviceObj.name,
        date: d(dayOffset),
        time: time,
        price: serviceObj.price,
        status: status,
        user: adminUser._id
      });
    }

    await Appointment.insertMany(seedAppointments);
    console.log('Banco de dados semeado com sucesso!');
    console.log('\nUse estas credenciais para logar:');
    console.log('Email: admin@cabeludos.com');
    console.log('Senha: admin123');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Erro ao rodar seed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
