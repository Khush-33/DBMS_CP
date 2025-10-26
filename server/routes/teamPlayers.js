const express = require('express');
const router = express.Router();
const { getSquadByTeam, addTeamPlayer } = require('../controllers/teamPlayerController');

router.get('/:teamId', getSquadByTeam);
router.post('/', addTeamPlayer);

module.exports = router;