import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  stopOrder: {
    type: Number,
    required: true,
  },
  estimatedTimeFromStart: {
    type: Number, // in minutes
    default: 0,
  },
});

const routeSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: [true, 'Please provide route name'],
      trim: true,
    },
    routeNumber: {
      type: String,
      required: [true, 'Please provide route number'],
      unique: true,
      trim: true,
    },
    startPoint: {
      type: String,
      required: [true, 'Please provide start point'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Please provide destination point'],
      trim: true,
    },
    stops: [stopSchema],
    coordinates: {
      type: [[Number]], // Array of [lat, lng]
      default: [],
    },
    estimatedDuration: {
      type: Number, // in minutes
      required: [true, 'Please provide estimated duration in minutes'],
    },
  },
  {
    timestamps: true,
  }
);

const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);
export default Route;
