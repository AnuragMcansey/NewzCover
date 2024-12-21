const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: false } // Added website field
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false },
  lesson: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, {
  timestamps: true
});

// Add indexes for better query performance
commentSchema.index({ lesson: 1 });
commentSchema.index({ approved: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ 'user.website': 1 }); // Added website index

module.exports = mongoose.model('Comment', commentSchema);