require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');


const seedUsers = async () => {
  try {

    // ✅ Use centralized DB connection
    await connectDB();

    await User.deleteMany({});

    const password = await bcrypt.hash('password123', 10);

    await User.insertMany([
      {
        name: 'Super Admin',
        email: 'admin@mdm.com',
        password,
        role: 'SUPER_ADMIN'
      },
      {
        name: 'Data Steward',
        email: 'steward@mdm.com',
        password,
        role: 'DATA_STEWARD'
      },
      {
        name: 'Operator',
        email: 'operator@mdm.com',
        password,
        role: 'SOURCE_OPERATOR'
      },
      {
        name: 'Business User',
        email: 'business@mdm.com',
        password,
        role: 'BUSINESS_USER'
      }
    ]);

    console.log('✅ Users seeded successfully');

    process.exit();

  } catch (err) {

    console.error('❌ Seed error:', err.message);

    process.exit(1);
  }
};

seedUsers();