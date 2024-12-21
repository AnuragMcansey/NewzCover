const express = require('express');
const {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
} = require('../../controllers/author/authorController');

const router = express.Router();

// Route to create a new author
router.post('/', createAuthor);

// Route to get all authors
router.get('/', getAllAuthors);

// Route to get an author by ID
router.get('/:id', getAuthorById);

// Route to update an author by ID
router.put('/:id', updateAuthor);

// Route to delete an author by ID
router.delete('/:id', deleteAuthor);

module.exports = router;
