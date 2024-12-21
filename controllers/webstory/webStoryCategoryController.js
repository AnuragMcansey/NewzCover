// controllers/webstory/webStoryCategoryController.js
const WebStoryCategory = require('../../models/webstory/webStoryCategoryModel');
const mongoose = require('mongoose');

exports.createCategory = async (req, res) => {
    try {
        const { name, slug, description, thumbnailImage, status } = req.body;
        const newCategory = new WebStoryCategory({
            name,
            slug,
            description,
            thumbnailImage,
            status
        });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await WebStoryCategory.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const updated = await WebStoryCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await WebStoryCategory.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const identifier = req.params.identifier;
        let category;

        // Try finding by ID first if valid ObjectId
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            category = await WebStoryCategory.findById(identifier);
        }

        // If not found by ID, try finding by slug
        if (!category) {
            category = await WebStoryCategory.findOne({ slug: identifier });
        }

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};