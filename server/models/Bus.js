import mongoose from 'mongoose';

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Please provide bus number'],
      unique: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Please provide vehicle registration number'],
      trim: true,
    },
    driverName: {
      type: String,
      required: [true, 'Please provide driver name'],
      trim: true,
    },
    driverPhone: {
      type: String,
      required: [true, 'Please provide driver phone number'],
      trim: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    currentLocation: {
      lat: {
        type: Number,
        required: true,
        default: 12.9716, // Default fallback coordinates (e.g. Bangalore campus)
      },
      lng: {
        type: Number,
        required: true,
        default: 77.5946,
      },
    },
    status: {
      type: String,
      enum: ['On Time', 'Delayed', 'Arriving', 'Inactive'],
      default: 'On Time',
    },
    speed: {
      type: Number,
      default: 35, // km/h
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Bus = mongoose.models.Bus || mongoose.model('Bus', busSchema);
export default Bus;
