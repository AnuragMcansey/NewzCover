const cron = require('node-cron');
const Post = require('../models/Post/postModel');

class SchedulerService {
  init() {
    // Run every minute to check for posts that need to be published
    cron.schedule('* * * * *', async () => {
      try {
        const now = new Date();

        // Find posts that are scheduled and whose publishDate has passed
        const postsToPublish = await Post.find({
          status: 'scheduled',
          publishDate: { $lte: now }
        });

        // Update status to published for each post
        const updatePromises = postsToPublish.map(post =>
          Post.findByIdAndUpdate(
            post._id,
            {
              status: 'published',
              updatedAt: now
            },
            { new: true }
          )
        );

        await Promise.all(updatePromises);

        if (postsToPublish.length > 0) {
          console.log(`Published ${postsToPublish.length} posts at ${now}`);
        }
      } catch (error) {
        console.error('Post scheduling error:', error);
      }
    });
  }
}

module.exports = new SchedulerService();