const express = require('express');
const router = express.Router();
const { getAllPlayers, getPlayerById, addPlayer } = require('../controllers/playerController');

router.get('/', getAllPlayers);
router.get('/:id', getPlayerById);
router.post('/', addPlayer);

module.exports = router;