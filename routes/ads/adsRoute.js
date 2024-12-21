
const express = require('express');
const adController = require('../../controllers/ads/adsController');
const router = express.Router();

router.post('/', adController.createAd);
router.get('/', adController.getAds);
router.get('/:id', adController.getAdById);
router.put('/:id', adController.updateAdById);
router.delete('/:id', adController.deleteAdById);

module.exports = router;