const express = require('express');
const router = express.Router();
const { getAllBids, addBid } = require('../controllers/bidController');

router.get('/', getAllBids);
router.post('/', addBid);

module.exports = router;