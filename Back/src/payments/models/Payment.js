const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    unique: true
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'MXN', 'COP', 'ARS']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'card', 'digital_wallet']
  },
  paymentDetails: {
    // Para tarjetas
    cardLast4: String,
    cardBrand: String,
    
    // Para billeteras digitales
    walletType: String,
    walletAccount: String,
    
    // Información general
    description: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  processedAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  // Campos para reembolsos
  refundId: {
    type: String,
    default: null
  },
  refundReason: {
    type: String,
    default: null
  },
  refundedAt: {
    type: Date,
    default: null
  },
  // Comisiones
  platformFee: {
    type: Number,
    default: 0
  },
  driverEarnings: {
    type: Number,
    default: 0
  },
  // Metadata adicional
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String
  }
}, {
  timestamps: true
});

// Índices
paymentSchema.index({ passengerId: 1 });
paymentSchema.index({ driverId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Índice compuesto para consultas de historial
paymentSchema.index({ passengerId: 1, createdAt: -1 });
paymentSchema.index({ driverId: 1, createdAt: -1 });

// Middleware pre-save para calcular comisiones
paymentSchema.pre('save', function(next) {
  if (this.isModified('amount') && this.status === 'completed') {
    // Calcular comisión de la plataforma (20%)
    this.platformFee = this.amount * 0.20;
    this.driverEarnings = this.amount - this.platformFee;
  }
  next();
});

// Método virtual para obtener el monto neto del conductor
paymentSchema.virtual('netDriverEarnings').get(function() {
  return this.amount - this.platformFee;
});

// Método para verificar si el pago puede ser reembolsado
paymentSchema.methods.canBeRefunded = function() {
  return this.status === 'completed' && !this.refundedAt;
};

// Método estático para obtener estadísticas de pagos
paymentSchema.statics.getPaymentStats = async function(driverId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        driverId: mongoose.Types.ObjectId(driverId),
        status: 'completed',
        processedAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalPlatformFee: { $sum: '$platformFee' },
        totalDriverEarnings: { $sum: '$driverEarnings' },
        totalPayments: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);

  return stats[0] || {
    totalAmount: 0,
    totalPlatformFee: 0,
    totalDriverEarnings: 0,
    totalPayments: 0,
    averageAmount: 0
  };
};

module.exports = mongoose.model('Payment', paymentSchema);