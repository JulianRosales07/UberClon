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

