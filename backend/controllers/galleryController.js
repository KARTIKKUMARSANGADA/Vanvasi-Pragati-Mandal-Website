const Gallery = require('../models/Gallery');

// @desc Get all gallery images
// @route GET /api/gallery
const getGallery = async (req, res) => {
    try {
        const gallery = await Gallery.find().sort({ createdAt: -1 });
        res.json(gallery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Upload gallery image
// @route POST /api/gallery
const uploadGalleryImage = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        const images = req.files.map(file => ({
            imageUrl: `/uploads/${file.filename}`
        }));

        const uploadedImages = await Gallery.insertMany(images);
        res.status(201).json(uploadedImages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Delete gallery image
// @route DELETE /api/gallery/:id
const deleteGalleryImage = async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (image) {
            await image.deleteOne();
            res.json({ message: 'Image removed' });
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getGallery,
    uploadGalleryImage,
    deleteGalleryImage
};
