const express = require('express');
const router = express.Router();
const { getSquadByTeam } = require('../controllers/teamPlayerController');

router.get('/:teamId', getSquadByTeam);

module.exports = router;