const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document', 'other'],
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  alt: {
    type: String,
    default: null
  },
  title: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to get human-readable file size
MediaSchema.virtual('humanReadableSize').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.size === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(this.size) / Math.log(1024)).toString());
  return Math.round((this.size / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
});

// Method to determine file type
MediaSchema.statics.getFileType = function(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('application/pdf') || mimetype.startsWith('text/')) return 'document';
  return 'other';
};

const Media = mongoose.model('Media', MediaSchema);

module.exports = Media;