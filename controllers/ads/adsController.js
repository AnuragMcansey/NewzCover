
const Ad = require('../../models/ads/adsModels');

// Create a new ad
exports.createAd = async (req, res) => {
  try {
    const ad = new Ad(req.body);
    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all ads
exports.getAds = async (req, res) => {
  try {
    const ads = await Ad.find();
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single ad by ID
exports.getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }
    res.status(200).json(ad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an ad by ID
exports.updateAdById = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }
    res.status(200).json(ad);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an ad by ID
exports.deleteAdById = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }
    res.status(200).json({ message: 'Ad deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};