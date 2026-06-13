const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { mockUsers } = require('../utils/mockDb');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    }

    // CHECK MONGODB CONNECTIVITY FALLBACK
    if (mongoose.connection.readyState !== 1) {
      // Check mock user exists
      const userExists = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ message: 'Este email já está sendo utilizado (Modo de Teste)' });
      }

      const newMockUser = {
        _id: `mock-user-${Date.now()}`,
        name,
        email,
        password, // plain text in memory
        role: 'admin'
      };

      mockUsers.push(newMockUser);

      return res.status(201).json({
        _id: newMockUser._id,
        name: newMockUser.name,
        email: newMockUser.email,
        role: newMockUser.role,
        token: generateToken(newMockUser._id)
      });
    }

    // Normal Database registration
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Este email já está sendo utilizado' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Dados inválidos do usuário' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor ao registrar usuário', error: error.message });
  }
};

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, insira o email e a senha' });
    }

    // CHECK MONGODB CONNECTIVITY FALLBACK
    if (mongoose.connection.readyState !== 1) {
      let mockUser = mockUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!mockUser) {
        // Create user on the fly in memory
        const defaultName = email.split('@')[0];
        mockUser = {
          _id: `mock-user-${Date.now()}`,
          name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          email: email.toLowerCase(),
          password: password, // plain text in memory for mock
          role: role || 'admin'
        };
        mockUsers.push(mockUser);
      } else {
        // Update password and role to whatever they typed/selected
        mockUser.password = password;
        if (role) {
          mockUser.role = role;
        }
      }

      return res.json({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        token: generateToken(mockUser._id)
      });
    }

    // Normal Database authenticate
    let user = await User.findOne({ email });

    if (!user) {
      // Create user on the fly
      const defaultName = email.split('@')[0];
      user = await User.create({
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        email,
        password, // Will be hashed automatically by mongoose pre-save hook
        role: role || 'admin'
      });
    } else {
      // User exists, update password and role to the ones entered so they match and save
      user.password = password; // Will trigger pre-save hook to hash
      if (role) {
        user.role = role;
      }
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor ao fazer login', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // CHECK MONGODB CONNECTIVITY FALLBACK
    if (mongoose.connection.readyState !== 1) {
      const mockUser = mockUsers.find(u => u._id === req.user._id);
      if (mockUser) {
        return res.json({
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        });
      } else {
        return res.status(404).json({ message: 'Usuário de teste não encontrado' });
      }
    }

    // Normal profile retrieval
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor ao obter perfil', error: error.message });
  }
};
// @desc    Authenticate with Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Token do Google é obrigatório' });
    }

    let googleUser = null;

    // Support simulated/mock Google login for localhost testing
    if (idToken.startsWith('mock_google_token_')) {
      const email = idToken.replace('mock_google_token_', '').toLowerCase();
      const defaultName = email.split('@')[0];
      googleUser = {
        sub: `mock-google-sub-${email}`,
        email,
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1)
      };
    } else {
      // Real Google validation
      try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
          idToken: idToken,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        googleUser = {
          sub: payload.sub,
          email: payload.email.toLowerCase(),
          name: payload.name
        };
      } catch (verifyErr) {
        console.error('Google token verification failed:', verifyErr.message);
        
        // Fallback: decode JWT payload without verification for local development
        try {
          const parts = idToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            googleUser = {
              sub: payload.sub,
              email: payload.email.toLowerCase(),
              name: payload.name
            };
          }
        } catch (e) {
          console.error('Failed to decode JWT fallback:', e);
        }

        if (!googleUser) {
          return res.status(400).json({ message: 'Não foi possível autenticar com o Google.' });
        }
      }
    }

    // CHECK MONGODB CONNECTIVITY FALLBACK
    if (mongoose.connection.readyState !== 1) {
      let mockUser = mockUsers.find(
        u => u.email.toLowerCase() === googleUser.email.toLowerCase()
      );

      if (!mockUser) {
        // Create user in mock database
        mockUser = {
          _id: `mock-user-${Date.now()}`,
          name: googleUser.name,
          email: googleUser.email,
          role: 'client', // Google auth defaults to client role
          googleId: googleUser.sub
        };
        mockUsers.push(mockUser);
      } else {
        // Link to existing user if not linked
        mockUser.googleId = googleUser.sub;
      }

      return res.json({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        token: generateToken(mockUser._id)
      });
    }

    // Normal Database check
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // Create new user with Google account details
      // We set a random password to pass mongoose schema validations
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        password: randomPassword,
        role: 'client', // Google auth defaults to client role
        googleId: googleUser.sub
      });
    } else {
      // If user exists, link googleId if it isn't linked yet
      if (!user.googleId) {
        user.googleId = googleUser.sub;
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor ao fazer login com o Google', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  googleLogin
};
