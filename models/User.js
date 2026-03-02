const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    fullname: { type: String }, 
    role: { type: String, enum: ['CEO', 'EMPLOYEE'], default: 'EMPLOYEE' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema, 'users');
