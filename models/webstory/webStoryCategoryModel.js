// models/webstory/webStoryCategoryModel.js
const mongoose = require('mongoose');

const webStoryCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: String,
    thumbnailImage: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('WebStoryCategory', webStoryCategorySchema);