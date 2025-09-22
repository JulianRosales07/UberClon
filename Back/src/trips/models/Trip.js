const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    passengerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    origin: {
        address: {
            type: String,
            required: true
        },
        coordinates: {
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        }
    },
    destination: {
        address: {
            type: String,
            required: true
        },
        coordinates: {
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        }
    },
    estimatedPrice: {
        type: Number,
        required: true
    },
    finalPrice: {
        type: Number,
        default: null
    },
    estimatedDistance: {
        type: Number, // en kilómetros
        default: null
    },
    estimatedDuration: {
        type: Number, // en minutos
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    tripType: {
        type: String,
        enum: ['standard', 'premium', 'shared'],
        default: 'standard'
    },
    scheduledTime: {
        type: Date,
        default: null
    },
    acceptedAt: {
        type: Date,
        default: null
    },
    startedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancellationReason: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        maxlength: 500
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'digital_wallet'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});