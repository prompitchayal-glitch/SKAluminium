const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// 1. ดึงข้อมูลลูกค้าทั้งหมด (ถูกต้องแล้ว)
router.get('/', async (req, res) => {
    try {
        const { type, search } = req.query;
        let query = {};
        
        if (type && type !== 'all') {
            query.customerType = type;
        }

        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { customerPhone: { $regex: search, $options: 'i' } }
            ];
        }
        
        const customers = await Customer.find(query).sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. ดึงข้อมูลลูกค้ารายบุคคล
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. บันทึกข้อมูลลูกค้าใหม่ (แก้ไขจุดที่ผิดให้แล้ว)
router.post('/', async (req, res) => {
    try {
        // สร้างข้อมูลใหม่จากค่าที่ส่งมาจากหน้าบ้าน (req.body)
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        // ถ้าชื่อฟิลด์ไม่ตรงกับ Model จะติด Error ตรงนี้
        res.status(400).json({ message: error.message });
    }
});

// 4. แก้ไขข้อมูลลูกค้า
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 5. ลบข้อมูลลูกค้า
router.delete('/:id', async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 6. ข้อมูลสรุปสถิติ (ถูกต้องแล้ว)
router.get('/stats/summary', async (req, res) => {
    try {
        const total = await Customer.countDocuments();
        const individual = await Customer.countDocuments({ customerType: 'individual' });
        const company = await Customer.countDocuments({ customerType: 'company' });
        
        const totalSpent = await Customer.aggregate([
            { $group: { _id: null, total: { $sum: '$totalSpent' } } }
        ]);
        
        res.json({
            total,
            individual,
            company,
            totalSpent: totalSpent[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;