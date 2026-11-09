import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';
import Notification from '../models/Notification.js';
import { seedRoutes, seedBuses, seedUsers, seedNotifications } from './seedData.js';

dotenv.config();

const seedDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/buspulse';
  try {
    console.log(`Connecting to MongoDB at: ${mongoURI}...`);
    await mongoose.connect(mongoURI);
    console.log('Connected! Purging existing collections...');

    await User.deleteMany();
    await Bus.deleteMany();
    await Route.deleteMany();
    await Notification.deleteMany();

    console.log('Inserting Routes...');
    await Route.insertMany(seedRoutes);

    console.log('Hashing passwords and inserting Users...');
    const hashedUsers = await Promise.all(
      seedUsers.map(async (u) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        return {
          ...u,
          password: hashedPassword,
        };
      })
    );
    await User.insertMany(hashedUsers);

    console.log('Inserting Buses...');
    await Bus.insertMany(seedBuses);

    console.log('Inserting Notifications...');
    await Notification.insertMany(seedNotifications);

    console.log('====================================');
    console.log(' Demo Data Successfully Seeded to MongoDB!');
    console.log(' Admin: admin@buspulse.edu / Admin@123');
    console.log(' Student: student@buspulse.edu / Student@123');
    console.log('====================================');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
