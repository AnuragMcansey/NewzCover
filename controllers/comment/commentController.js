const Comment = require('../../models/comment/comment');
// Add this utility function
const getPopulateReplies = (depth) => {
  if (depth === 0) {
    return null;
  }
  return {
    path: 'replies',
    populate: getPopulateReplies(depth - 1),
  };
};
// Get all comments with optional filters
exports.getComments = async (req, res) => {
  try {
    const { lesson, approved, search } = req.query;
    let query = { parentId: null }; // Get only top-level comments
    if (lesson) {
      query.lesson = lesson;
    }
    if (approved !== undefined) {
      query.approved = approved;
    }
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }
    const comments = await Comment.find(query)
      .populate(getPopulateReplies(999)) // Adjust the depth as needed
      .sort({ timestamp: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get single comment with its thread
exports.getCommentThread = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate([
      { path: 'user', select: 'name email' }, // Populate user data
      getPopulateReplies(999), // Adjust depth as needed
    ]);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { parentId } = req.body;
    const comment = new Comment(req.body);
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      parentComment.replies.push(comment._id);
      await parentComment.save();
    }
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Update comment
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Delete comment and its replies
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    // Recursively delete all replies
    async function deleteReplies(commentId) {
      const comment = await Comment.findById(commentId);
      if (comment) {
        for (const replyId of comment.replies) {
          await deleteReplies(replyId);
        }
        await Comment.findByIdAndDelete(commentId);
      }
    }
    await deleteReplies(req.params.id);
    // Remove reference from parent if exists
    if (comment.parentId) {
      await Comment.findByIdAndUpdate(comment.parentId, {
        $pull: { replies: comment._id },
      });
    }
    res
      .status(200)
      .json({ message: 'Comment and replies deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Bulk actions
exports.bulkAction = async (req, res) => {
  try {
    const { action, ids } = req.body;
    console.log('Bulk action:', action, 'IDs:', ids); // Debug log
    switch (action) {
      case 'approve':
        await Comment.updateMany(
          { _id: { $in: ids } },
          { $set: { approved: true } },
        );
        break;
      case 'disapprove':
        await Comment.updateMany(
          { _id: { $in: ids } },
          { $set: { approved: false } },
        );
        break;
      case 'delete':
        // Delete comments and their replies
        for (const id of ids) {
          const comment = await Comment.findById(id);
          if (comment) {
            // Delete replies recursively
            const deleteReplies = async (commentId) => {
              const comment = await Comment.findById(commentId);
              if (comment) {
                for (const replyId of comment.replies) {
                  await deleteReplies(replyId);
                }
                await Comment.findByIdAndDelete(commentId);
              }
            };
            await deleteReplies(id);
            // Remove reference from parent
            if (comment.parentId) {
              await Comment.findByIdAndUpdate(comment.parentId, {
                $pull: { replies: comment._id },
              });
            }
          }
        }
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
    // Return updated comments list
    const updatedComments = await Comment.find({ parentId: null })
      .populate(getPopulateReplies(999)) // Using the utility function here
      .sort({ timestamp: -1 });
    res.status(200).json({
      message: `Bulk ${action} completed successfully`,
      comments: updatedComments,
    });
  } catch (error) {
    console.error('Bulk action error:', error); // Debug log
    res.status(500).json({ error: error.message });
  }
};











