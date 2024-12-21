const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDesc: { type: String, required: true },
  date: { type: Date, default: Date.now },
  author: { type: String },
  credit: { type: String },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
});

const WebStorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    fullPath: { type: String, unique: true }, // Add this field
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'WebStoryCategory', // Update reference to WebStoryCategory
      required: true 
    },
    metaTitle: { type: String, required: true },
    metaKeyword: { type: String },
    metaDescription: { type: String },
    isPublished: { type: Boolean, default: false },
    stories: [StorySchema],
  },
  { timestamps: true }
);

// Pre-save middleware to generate fullPath
WebStorySchema.pre('save', async function(next) {
  try {
    if (this.isModified('slug') || this.isModified('category')) {
      // Populate category to get its slug
      await this.populate('category', 'slug');
      this.fullPath = `${this.category.slug}/${this.slug}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Update middleware
WebStorySchema.pre('findOneAndUpdate', async function(next) {
  try {
    const update = this.getUpdate();
    if (update.slug || update.category) {
      // Get the document that will be updated
      const doc = await this.model.findOne(this.getQuery()).populate('category');
      
      if (!doc) {
        throw new Error('Web story not found');
      }

      // If category is being updated, get the new category
      let categorySlug;
      if (update.category) {
        const newCategory = await mongoose.model('WebStoryCategory').findById(update.category);
        if (!newCategory) {
          throw new Error('Invalid category');
        }
        categorySlug = newCategory.slug;
      } else {
        // Use existing category
        if (!doc.category) {
          throw new Error('Story category not found');
        }
        categorySlug = doc.category.slug;
      }

      // Update the fullPath
      update.fullPath = `${categorySlug}/${update.slug || doc.slug}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('WebStory', WebStorySchema);

// Also update the update controller to properly handle the update
exports.updateWebStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate category if it's being updated
    if (updateData.category) {
      const category = await mongoose.model('WebStoryCategory').findById(updateData.category);
      if (!category) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid category'
        });
      }
    }

    const webStory = await WebStory.findOneAndUpdate(
      {
        $or: [
          { _id: mongoose.isValidObjectId(id) ? id : null },
          { slug: id }
        ]
      },
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('category', '_id name slug');
    
    if (!webStory) {
      return res.status(404).json({
        status: 'error',
        message: 'Web story not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      story: webStory
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};