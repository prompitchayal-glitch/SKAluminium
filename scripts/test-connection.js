require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    console.log('=== Testing MongoDB Connection ===');
    console.log('URI:', process.env.MONGODB_URI);
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB successfully!\n');
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:');
        collections.forEach(c => console.log('  -', c.name));
        
        // Check users collection
        console.log('\n=== Checking users collection ===');
        const usersCollection = mongoose.connection.db.collection('users');
        const users = await usersCollection.find({}).toArray();
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`  - Email: ${u.email}, Role: ${u.role}, Password: ${u.password}`);
        });
        
        // Test query like auth.js does
        console.log('\n=== Testing login query ===');
        const testEmail = 'natthapong.cha@ku.th';
        const testPassword = '123456';
        const testRole = 'CEO';
        
        const result = await usersCollection.findOne({ 
            email: testEmail, 
            password: testPassword, 
            role: testRole 
        });
        
        if (result) {
            console.log('✓ Login query successful! User found:', result.email);
        } else {
            console.log('✗ Login query returned null');
            console.log('  Trying without role filter...');
            const result2 = await usersCollection.findOne({ email: testEmail });
            if (result2) {
                console.log('  User exists with these values:');
                console.log('    email:', result2.email);
                console.log('    password:', result2.password);
                console.log('    role:', result2.role);
            } else {
                console.log('  User not found by email either');
            }
        }
        
    } catch (error) {
        console.error('✗ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

testConnection();
