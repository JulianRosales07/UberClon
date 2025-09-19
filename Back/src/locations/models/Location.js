const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  house_number: String,
  road: String,
  neighbourhood: String,
  suburb: String,
  city: String,
  state: String,
  postcode: String,
  country: String,
  country_code: String
});

const locationSchema = new mongoose.Schema({
  place_id: {
    type: String,
    required: true,
    unique: true
  },
  display_name: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lon: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  type: String,
  importance: Number,
  address: addressSchema,
  // Campos adicionales para el cache local
  search_count: {
    type: Number,
    default: 0
  },
  last_searched: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
locationSchema.index({ lat: 1, lon: 1 });
locationSchema.index({ 'address.city': 1 });
locationSchema.index({ 'address.state': 1 });
locationSchema.index({ display_name: 'text' });

// Método para incrementar el contador de búsquedas
locationSchema.methods.incrementSearchCount = function() {
  this.search_count += 1;
  this.last_searched = new Date();
  return this.save();
};

// Método estático para buscar ubicaciones cercanas
locationSchema.statics.findNearby = function(lat, lon, maxDistance = 10) {
  return this.find({
    lat: {
      $gte: lat - (maxDistance / 111), // Aproximadamente 1 grado = 111 km
      $lte: lat + (maxDistance / 111)
    },
    lon: {
      $gte: lon - (maxDistance / (111 * Math.cos(lat * Math.PI / 180))),
      $lte: lon + (maxDistance / (111 * Math.cos(lat * Math.PI / 180)))
    }
  });
};

// Método estático para las ubicaciones más buscadas
locationSchema.statics.getMostSearched = function(limit = 10) {
  return this.find()
    .sort({ search_count: -1 })
    .limit(limit);
};

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;