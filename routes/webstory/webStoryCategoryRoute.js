// routes/webstory/webStoryCategoryRoute.js
const express = require('express');
const router = express.Router();
const webStoryCategoryController = require('../../controllers/webstory/webStoryCategoryController');

// Remove this line that's causing the error
// router.get('/by-category', webStoryCategoryController.getStoriesByCategory);

// CRUD routes
router.post('/', webStoryCategoryController.createCategory);
router.get('/', webStoryCategoryController.getAllCategories);
router.get('/:identifier', webStoryCategoryController.getCategory); // Single route for both id/slug
router.put('/:id', webStoryCategoryController.updateCategory);
router.delete('/:id', webStoryCategoryController.deleteCategory);

module.exports = router;