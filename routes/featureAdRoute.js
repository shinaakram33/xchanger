const express = require('express');
const { createFeatureAd, getAllFeatureAds, getSepcificFeatureAd, deleteSpecificFeatureAd, getUserAds, getFeatureAdPakages } = require('../controllers/featureAdController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/pakages').get(getFeatureAdPakages);
router.route('/:featureAdId').get(protected, getSepcificFeatureAd).delete(protected, deleteSpecificFeatureAd)
router.route('/').post(protected, createFeatureAd ).get( getAllFeatureAds)
router.route('/user/:userId').get(protected, getUserAds);


module.exports = router;