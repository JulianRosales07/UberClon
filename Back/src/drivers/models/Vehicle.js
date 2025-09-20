const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: [true, 'La marca del vehículo es requerida'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'El modelo del vehículo es requerido'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'El año del vehículo es requerido'],
    min: 1990,
    max: new Date().getFullYear() + 1
  },
  color: {
    type: String,
    required: [true, 'El color del vehículo es requerido'],
    trim: true
  },
  licensePlate: {
    type: String,
    required: [true, 'La placa del vehículo es requerida'],
    unique: true,
    uppercase: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['sedan', 'suv', 'hatchback', 'pickup', 'van', 'motorcycle'],
    default: 'sedan'
  },
  capacity: {
    type: Number,
    default: 4,
    min: 1,
    max: 8
  },
  isActive: {
    type: Boolean,
    default: true
  },
  documents: {
    registration: {
      url: String,
      expiryDate: Date,
      verified: {
        type: Boolean,
        default: false
      }
    },
    insurance: {
      url: String,
      expiryDate: Date,
      verified: {
        type: Boolean,
        default: false
      }
    },
    inspection: {
      url: String,
      expiryDate: Date,
      verified: {
        type: Boolean,
        default: false
      }
    }
  },
  features: [{
    type: String,
    enum: ['air_conditioning', 'bluetooth', 'gps', 'child_seat', 'wheelchair_accessible', 'pet_friendly']
  }],
  photos: [{
    url: String,
    description: String
  }]
}, {
  timestamps: true
});

// Índices
vehicleSchema.index({ driverId: 1 });
vehicleSchema.index({ isActive: 1 });

// Método virtual para obtener el nombre completo del vehículo
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Método para verificar si todos los documentos están verificados
vehicleSchema.methods.isFullyVerified = function() {
  return this.documents.registration.verified && 
         this.documents.insurance.verified && 
         this.documents.inspection.verified;
};

module.exports = mongoose.model('Vehicle', vehicleSchema); 