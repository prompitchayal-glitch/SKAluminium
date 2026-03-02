const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');

// Get all quotations
router.get('/', async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};
        
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { quotationNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } }
            ];
        }
        
        const quotations = await Quotation.find(query)
            .sort({ createdAt: -1 })
            .populate('customerId', 'name phone');
        res.json(quotations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single quotation
router.get('/:id', async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('customerId')
            .populate('createdBy', 'name');
        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
        res.json(quotation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generate next quotation number
router.get('/next/number', async (req, res) => {
    try {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const prefix = `QT${year}${month}`;
        
        const lastQuotation = await Quotation.findOne({ quotationNumber: { $regex: `^${prefix}` } })
            .sort({ quotationNumber: -1 });
        
        let nextNumber = 1;
        if (lastQuotation) {
            const lastNumber = parseInt(lastQuotation.quotationNumber.slice(-4));
            nextNumber = lastNumber + 1;
        }
        
        const quotationNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`;
        res.json({ quotationNumber });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create quotation
router.post('/', async (req, res) => {
    try {
        // Calculate totals
        const items = req.body.items || [];
        const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
        const discount = req.body.discount || 0;
        const vat = (subtotal - discount) * 0.07;
        const totalAmount = subtotal - discount + vat;
        
        const quotation = new Quotation({
            ...req.body,
            subtotal,
            vat,
            totalAmount
        });
        
        await quotation.save();
        res.status(201).json(quotation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update quotation
router.put('/:id', async (req, res) => {
    try {
        // Recalculate totals if items changed
        if (req.body.items) {
            const items = req.body.items;
            req.body.subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
            req.body.vat = (req.body.subtotal - (req.body.discount || 0)) * 0.07;
            req.body.totalAmount = req.body.subtotal - (req.body.discount || 0) + req.body.vat;
        }
        
        const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(quotation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete quotation
router.delete('/:id', async (req, res) => {
    try {
        await Quotation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quotation deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get quotation stats
router.get('/stats/summary', async (req, res) => {
    try {
        const total = await Quotation.countDocuments();
        const draft = await Quotation.countDocuments({ status: 'draft' });
        const sent = await Quotation.countDocuments({ status: 'sent' });
        const approved = await Quotation.countDocuments({ status: 'approved' });
        const totalValue = await Quotation.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        res.json({
            total,
            draft,
            sent,
            approved,
            totalValue: totalValue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
