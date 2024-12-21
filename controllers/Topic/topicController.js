// controllers/Topic/topicController.js
const Topic = require('../../models/Topic/topicModel');

const topicController = {
  // Create new topic
  createTopic: async (req, res) => {
    try {
      const { topicName, categoryId } = req.body;
      
      const topic = new Topic({
        topicName,
        category: categoryId
      });

      const savedTopic = await topic.save();
      
      const populatedTopic = await Topic.findById(savedTopic._id)
        .populate({
          path: 'category',
          populate: {
            path: 'parentCategory',
            populate: {
              path: 'parentCategory'
            }
          }
        });

      res.status(201).json(populatedTopic);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create topic' });
    }
  },

  // Get all topics
  getTopics: async (req, res) => {
    try {
      const topics = await Topic.find()
        .populate({
          path: 'category',
          populate: {
            path: 'parentCategory',
            populate: {
              path: 'parentCategory'
            }
          }
        });
      res.status(200).json(topics);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch topics' });
    }
  },

  // Get topic by ID
  getTopicById: async (req, res) => {
    try {
      const topic = await Topic.findById(req.params.id)
        .populate({
          path: 'category',
          populate: {
            path: 'parentCategory',
            populate: {
              path: 'parentCategory'
            }
          }
        });

      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      res.status(200).json(topic);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch topic' });
    }
  },

  // Update topic
  updateTopic: async (req, res) => {
    try {
      const { topicName, categoryId, status } = req.body;

      const updatedTopic = await Topic.findByIdAndUpdate(
        req.params.id,
        {
          topicName,
          category: categoryId,
          status
        },
        { new: true }
      ).populate({
        path: 'category',
        populate: {
          path: 'parentCategory',
          populate: {
            path: 'parentCategory'
          }
        }
      });

      if (!updatedTopic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      res.status(200).json(updatedTopic);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update topic' });
    }
  },

  // Delete topic
  deleteTopic: async (req, res) => {
    try {
      const deletedTopic = await Topic.findByIdAndDelete(req.params.id);

      if (!deletedTopic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete topic' });
    }
  },

  // Get topics by category
  getTopicsByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const topics = await Topic.find({ category: categoryId })
        .populate({
          path: 'category',
          populate: {
            path: 'parentCategory',
            populate: {
              path: 'parentCategory'
            }
          }
        });

      res.status(200).json(topics);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch topics by category' });
    }
  }
};

module.exports = topicController;