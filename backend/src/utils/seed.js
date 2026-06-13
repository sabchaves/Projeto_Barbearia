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
    
    const seedAppointments = [
      {
        clientName: 'Roberto Alencar',
        clientPhone: '(11) 98765-4321',
        service: 'Corte Clássico',
        date: d(0), // Today
        time: '09:00',
        price: 50,
        status: 'Finalizado',
        user: adminUser._id
      },
      {
        clientName: 'Carlos Santoro',
        clientPhone: '(11) 99876-5432',
        service: 'Cabelo e Barba',
        date: d(0), // Today
        time: '14:00',
        price: 85,
        status: 'Confirmado',
        user: adminUser._id
      },
      {
        clientName: 'Eduardo Costa',
        clientPhone: '(11) 97654-3210',
        service: 'Barba Terapia',
        date: d(1), // Yesterday
        time: '10:30',
        price: 45,
        status: 'Finalizado',
        user: adminUser._id
      },
      {
        clientName: 'Julio Prestes',
        clientPhone: '(21) 98888-7777',
        service: 'Sobrancelha Navallada',
        date: d(2), // 2 days ago
        time: '16:00',
        price: 25,
        status: 'Finalizado',
        user: adminUser._id
      },
      {
        clientName: 'Arthur Nogueira',
        clientPhone: '(11) 93333-2222',
        service: 'Tratamento Capilar',
        date: d(3), // 3 days ago
        time: '11:00',
        price: 120,
        status: 'Finalizado',
        user: adminUser._id
      },
      {
        clientName: 'Felipe Marques',
        clientPhone: '(19) 97412-5632',
        service: 'Cabelo e Barba',
        date: d(4), // 4 days ago
        time: '15:30',
        price: 85,
        status: 'Finalizado',
        user: adminUser._id
      },
      {
        clientName: 'Matheus Pereira',
        clientPhone: '(11) 98523-6471',
        service: 'Corte Clássico',
        date: d(5), // 5 days ago
        time: '18:00',
        price: 50,
        status: 'Finalizado',
        user: adminUser._id
      },
      {
        clientName: 'Rodrigo Faro',
        clientPhone: '(11) 99999-8888',
        service: 'Corte Clássico',
        date: d(6), // 6 days ago
        time: '13:00',
        price: 50,
        status: 'Finalizado',
        user: adminUser._id
      },
      {
        clientName: 'Lucas Lima',
        clientPhone: '(11) 91234-5678',
        service: 'Barba Terapia',
        date: d(0), // Today
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
    ];

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
