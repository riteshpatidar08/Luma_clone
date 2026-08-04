import jwt from 'jsonwebtoken';

export const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '7d' }
  );
