const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Import Models
const User = require('./models/User');
const Inventory = require('./models/Inventory');
const Project = require('./models/Project');
const Customer = require('./models/Customer');
const Quotation = require('./models/Quotation');
const Attendance = require('./models/Attendance');

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

// Load JSON data files
const loadJSON = (filename) => {
    const filePath = path.join(__dirname, 'data', filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
};

const seedData = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Inventory.deleteMany({});
        await Project.deleteMany({});
        await Customer.deleteMany({});
        await Quotation.deleteMany({});
        await Attendance.deleteMany({});
        console.log('Cleared existing data...');

        // 1. Seed Users
        const users = loadJSON('users.json');
        const insertedUsers = await User.insertMany(users);
        console.log(`✅ Users seeded: ${insertedUsers.length} records`);

        // 2. Seed Inventory
        const inventory = loadJSON('inventory.json');
        const insertedInventory = await Inventory.insertMany(inventory);
        console.log(`✅ Inventory seeded: ${insertedInventory.length} records`);

        // 3. Seed Projects
        const projects = loadJSON('projects.json');
        const insertedProjects = await Project.insertMany(projects);
        console.log(`✅ Projects seeded: ${insertedProjects.length} records`);

        // 4. Seed Customers
        const customers = loadJSON('customers.json');
        const insertedCustomers = await Customer.insertMany(customers);
        console.log(`✅ Customers seeded: ${insertedCustomers.length} records`);

        // 5. Seed Quotations
        const quotations = loadJSON('quotations.json');
        const insertedQuotations = await Quotation.insertMany(quotations);
        console.log(`✅ Quotations seeded: ${insertedQuotations.length} records`);

        // 6. Seed Attendance (with user references)
        const attendanceData = loadJSON('attendance.json');
        // Map userNames to actual user IDs
        const userMap = {};
        insertedUsers.forEach(user => {
            userMap[user.name] = user._id;
        });
        
        const attendanceWithIds = attendanceData.map(record => ({
            ...record,
            userId: userMap[record.userName] || insertedUsers[1]._id, // Default to first employee
            date: new Date(record.date),
            checkIn: record.checkIn ? new Date(record.checkIn) : null,
            checkOut: record.checkOut ? new Date(record.checkOut) : null
        }));
        
        const insertedAttendance = await Attendance.insertMany(attendanceWithIds);
        console.log(`✅ Attendance seeded: ${insertedAttendance.length} records`);

        console.log('\\n========================================');
        console.log('All data seeded successfully!');
        console.log('========================================');
        console.log(`Total Records:`);
        console.log(`  - Users: ${insertedUsers.length}`);
        console.log(`  - Inventory: ${insertedInventory.length}`);
        console.log(`  - Projects: ${insertedProjects.length}`);
        console.log(`  - Customers: ${insertedCustomers.length}`);
        console.log(`  - Quotations: ${insertedQuotations.length}`);
        console.log(`  - Attendance: ${insertedAttendance.length}`);
        console.log('========================================\\n');
        
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
