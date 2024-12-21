const express = require('express');
const {
  createWebStory,
  getAllWebStories,
  getWebStory,
  getWebStoryByFullPath,
  updateWebStory,
  deleteWebStory,
  getStoriesByCategory
} = require('../../controllers/webstory/webStoriesController');

const router = express.Router();
router.get('/by-category', getStoriesByCategory);

// Create a new web story
router.post('/', createWebStory);

// Get all web stories
router.get('/', getAllWebStories);
// Get stories grouped by category - Move this BEFORE /:id route

// Get story by ID or slug
router.get('/:id', getWebStory);

// Get story by category/slug path
router.get('/:categorySlug/:slug', getWebStoryByFullPath);

// Update a web story (supports both ways)
router.put('/:id', updateWebStory);
router.put('/:categorySlug/:slug', updateWebStory);

// Delete a web story (supports both ways)
router.delete('/:id', deleteWebStory);
router.delete('/:categorySlug/:slug', deleteWebStory);
module.exports = router;