const User = require('../../auth/models/User');
const Trip = require('../../trips/models/Trip');
const Vehicle = require('../models/Vehicle');
const { sendSuccess, sendError } = require('../../shared/utils/responseHelper');
const {
  calculateDriverRating,
  isDriverAvailable,
  calculateDriverEarnings,
  findNearbyDrivers,
  validateVehicleData,
  formatDriverForResponse,
  canAcceptTrip
} = require('../utils/driverHelpers');

const updateDriverStatus = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const driverId = req.user.userId;

    const driver = await User.findByIdAndUpdate(
      driverId,
      { 'driverInfo.isAvailable': isAvailable },
      { new: true }
    ).select('-password');

    if (!driver) {
      return sendError(res, 'Conductor no encontrado', 404);
    }

    sendSuccess(res, driver, `Estado del conductor actualizado: ${isAvailable ? 'Disponible' : 'No disponible'}`);
  } catch (error) {
    sendError(res, error);
  }
};

const updateDriverLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driverId = req.user.userId;

    if (!lat || !lng) {
      return sendError(res, 'Latitud y longitud son requeridas', 400);
    }

    const driver = await User.findByIdAndUpdate(
      driverId,
      { 
        'driverInfo.currentLocation': { lat, lng }
      },
      { new: true }
    ).select('-password');

    if (!driver) {
      return sendError(res, 'Conductor no encontrado', 404);
    }

    sendSuccess(res, driver.driverInfo.currentLocation, 'Ubicación actualizada exitosamente');
  } catch (error) {
    sendError(res, error);
  }
};

const getDriverStats = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const { period = 'week' } = req.query; // week, month, year

    // Calcular fecha de inicio según el período
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Obtener estadísticas del período
    const trips = await Trip.find({
      driverId,
      status: 'completed',
      completedAt: { $gte: startDate }
    });

    const totalTrips = trips.length;
    const totalEarnings = trips.reduce((sum, trip) => sum + (trip.finalPrice || 0), 0);
    const averageRating = await calculateDriverRating(driverId, Trip);

    // Obtener información general del conductor
    const driver = await User.findById(driverId)
      .select('name driverInfo')
      .populate('driverInfo.vehicleId');

    const stats = {
      period,
      totalTrips,
      totalEarnings,
      averageEarnings: totalTrips > 0 ? totalEarnings / totalTrips : 0,
      rating: averageRating,
      totalTripsAllTime: driver.driverInfo.totalTrips,
      totalEarningsAllTime: driver.driverInfo.totalEarnings,
      vehicle: driver.driverInfo.vehicleId
    };

    sendSuccess(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    sendError(res, error);
  }
};

const getDriverTrips = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { driverId };
    if (status) {
      query.status = status;
    }

    const trips = await Trip.find(query)
      .populate('passengerId', 'name phone profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trip.countDocuments(query);

    sendSuccess(res, {
      trips,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }, 'Viajes del conductor obtenidos exitosamente');
  } catch (error) {
    sendError(res, error);
  }
};

const registerVehicle = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const vehicleData = req.body;

    // Validar datos del vehículo
    const validation = validateVehicleData(vehicleData);
    if (!validation.isValid) {
      return sendError(res, validation.errors.join(', '), 400);
    }

    // Crear nuevo vehículo
    const vehicle = new Vehicle({
      driverId,
      ...vehicleData
    });

    const savedVehicle = await vehicle.save();

    // Actualizar referencia en el conductor
    await User.findByIdAndUpdate(driverId, {
      'driverInfo.vehicleId': savedVehicle._id
    });

    sendSuccess(res, savedVehicle, 'Vehículo registrado exitosamente', 201);
  } catch (error) {
    sendError(res, error);
  }
};

const updateVehicle = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const vehicleId = req.params.vehicleId;
    const updateData = req.body;

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: vehicleId, driverId },
      updateData,
      { new: true }
    );

    if (!vehicle) {
      return sendError(res, 'Vehículo no encontrado', 404);
    }

    sendSuccess(res, vehicle, 'Vehículo actualizado exitosamente');
  } catch (error) {
    sendError(res, error);
  }
};

const getNearbyDrivers = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // radius en km

    if (!lat || !lng) {
      return sendError(res, 'Latitud y longitud son requeridas', 400);
    }

    const drivers = await findNearbyDrivers(parseFloat(lat), parseFloat(lng), radius, User);

    sendSuccess(res, drivers, 'Conductores cercanos obtenidos exitosamente');
  } catch (error) {
    sendError(res, error);
  }
};



module.exports = {
  updateDriverStatus,
  updateDriverLocation,
  getDriverStats,
  getDriverTrips,
  registerVehicle,
  updateVehicle,
  getNearbyDrivers
};