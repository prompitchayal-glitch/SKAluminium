const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    // stage: ขั้นตอนการติดตั้ง (before=ก่อนติดตั้ง, during=ระหว่างติดตั้ง, after=หลังติดตั้ง)
    stage: { 
        type: String, 
        enum: ['before', 'during', 'after'], 
        required: true 
    },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    description: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

// Index for faster queries by project and stage
mediaSchema.index({ projectId: 1, stage: 1 });

module.exports = mongoose.model('Media', mediaSchema, 'medias');
