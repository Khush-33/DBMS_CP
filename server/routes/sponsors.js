const express = require('express');
const router = express.Router();
const { getAllSponsors } = require('../controllers/sponsorController');

router.get('/', getAllSponsors);

module.exports = router;