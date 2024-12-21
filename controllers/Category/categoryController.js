const Category = require('../../models/Category/categoryModel');
// Create a new category
const createCategory = async (req, res) => {
    try {
      const {
        name,
        slug,
        parentCategory,
        description,
        metaTitle,
        metaKeywords,
        metaDescription,
        positionOrder,
        status,
        thumbnailImage,
      } = req.body;
      const newCategory = new Category({
        name,
        slug,
        parentCategory: parentCategory || null,
        description,
        metaTitle,
        metaKeywords,
        metaDescription,
        positionOrder,
        status,
        thumbnailImage,
      });
      const savedCategory = await newCategory.save();
      if (parentCategory) {
        await Category.findByIdAndUpdate(
          parentCategory,
          { $push: { children: savedCategory._id } },
          { new: true }
        );
      }
      res.status(201).json(savedCategory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  };
  // Get all categories
  const getCategories = async (req, res) => {
    try {
      const categories = await Category.find()
        .populate('parentCategory', 'name slug')
        .populate('children', 'name slug');
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  };
  // Get a single category by ID
  const getCategoryById = async (req, res) => {
    try {
      const { id } = req.params;
      let query = {};
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = id;
      } else {
        query.slug = id;
      }
      const category = await Category.findOne(query)
        .populate('parentCategory', 'name slug')
        .populate('children', 'name slug');
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(200).json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  };
  const updateCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        slug,
        parentCategory,
        description,
        metaTitle,
        metaKeywords,
        metaDescription,
        positionOrder,
        status,
        thumbnailImage,
      } = req.body;
  
      // Find the current category
      const currentCategory = await Category.findById(id);
      if (!currentCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      // If the parent category is changed, update the children of the old and new parent categories
      if (parentCategory && parentCategory !== currentCategory.parentCategory) {
        // Remove the category from the old parent's children
        if (currentCategory.parentCategory) {
          await Category.findByIdAndUpdate(currentCategory.parentCategory, {
            $pull: { children: currentCategory._id },
          });
        }
  
        // Add the category to the new parent's children
        await Category.findByIdAndUpdate(parentCategory, {
          $push: { children: currentCategory._id },
        });
      }
  
      // Update the category
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        {
          name,
          slug,
          parentCategory: parentCategory || null,
          description,
          metaTitle,
          metaKeywords,
          metaDescription,
          positionOrder,
          status,
          thumbnailImage,
        },
        { new: true }
      );
  
      if (!updatedCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  };
  // Delete a category
  const deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      if (category.parentCategory) {
        await Category.findByIdAndUpdate(category.parentCategory, {
          $pull: { children: category._id },
        });
      }
      await Category.findByIdAndDelete(id);
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  };
  // Filter categories by status and order
  const filterCategories = async (req, res) => {
    try {
      const { status, sortByOrder } = req.query;
      const query = {};
      if (status) query.status = status;
      const categories = await Category.find(query)
        .sort(sortByOrder ? { positionOrder: 1 } : {})
        .populate('parentCategory', 'name slug')
        .populate('children', 'name slug');
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch filtered categories' });
    }
  };
  const getCategoryBySlug = async (req, res) => {
    try {
      const category = await Category.findOne({ slug: req.params.slug })
        .populate({
          path: 'children',
          select: '_id name slug'
        })
        .populate({
          path: 'parentCategory',
          select: '_id name slug'
        });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    filterCategories,
    getCategoryBySlug
  };