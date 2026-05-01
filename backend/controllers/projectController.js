const Project = require('../models/Project');
const Gallery = require('../models/Gallery');

// @desc Get all projects
// @route GET /api/projects
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get project by ID
// @route GET /api/projects/:id
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (project) {
            res.json(project);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Create project
// @route POST /api/projects
const createProject = async (req, res) => {
    try {
        const { title, category, description, fullDescription, location, date, impacts } = req.body;
        
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const project = new Project({
            title,
            category,
            description,
            fullDescription,
            location,
            date,
            impacts: Array.isArray(impacts) ? impacts : JSON.parse(impacts || '[]'),
            images
        });

        const createdProject = await project.save();

        // Add project images to gallery
        if (images.length > 0) {
            const galleryImages = images.map(img => ({ imageUrl: img }));
            await Gallery.insertMany(galleryImages);
        }

        res.status(201).json(createdProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Update project
// @route PUT /api/projects/:id
const updateProject = async (req, res) => {
    try {
        const { title, category, description, fullDescription, location, date, impacts } = req.body;
        const project = await Project.findById(req.params.id);

        if (project) {
            project.title = title || project.title;
            project.category = category || project.category;
            project.description = description || project.description;
            project.fullDescription = fullDescription || project.fullDescription;
            project.location = location || project.location;
            project.date = date || project.date;
            project.impacts = impacts ? (Array.isArray(impacts) ? impacts : JSON.parse(impacts)) : project.impacts;

            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => `/uploads/${file.filename}`);
                project.images = [...project.images, ...newImages];
                
                // Add new images to gallery as well
                const galleryImages = newImages.map(img => ({ imageUrl: img }));
                await Gallery.insertMany(galleryImages);
            }

            const updatedProject = await project.save();
            res.json(updatedProject);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Delete project
// @route DELETE /api/projects/:id
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (project) {
            await project.deleteOne();
            res.json({ message: 'Project removed' });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};
