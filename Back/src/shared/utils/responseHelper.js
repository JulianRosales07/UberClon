const sendSuccess = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, error, statusCode = 500) => {
  const errorMessage = typeof error === 'string' ? error : error.message || 'Error interno del servidor';
  
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString()
  });
};

const sendPaginatedResponse = (res, data, pagination, message = 'Datos obtenidos exitosamente') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString()
  });
};

const sendValidationError = (res, errors) => {
  res.status(400).json({
    success: false,
    error: 'Errores de validación',
    details: errors,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
  sendValidationError
};