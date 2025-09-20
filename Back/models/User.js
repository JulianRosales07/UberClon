const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es requerido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['passenger', 'driver', 'admin'],
    default: 'passenger'
  },
  profileImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Campos específicos para conductores
  driverInfo: {
    licenseNumber: String,
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    isAvailable: {
      type: Boolean,
      default: false
    },
    currentLocation: {
      lat: Number,
      lng: Number
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    totalTrips: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indices para mejorar performance
userSchema.index({ role: 1});
userSchema.index({ 'driverInfo.isAvailable': 1});

module.exports = mongoose.model('User', userSchema);