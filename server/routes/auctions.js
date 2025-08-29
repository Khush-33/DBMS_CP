const express = require('express');
const router = express.Router();
const { getAllAuctions, getAuctionDetails } = require('../controllers/auctionController');

router.get('/', getAllAuctions);
router.get('/:id', getAuctionDetails);

module.exports = router;