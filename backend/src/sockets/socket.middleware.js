import jwt from 'jsonwebtoken';

export const socketAuthMiddleware = (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;

    if (!token && socket.handshake.headers?.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token && socket.handshake.query?.token) {
      token = socket.handshake.query.token;
    }

    if (!token) {
      return next(new Error('Authentication error: Token is required to connect'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      fullname: decoded.fullname,
    };

    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid or expired token'));
  }
};

export default socketAuthMiddleware;
