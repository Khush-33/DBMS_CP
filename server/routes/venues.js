const express = require('express');
const router = express.Router();
const { getAllVenues } = require('../controllers/venueController');

router.get('/', getAllVenues);

module.exports = router;