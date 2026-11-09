import jwt from 'jsonwebtoken';

export const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'buspulse_super_secret_jwt_key_2026';
  return jwt.sign({ id, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};
