const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login - แก้ไขใหม่ให้ปลอดภัยและแม่นยำขึ้น
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // 1. หา User ด้วย Email ก่อน เพื่อตรวจสอบว่ามีตัวตนไหม
        const user = await User.findOne({ email });
        
        // 2. ตรวจสอบเงื่อนไข: ต้องมี User, Password ตรงกัน และ Role ตรงกับที่เลือกจากหน้าเว็บ
        // (หมายเหตุ: ตอนนี้เช็ค password แบบ String ตรงๆ ตามข้อมูลที่คุณมีใน Compass)
        if (!user || user.password !== password || user.role !== role) {
            return res.status(401).json({ 
                success: false, 
                message: 'อีเมล รหัสผ่าน หรือสิทธิ์การใช้งานไม่ถูกต้อง' 
            });
        }
        
        // 3. Login สำเร็จ: ส่งข้อมูล User กลับไป (ไม่ส่ง password กลับไปเพื่อความปลอดภัย)
        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.fullname,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- ส่วนจัดการข้อมูล Users (CRUD) ---

// ดึงข้อมูลพนักงานทั้งหมด (ไม่ดึง password ออกมา)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// สร้างพนักงานใหม่
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// อัปเดตข้อมูลพนักงาน
router.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// ลบพนักงาน
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
