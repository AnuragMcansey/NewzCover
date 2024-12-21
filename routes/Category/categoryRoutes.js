const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/Category/categoryController');


// Create a new category
router.post('/', categoryController.createCategory);

// Get all categories
router.get('/', categoryController.getCategories);

// Get a single category by ID
router.get('/:id', categoryController.getCategoryById);

// Update a category
router.put('/:id', categoryController.updateCategory);

// Delete a category
router.delete('/:id', categoryController.deleteCategory);

// Filter categories by status and order
router.get('/filter', categoryController.filterCategories);
router.get('/by-slug/:slug', categoryController.getCategoryBySlug);
module.exports = router;