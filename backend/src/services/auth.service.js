import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const AuthService = {
  hashPassword: async (password) => {
    return bcrypt.hash(password, 10);
  },

  comparePassword: async (password, hash) => {
    return bcrypt.compare(password, hash);
  },

  generateToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
  },

  verifyToken: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  },
};

export default AuthService;
