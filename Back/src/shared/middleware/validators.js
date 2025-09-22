const { sendError } = require('../utils/responseHelper');

const validateUser = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return sendError(res, 'Nombre, email, contraseña y teléfono son requeridos', 400);
  }

  if (name.trim().length < 2) {
    return sendError(res, 'El nombre debe tener al menos 2 caracteres', 400);
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return sendError(res, 'Email inválido', 400);
  }

  if (password.length < 6) {
    return sendError(res, 'La contraseña debe tener al menos 6 caracteres', 400);
  }

  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return sendError(res, 'Número de teléfono inválido', 400);
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 'Email y contraseña son requeridos', 400);
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return sendError(res, 'Email inválido', 400);
  }

  next();
};

const validateTrip = (req, res, next) => {
  const { origin, destination, tripType } = req.body;

  if (!origin || !destination) {
    return sendError(res, 'Origen y destino son requeridos', 400);
  }

  if (!origin.address || !origin.coordinates || !destination.address || !destination.coordinates) {
    return sendError(res, 'Direcciones y coordenadas completas son requeridas', 400);
  }

  if (!origin.coordinates.lat || !origin.coordinates.lng || 
      !destination.coordinates.lat || !destination.coordinates.lng) {
    return sendError(res, 'Coordenadas de latitud y longitud son requeridas', 400);
  }

  // Validar rango de coordenadas
  if (Math.abs(origin.coordinates.lat) > 90 || Math.abs(destination.coordinates.lat) > 90) {
    return sendError(res, 'Latitud debe estar entre -90 y 90 grados', 400);
  }

  if (Math.abs(origin.coordinates.lng) > 180 || Math.abs(destination.coordinates.lng) > 180) {
    return sendError(res, 'Longitud debe estar entre -180 y 180 grados', 400);
  }

  const validTripTypes = ['standard', 'premium', 'shared'];
  if (tripType && !validTripTypes.includes(tripType)) {
    return sendError(res, 'Tipo de viaje inválido. Tipos válidos: ' + validTripTypes.join(', '), 400);
  }

  // Validar que origen y destino no sean el mismo punto
  const distance = Math.sqrt(
    Math.pow(origin.coordinates.lat - destination.coordinates.lat, 2) +
    Math.pow(origin.coordinates.lng - destination.coordinates.lng, 2)
  );

  if (distance < 0.001) { // Aproximadamente 100 metros
    return sendError(res, 'El origen y destino deben ser diferentes', 400);
  }

  next();
};

const validateVehicle = (req, res, next) => {
  const { make, model, year, color, licensePlate, vehicleType } = req.body;

  if (!make || !model || !year || !color || !licensePlate) {
    return sendError(res, 'Marca, modelo, año, color y placa son requeridos', 400);
  }

  if (make.trim().length < 2) {
    return sendError(res, 'La marca debe tener al menos 2 caracteres', 400);
  }

  if (model.trim().length < 1) {
    return sendError(res, 'El modelo es requerido', 400);
  }

  const currentYear = new Date().getFullYear();
  if (year < 1990 || year > currentYear + 1) {
    return sendError(res, `El año debe estar entre 1990 y ${currentYear + 1}`, 400);
  }

  if (color.trim().length < 2) {
    return sendError(res, 'El color debe tener al menos 2 caracteres', 400);
  }

  if (licensePlate.trim().length < 3) {
    return sendError(res, 'La placa debe tener al menos 3 caracteres', 400);
  }

  const validVehicleTypes = ['sedan', 'suv', 'hatchback', 'pickup', 'van', 'motorcycle'];
  if (vehicleType && !validVehicleTypes.includes(vehicleType)) {
    return sendError(res, 'Tipo de vehículo inválido. Tipos válidos: ' + validVehicleTypes.join(', '), 400);
  }

  next();
};

const validatePayment = (req, res, next) => {
  const { tripId, amount, paymentMethod } = req.body;

  if (!tripId || !amount || !paymentMethod) {
    return sendError(res, 'ID del viaje, monto y método de pago son requeridos', 400);
  }

  if (amount <= 0) {
    return sendError(res, 'El monto debe ser mayor a 0', 400);
  }

  if (amount > 10000) { // Límite máximo de $10,000
    return sendError(res, 'El monto excede el límite máximo permitido', 400);
  }

  const validPaymentMethods = ['cash', 'card', 'digital_wallet'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return sendError(res, 'Método de pago inválido. Métodos válidos: ' + validPaymentMethods.join(', '), 400);
  }

  // Validaciones específicas por método de pago
  if (paymentMethod === 'card') {
    const { paymentDetails } = req.body;
    if (!paymentDetails || !paymentDetails.cardLast4 || !paymentDetails.cardBrand) {
      return sendError(res, 'Detalles de tarjeta son requeridos para pagos con tarjeta', 400);
    }
  }

  if (paymentMethod === 'digital_wallet') {
    const { paymentDetails } = req.body;
    if (!paymentDetails || !paymentDetails.walletType) {
      return sendError(res, 'Tipo de billetera es requerido para pagos con billetera digital', 400);
    }
  }

  next();
};

const validateCoordinates = (req, res, next) => {
  const { lat, lng } = req.body;

  if (lat === undefined || lng === undefined) {
    return sendError(res, 'Latitud y longitud son requeridas', 400);
  }

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return sendError(res, 'Latitud y longitud deben ser números', 400);
  }

  if (Math.abs(lat) > 90) {
    return sendError(res, 'Latitud debe estar entre -90 y 90 grados', 400);
  }

  if (Math.abs(lng) > 180) {
    return sendError(res, 'Longitud debe estar entre -180 y 180 grados', 400);
  }

  next();
};

const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return sendError(res, 'La página debe ser un número mayor a 0', 400);
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return sendError(res, 'El límite debe ser un número entre 1 y 100', 400);
  }

  next();
};

module.exports = {
  validateUser,
  validateLogin,
  validateTrip,
  validateVehicle,
  validatePayment,
  validateCoordinates,
  validatePagination
};