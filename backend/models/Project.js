const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Education', 'Health', 'Government Work', 'Infrastructure', 'Social']
    },
    description: {
        type: String,
        required: true
    },
    fullDescription: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    impacts: [{
        type: String
    }],
    images: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
