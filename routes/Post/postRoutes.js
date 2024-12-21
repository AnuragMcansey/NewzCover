const express = require('express');
const router = express.Router();
const postController = require('../../controllers/Post/postController');
// Generic routes first
router.post('/', postController.createPost);
router.get('/', postController.getPosts);
// Category and topic based routes
router.get('/category/:categorySlug/topics', postController.getTopicsByCategory);
router.get('/category/:categorySlug/:subcategorySlug?/topics', postController.getTopicsByCategory);
router.get('/category/:categorySlug/topic/:topicId', postController.getPostsByCategoryAndTopic);
router.get('/category/:categorySlug/:subcategorySlug/topic/:topicId', postController.getPostsByCategoryAndTopic);
// Category only routes (for posts without topics)
router.get('/category/:categorySlug/:subcategorySlug?', postController.getPostsByCategory);
// router.get('/post/:categorySlug/:subcategorySlug?/:postSlug', postController.getPostBySlug);
router.get('/post/*', postController.getPostBySlug);
// routes/Post/postRoutes.js
router.get('/category-hierarchy/*', postController.getCategoryHierarchyBlogs);
// Add new route
router.get('/category-blogs/:categorySlug/:subcategorySlug', postController.getCategoryBlogsWithTopics);
router.get('/category-all-blogs/:categorySlug', postController.getAllBlogsByCategory);
// Standard CRUD routes
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
module.exports = router;