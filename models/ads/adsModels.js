const mongoose = require('mongoose');
const { Schema } = mongoose;

// Enum definitions
const AdType = {
  Banner: 'banner',
  Sidebar: 'sidebar',
  InContent: 'in-content',
  Popup: 'popup',
  Native: 'native'
};

const AdFormat = {
  Display: 'display',
  InArticle: 'inArticle',
  InFeed: 'inFeed'
};

const AdPlacement = {
  Top: 'top',
  Bottom: 'bottom',
  Middle: 'middle',
  Sidebar: 'sidebar',
  Inline: 'inline'
};

const AdSize = {
  Responsive: 'responsive',
  MediumRectangle: '300x250',
  Leaderboard: '728x90',
  WideSkyscraper: '160x600'
};

// Mongoose Schema
const AdSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(AdType),
    required: [true, 'Ad type is required']
  },
  format: {
    type: String,
    enum: Object.values(AdFormat),
    required: [true, 'Ad format is required']
  },
  placement: {
    type: String,
    enum: Object.values(AdPlacement),
    required: [true, 'Ad placement is required']
  },
  size: {
    type: String,
    enum: Object.values(AdSize),
    required: [true, 'Ad size is required']
  },
  priority: {
    type: Number,
    required: [true, 'Ad priority is required'],
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority must be at most 10']
  },
  content: {
    type: String,
    required: [true, 'Ad content is required'],
    trim: true
  },
  clientId: {
    type: String,
    required: [true, 'Client ID is required'],
    trim: true
  },
  slotId: {
    type: String,
    required: [true, 'Slot ID is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
const Ad = mongoose.model('Ad', AdSchema);
module.exports = Ad;