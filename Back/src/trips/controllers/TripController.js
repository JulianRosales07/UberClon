const Trip = require("../models/Trip");
const User = require("../../auth/models/User");
const { sendSuccess, sendError } = require("../../shared/utils/responseHelper");
const {
    validateTripCoordinates,
    calculateTripEstimates,
    generateTripCode,
    canCancelTrip,
    isValidStatusTransition,
    formatTripForResponse
} = require("../utils/tripHelpers");

const createTripRequest = async (req, res) => {
    try {
        const {
            origin,
            destination,
            tripType = "standard",
            scheduledTime,
            notes,
        } = req.body;
        // Validar coordenadas
        validateTripCoordinates(origin, destination);

        // Calcular estimaciones del viaje
        const estimates = calculateTripEstimates(origin, destination, tripType);

        const tripData = {
            passengerId: req.user.userId,
            origin,
            destination,
            tripType,
            estimatedPrice: estimates.estimatedPrice,
            estimatedDistance: estimates.distance,
            estimatedDuration: estimates.estimatedTime,
            scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
            notes,
            status: "pending",
        };

        const newTrip = new Trip(tripData);
        const savedTrip = await newTrip.save();

        // Poblar información del pasajero
        await savedTrip.populate("passengerId", "name phone profileImage");

        sendSuccess(res, savedTrip, "Solicitud de viaje creada exitosamente", 201);
    } catch (error) {
        sendError(res, error, 400);
    }
};

const getTripsByPassenger = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = { passengerId: req.user.userId };

        if (status) {
            query.status = status;
        }

        const trips = await Trip.find(query)
            .populate(
                "driverId",
                "name phone profileImage driverInfo.rating driverInfo.vehicleId"
            )
            .populate({
                path: "driverId",
                populate: {
                    path: "driverInfo.vehicleId",
                    model: "Vehicle",
                },
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Trip.countDocuments(query);

        sendSuccess(
            res,
            {
                trips,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                },
            },
            "Viajes obtenidos exitosamente"
        );
    } catch (error) {
        sendError(res, error);
    }
};
const getAvailableTrips = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query; // radius en km

        let query = { status: "pending" };

        // Si se proporcionan coordenadas, filtrar por proximidad
        if (lat && lng) {
            query["origin.coordinates"] = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: radius * 1000, // convertir km a metros
                },
            };
        }

        const trips = await Trip.find(query)
            .populate("passengerId", "name phone profileImage")
            .sort({ createdAt: -1 })
            .limit(20);

        sendSuccess(res, trips, "Viajes disponibles obtenidos exitosamente");
    } catch (error) {
        sendError(res, error);
    }
};
