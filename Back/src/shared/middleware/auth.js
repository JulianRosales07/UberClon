const jwt = require('jsonwebtoken');
const User = require('../../auth/models/User');
const { sendError } = require('../utils/responseHelper');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return sendError(res, 'Token de acceso requerido', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe y está activo
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return sendError(res, 'Usuario no válido o inactivo', 401);
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Token inválido', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expirado', 401);
    }
    return sendError(res, 'Error de autenticación', 401);
  }
};

const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Usuario no autenticado', 401);
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return sendError(res, `Acceso denegado. Se requiere rol: ${requiredRole}`, 403);
    }

    next();
  };
};

const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Usuario no autenticado', 401);
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
      return sendError(res, `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`, 403);
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          role: decoded.role
        };
      }
    }

    next();
  } catch (error) {
    // Si hay error en el token opcional, continúa sin usuario
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireRoles,
  optionalAuth
};