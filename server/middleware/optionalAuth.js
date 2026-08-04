import jwt from 'jsonwebtoken';

// Attaches req.user if a valid token is present, but never blocks the request.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    // ignore invalid token, treat as anonymous
  }
  next();
};

export default optionalAuth;
