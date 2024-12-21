const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/comment/commentController');

// Get all comments (with optional filters)
router.get('/', commentController.getComments);

// Get single comment thread
router.get('/:id', commentController.getCommentThread);

// Create new comment
router.post('/', commentController.createComment);

// Update comment
router.put('/:id', commentController.updateComment);

// Delete comment
router.delete('/:id', commentController.deleteComment);

// Bulk actions
router.post('/bulk', commentController.bulkAction);

module.exports = router;