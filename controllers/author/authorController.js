

const Author = require("../../models/author/authorModel");


const createAuthor = async (req, res) => {
  try {
    const { authorName } = req.body;

    if (!authorName) {
      return res.status(400).json({ message: "Author name is required" });
    }
    const author = new Author({ name:authorName });
    await author.save();

    res.status(201).json({ message: "Author created successfully", author });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.find();
    res.status(200).json(authors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    res.status(200).json(author);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const updateAuthor = async (req, res) => {
  try {
    const { name } = req.body;

    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    if (!name) {
      return res.status(400).json({ message: "Author name is required" });
    }

    author.name = name;
    const updatedAuthor = await author.save();

    res.status(200).json({ message: "Author updated successfully", updatedAuthor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    await Author.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Author deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
};
