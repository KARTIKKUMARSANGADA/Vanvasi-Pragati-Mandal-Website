const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vanvasi-pragati');
        
        const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
        
        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const admin = new Admin({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email:', process.env.ADMIN_EMAIL);
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
