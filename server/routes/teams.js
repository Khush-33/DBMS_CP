const express = require('express');
const router = express.Router();
const { getAllTeams, getTeamDetails } = require('../controllers/teamController');

router.get('/', getAllTeams);
router.get('/:id', getTeamDetails);

module.exports = router;