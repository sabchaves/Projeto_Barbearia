//Ele intercepta a requisição do usuário e verifica se ele tem um token JWT válido. 
// Se o usuário não estiver logado, o middleware barra o acesso e não deixa ele ver dados sensíveis da barbearia.


const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const { mockUsers } = require('../utils/mockDb');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // CHECK MONGODB CONNECTIVITY FALLBACK
      if (mongoose.connection.readyState !== 1) {
        const mockUser = mockUsers.find(u => u._id === decoded.id);
        if (!mockUser) {
          return res.status(401).json({ message: 'Acesso negado. Usuário de teste não encontrado.' });
        }
        req.user = mockUser;
        return next();
      }

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Acesso negado. Usuário não encontrado.' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Acesso negado. Token inválido.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Acesso negado. Sem token de autorização.' });
  }
};

module.exports = { protect };
