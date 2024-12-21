const mongoose = require('mongoose');
const WebStory = require('../../models/webstory/webStoryModel');

// Create a new web story
exports.createWebStory = async (req, res) => {
  try {
    const webStoryData = req.body;

    // Validate required fields
    if (!webStoryData.category || !webStoryData.slug || !webStoryData.metaTitle) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Sanitize stories array
    if (webStoryData.stories && Array.isArray(webStoryData.stories)) {
      webStoryData.stories = webStoryData.stories.map(story => ({
        ...story,
        date: story.date || Date.now()
      }));
    }

    // Get category for generating fullPath
    const category = await mongoose.model('WebStoryCategory').findById(webStoryData.category);
    if (!category) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid category'
      });
    }

    // Add fullPath
    webStoryData.fullPath = `${category.slug}/${webStoryData.slug}`;

    const newWebStory = new WebStory(webStoryData);
    const savedWebStory = await newWebStory.save();
    await savedWebStory.populate('category', '_id name slug');

    res.status(201).json({
      status: 'success',
      story: savedWebStory
    });
  } catch (error) {
    console.error('Create web story error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all web stories
exports.getAllWebStories = async (req, res) => {
  try {
    const webStories = await WebStory.find()
      .populate('category', '_id name slug')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      stories: webStories
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a single web story by ID or slug
exports.getWebStory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const webStory = await WebStory.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { slug: id }
      ]
    }).populate('category', '_id name slug');
    
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
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get web story by full path
exports.getWebStoryByFullPath = async (req, res) => {
  try {
    const { categorySlug, slug } = req.params;
    const fullPath = `${categorySlug}/${slug}`;
    
    const webStory = await WebStory.findOne({ fullPath })
      .populate('category', '_id name slug');
    
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
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a web story
exports.updateWebStory = async (req, res) => {
  try {
    const { id } = req.params; // Change from slug to id
    const updateData = req.body;
    
    // Try to find by ID first, then by slug if ID is invalid
    const webStory = await WebStory.findOneAndUpdate(
      {
        $or: [
          { _id: mongoose.isValidObjectId(id) ? id : null },
          { slug: id }
        ]
      },
      updateData,
      { new: true, runValidators: true }
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

// Delete a web story
exports.deleteWebStory = async (req, res) => {
  try {
    const { id } = req.params; // Change from slug to id
    
    const deletedWebStory = await WebStory.findOneAndDelete({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { slug: id }
      ]
    });
    
    if (!deletedWebStory) {
      return res.status(404).json({
        status: 'error',
        message: 'Web story not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Web story deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add this new method
exports.getStoriesByCategory = async (req, res) => {
  try {
    console.log('Fetching stories by category...'); // Debug log

    const stories = await WebStory.find({ isPublished: true }) // Only get published stories
      .populate('category', '_id name slug')
      .sort({ createdAt: -1 });

    console.log('Found stories:', stories.length); // Debug log

    if (!stories.length) {
      return res.status(200).json({
        status: 'success',
        data: [] // Return empty array instead of error
      });
    }

    // Group stories by category
    const storiesByCategory = stories.reduce((acc, story) => {
      if (!story.category) return acc; // Skip if no category

      const categoryId = story.category._id.toString();
      
      if (!acc[categoryId]) {
        acc[categoryId] = {
          _id: story.category._id,
          name: story.category.name,
          slug: story.category.slug,
          stories: []
        };
      }
      
      acc[categoryId].stories.push(story);
      return acc;
    }, {});

    const categorizedStories = Object.values(storiesByCategory);

    console.log('Categorized stories:', categorizedStories.length); // Debug log

    return res.status(200).json({
      status: 'success',
      data: categorizedStories
    });
  } catch (error) {
    console.error('Error in getStoriesByCategory:', error); // Debug log
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};