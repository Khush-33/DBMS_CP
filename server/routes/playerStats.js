const express = require('express');
const router = express.Router();
const { getStatsBySeason } = require('../controllers/playerStatController');

router.get('/:season', getStatsBySeason);

module.exports = router;