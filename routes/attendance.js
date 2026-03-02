const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Get attendance records
router.get('/', async (req, res) => {
    try {
        const { userId, month, year } = req.query;
        let query = {};
        
        if (userId) query.userId = userId;
        
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.date = { $gte: startDate, $lte: endDate };
        }
        
        const records = await Attendance.find(query)
            .populate('userId', 'name email')
            .sort({ date: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check in
router.post('/check-in', async (req, res) => {
    try {
        const { userId, userName, note } = req.body;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Check if already checked in today
        let record = await Attendance.findOne({ userId, date: today });
        
        if (record) {
            return res.status(400).json({ message: 'Already checked in today' });
        }
        
        // Determine if late (after 9:00 AM)
        const lateThreshold = new Date(today);
        lateThreshold.setHours(9, 0, 0);
        const status = now > lateThreshold ? 'late' : 'present';
        
        record = new Attendance({
            userId,
            userName,
            date: today,
            checkIn: now,
            status,
            note
        });
        
        await record.save();
        res.status(201).json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Check out
router.post('/check-out', async (req, res) => {
    try {
        const { userId, note } = req.body;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const record = await Attendance.findOne({ userId, date: today });
        
        if (!record) {
            return res.status(400).json({ message: 'No check-in record found for today' });
        }
        
        if (record.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }
        
        record.checkOut = now;
        record.workHours = (now - record.checkIn) / (1000 * 60 * 60); // hours
        if (note) record.note = (record.note ? record.note + ' | ' : '') + note;
        
        await record.save();
        res.json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get today's attendance for a user
router.get('/today/:userId', async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const record = await Attendance.findOne({
            userId: req.params.userId,
            date: today
        });
        
        res.json(record || { checkedIn: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get attendance stats
router.get('/stats/summary', async (req, res) => {
    try {
        const { month, year } = req.query;
        const m = parseInt(month) || new Date().getMonth() + 1;
        const y = parseInt(year) || new Date().getFullYear();
        
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);
        
        const total = await Attendance.countDocuments({ date: { $gte: startDate, $lte: endDate } });
        const present = await Attendance.countDocuments({ date: { $gte: startDate, $lte: endDate }, status: 'present' });
        const late = await Attendance.countDocuments({ date: { $gte: startDate, $lte: endDate }, status: 'late' });
        const absent = await Attendance.countDocuments({ date: { $gte: startDate, $lte: endDate }, status: 'absent' });
        
        const avgWorkHours = await Attendance.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate }, workHours: { $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: '$workHours' } } }
        ]);
        
        res.json({
            total,
            present,
            late,
            absent,
            avgWorkHours: avgWorkHours[0]?.avg?.toFixed(2) || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
