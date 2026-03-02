const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');
const Project = require('../models/Project');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'media');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET all media with optional filters
router.get('/', async (req, res) => {
    try {
        const { projectId, stage } = req.query;
        let filter = {};
        
        if (projectId && projectId !== 'all') {
            filter.projectId = projectId;
        }
        if (stage && stage !== 'all') {
            filter.stage = stage;
        }

        const media = await Media.find(filter)
            .populate('projectId', 'projectName customerName')
            .populate('uploadedBy', 'username')
            .sort({ createdAt: -1 });

        res.json(media);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET media stats
router.get('/stats', async (req, res) => {
    try {
        const totalMedia = await Media.countDocuments();
        const projectsWithMedia = await Media.distinct('projectId');
        const totalSize = await Media.aggregate([
            { $group: { _id: null, totalSize: { $sum: '$size' } } }
        ]);

        res.json({
            totalMedia,
            projectsWithMedia: projectsWithMedia.length,
            totalSize: totalSize[0]?.totalSize || 0
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET media by project grouped by stage
router.get('/project/:projectId', async (req, res) => {
    try {
        const media = await Media.find({ projectId: req.params.projectId })
            .sort({ createdAt: -1 });

        // Group by stage
        const grouped = {
            before: media.filter(m => m.stage === 'before'),
            during: media.filter(m => m.stage === 'during'),
            after: media.filter(m => m.stage === 'after')
        };

        res.json(grouped);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST upload new media
router.post('/upload', upload.array('images', 10), async (req, res) => {
    try {
        const { projectId, stage, description } = req.body;
        const uploadedBy = req.body.uploadedBy; // In real app, get from auth token

        if (!projectId || !stage) {
            return res.status(400).json({ message: 'projectId and stage are required' });
        }

        // Validate stage
        if (!['before', 'during', 'after'].includes(stage)) {
            return res.status(400).json({ message: 'stage must be before, during, or after' });
        }

        // Verify project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const mediaFiles = [];

        for (const file of req.files) {
            const media = new Media({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: '/uploads/media/' + file.filename,
                stage: stage,
                projectId: projectId,
                description: description,
                uploadedBy: uploadedBy
            });

            await media.save();
            mediaFiles.push(media);
        }

        res.status(201).json({
            message: `${mediaFiles.length} files uploaded successfully`,
            media: mediaFiles
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE media by ID
router.delete('/:id', async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Delete file from disk
        const filePath = path.join(__dirname, '..', media.path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Media.findByIdAndDelete(req.params.id);
        res.json({ message: 'Media deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single media by ID
router.get('/:id', async (req, res) => {
    try {
        const media = await Media.findById(req.params.id)
            .populate('projectId', 'projectName customerName')
            .populate('uploadedBy', 'username');

        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        res.json(media);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
