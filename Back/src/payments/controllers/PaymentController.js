const Payment = require('../models/Payment');
const Trip = require('../../trips/models/Trip');
const { sendSuccess, sendError } = require('../../shared/utils/responseHelper');
const {
  validatePaymentAmount,
  validatePaymentMethod,
  calculatePlatformFee,
  calculateDriverEarnings,
  simulatePaymentProcessing,
  simulateRefundProcessing,
  canProcessRefund,
  formatPaymentForResponse,
  getPaymentSummary
} = require('../utils/paymentHelpers');

const createPayment = async (req, res) => {
  try {
    const { tripId, amount, paymentMethod, paymentDetails } = req.body;
    const userId = req.user.userId;

    // Verificar que el viaje existe y pertenece al usuario
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return sendError(res, 'Viaje no encontrado', 404);
    }

    if (trip.passengerId.toString() !== userId) {
      return sendError(res, 'No tienes permisos para pagar este viaje', 403);
    }

    if (trip.status !== 'completed') {
      return sendError(res, 'Solo se pueden pagar viajes completados', 400);
    }

    // Verificar si ya existe un pago para este viaje
    const existingPayment = await Payment.findOne({ tripId });
    if (existingPayment) {
      return sendError(res, 'Este viaje ya tiene un pago registrado', 400);
    }

    const payment = new Payment({
      tripId,
      passengerId: userId,
      driverId: trip.driverId,
      amount,
      paymentMethod,
      paymentDetails,
      status: 'pending'
    });

    const savedPayment = await payment.save();

    // Procesar el pago según el método
    let paymentResult;
    switch (paymentMethod) {
      case 'cash':
        paymentResult = await processCashPayment(savedPayment);
        break;
      case 'card':
        paymentResult = await processCardPayment(savedPayment, paymentDetails);
        break;
      case 'digital_wallet':
        paymentResult = await processDigitalWalletPayment(savedPayment, paymentDetails);
        break;
      default:
        return sendError(res, 'Método de pago no válido', 400);
    }

    // Actualizar el estado del pago
    savedPayment.status = paymentResult.success ? 'completed' : 'failed';
    savedPayment.transactionId = paymentResult.transactionId;
    savedPayment.processedAt = new Date();
    
    if (!paymentResult.success) {
      savedPayment.failureReason = paymentResult.error;
    }

    await savedPayment.save();

    // Actualizar el estado del pago en el viaje
    await Trip.findByIdAndUpdate(tripId, {
      paymentStatus: savedPayment.status
    });

    sendSuccess(res, savedPayment, 
      paymentResult.success ? 'Pago procesado exitosamente' : 'Error al procesar el pago',
      paymentResult.success ? 201 : 400
    );
  } catch (error) {
    sendError(res, error);
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { passengerId: userId };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('tripId', 'origin destination estimatedPrice finalPrice createdAt')
      .populate('driverId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    sendSuccess(res, {
      payments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }, 'Historial de pagos obtenido exitosamente');
  } catch (error) {
    sendError(res, error);
  }
};

const getDriverEarnings = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const { period = 'week' } = req.query;

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

    const payments = await Payment.find({
      driverId,
      status: 'completed',
      processedAt: { $gte: startDate }
    }).populate('tripId', 'origin destination createdAt');

    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalTrips = payments.length;

    // Calcular comisión de la plataforma (ejemplo: 20%)
    const platformFee = totalEarnings * 0.20;
    const netEarnings = totalEarnings - platformFee;

    const earnings = {
      period,
      totalEarnings,
      platformFee,
      netEarnings,
      totalTrips,
      averageEarningsPerTrip: totalTrips > 0 ? totalEarnings / totalTrips : 0,
      payments
    };

    sendSuccess(res, earnings, 'Ganancias obtenidas exitosamente');
  } catch (error) {
    sendError(res, error);
  }
};

const refundPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return sendError(res, 'Pago no encontrado', 404);
    }

    if (payment.status !== 'completed') {
      return sendError(res, 'Solo se pueden reembolsar pagos completados', 400);
    }

    // Procesar reembolso según el método de pago original
    let refundResult;
    switch (payment.paymentMethod) {
      case 'cash':
        refundResult = { success: true, refundId: `cash_refund_${Date.now()}` };
        break;
      case 'card':
        refundResult = await processCardRefund(payment);
        break;
      case 'digital_wallet':
        refundResult = await processDigitalWalletRefund(payment);
        break;
      default:
        return sendError(res, 'Método de pago no válido para reembolso', 400);
    }

    if (refundResult.success) {
      payment.status = 'refunded';
      payment.refundId = refundResult.refundId;
      payment.refundReason = reason;
      payment.refundedAt = new Date();
      await payment.save();

      sendSuccess(res, payment, 'Reembolso procesado exitosamente');
    } else {
      sendError(res, refundResult.error, 400);
    }
  } catch (error) {
    sendError(res, error);
  }
};

// Funciones auxiliares para procesar pagos
const processCashPayment = async (payment) => {
  // Para pagos en efectivo, se marca como completado inmediatamente
  return {
    success: true,
    transactionId: `cash_${payment._id}_${Date.now()}`
  };
};

const processCardPayment = async (payment, paymentDetails) => {
  // Aquí integrarías con un procesador de pagos como Stripe, PayPal, etc.
  // Por ahora simulamos el procesamiento
  try {
    // Simulación de procesamiento de tarjeta
    const success = Math.random() > 0.1; // 90% de éxito
    
    if (success) {
      return {
        success: true,
        transactionId: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Tarjeta declinada'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const processDigitalWalletPayment = async (payment, paymentDetails) => {
  // Aquí integrarías con billeteras digitales
  try {
    const success = Math.random() > 0.05; // 95% de éxito
    
    if (success) {
      return {
        success: true,
        transactionId: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Fondos insuficientes en la billetera'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const processCardRefund = async (payment) => {
  // Simulación de reembolso de tarjeta
  try {
    const success = Math.random() > 0.05; // 95% de éxito
    
    if (success) {
      return {
        success: true,
        refundId: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Error al procesar reembolso'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const processDigitalWalletRefund = async (payment) => {
  // Simulación de reembolso de billetera digital
  try {
    const success = Math.random() > 0.02; // 98% de éxito
    
    if (success) {
      return {
        success: true,
        refundId: `wallet_refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Error al procesar reembolso en billetera'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createPayment,
  getPaymentHistory,
  getDriverEarnings,
  refundPayment
};