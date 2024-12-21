// routes/Topic/topicRoutes.js
const express = require('express');
const router = express.Router();
const topicController = require('../../controllers/Topic/topicController');

// Create new topic
router.post('/', topicController.createTopic);

// Get all topics
router.get('/', topicController.getTopics);

// Get topic by ID
router.get('/:id', topicController.getTopicById);

// Update topic
router.put('/:id', topicController.updateTopic);

// Delete topic
router.delete('/:id', topicController.deleteTopic);

// Get topics by category
router.get('/category/:categoryId', topicController.getTopicsByCategory);

module.exports = router;