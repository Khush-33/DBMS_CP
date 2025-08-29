const express = require('express');
const router = express.Router();
const { getAllBids } = require('../controllers/bidController');

router.get('/', getAllBids);

module.exports = router;