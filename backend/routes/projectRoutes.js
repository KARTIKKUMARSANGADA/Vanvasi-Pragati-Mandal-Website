const express = require('express');
const router = express.Router();
const { 
    getProjects, 
    getProjectById, 
    createProject, 
    updateProject, 
    deleteProject 
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.route('/')
    .get(getProjects)
    .post(protect, upload.array('images', 10), createProject);

router.route('/:id')
    .get(getProjectById)
    .put(protect, upload.array('images', 10), updateProject)
    .delete(protect, deleteProject);

module.exports = router;
