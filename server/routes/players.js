const express = require('express');
const router = express.Router();
const { getAllPlayers, getPlayerById, addPlayer, searchPlayers } = require('../controllers/playerController');

router.get('/search', searchPlayers);
router.get('/', getAllPlayers);
router.get('/:id', getPlayerById);
router.post('/', addPlayer);

module.exports = router;