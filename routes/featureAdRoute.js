const express = require('express');
const { createFeatureAd, getAllFeatureAds, getSepcificFeatureAd, deleteSpecificFeatureAd } = require('../controllers/featureAdController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/:featureAdId').get(protected, getSepcificFeatureAd).delete(protected, deleteSpecificFeatureAd)
router.route('/').post(protected, createFeatureAd ).get( getAllFeatureAds)


module.exports = router;