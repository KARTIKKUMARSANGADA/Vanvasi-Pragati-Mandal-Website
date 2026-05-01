const express = require('express');
const router = express.Router();
const { 
    getGallery, 
    uploadGalleryImage, 
    deleteGalleryImage 
} = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.route('/')
    .get(getGallery)
    .post(protect, upload.array('images', 20), uploadGalleryImage);

router.route('/:id')
    .delete(protect, deleteGalleryImage);

module.exports = router;
