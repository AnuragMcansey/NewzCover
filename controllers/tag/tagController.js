
const Tag = require('../../models/tag/tagModel');

// Create a new tag
exports.createTag = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const newTag = new Tag({ name, slug });
    await newTag.save();
    res.status(201).json({ success: true, data: newTag });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all tags
exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single tag by ID
exports.getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });
    res.status(200).json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a tag by ID
exports.updateTag = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const updatedTag = await Tag.findByIdAndUpdate(
      req.params.id,
      { name, slug },
      { new: true, runValidators: true }
    );
    if (!updatedTag) return res.status(404).json({ success: false, message: 'Tag not found' });
    res.status(200).json({ success: true, data: updatedTag });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a tag by ID
exports.deleteTag = async (req, res) => {
  try {
    const deletedTag = await Tag.findByIdAndDelete(req.params.id);
    if (!deletedTag) return res.status(404).json({ success: false, message: 'Tag not found' });
    res.status(200).json({ success: true, message: 'Tag deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
