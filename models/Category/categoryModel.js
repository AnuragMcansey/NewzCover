const mongoose = require('mongoose');

// Define the schema for Category
const categorySchema = new mongoose.Schema({
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
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    description: {
        type: String,
        trim: true
    },
    metaTitle: {
        type: String,
        trim: true,
        description: "SEO Meta Title"
    },
    metaKeywords: {
        type: String,
        trim: true,
        description: "SEO Meta Keywords (comma-separated)"
    },
    metaDescription: {
        type: String,
        trim: true,
        description: "SEO Meta Description"
    },
    positionOrder: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    thumbnailImage: {
        type: String,
        trim: true
    },
}, { timestamps: true });

// Create the Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
