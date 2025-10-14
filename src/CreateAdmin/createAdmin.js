const config = require('../config/env');
const mongoose = require('mongoose');
const readline = require('readline');
const adminModel = require('../models/admin.model');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

const createAdmin = async () => {
    try {
        await mongoose.connect(config.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Connected to MongoDB");

        console.log("\n🔐Create New Admin Account\n");

        const name = await question('Enter admin name: ');
        const email = await question('Enter admin email: ');
        const password = await question('Enter admin password (min 6 chars): ');


        if (!name || !email || !password) {
            console.error(' All fields are required');
            process.exit(1);
        }

        if (password.length < 6) {
            console.error('Password must be at least 6 characters');
            process.exit(1);
        }


        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) {
            console.error('Admin with this email already exists');
            process.exit(1);
        }

        const admin = await adminModel.create({
            name,
            email,
            password,
        });

        console.log('\n Admin created successfully!');
        console.log('\n📋 Admin Details:');
        console.log(`   ID: ${admin._id}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Status: ${admin.status}`);
        console.log('\nYou can now login with these credentials\n');

    } catch (error) {
        console.log("Error Creating Admin", error);
    } finally {
        rl.close();
        mongoose.connection.close();
        process.exit(0);
    }

}

module.exports = createAdmin;