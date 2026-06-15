//É o ponto de entrada do servidor. É o arquivo principal que liga 
// o Express, define a porta (ex: 5000), conecta as rotas e coloca o backend para rodar.

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for local testing convenience
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.send('API da Barbearia Cabeludo\'s está ativa e rodando com sucesso.');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Ocorreu um erro interno no servidor',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em modo de desenvolvimento na porta ${PORT}`);
  console.log(`Acesse a API em: http://localhost:${PORT}/`);
});
