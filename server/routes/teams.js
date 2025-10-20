const express = require('express');
const router = express.Router();
const { getAllTeams, getTeamDetails, getTeamSummary } = require('../controllers/teamController');

router.get('/', getAllTeams);
router.get('/summary', getTeamSummary);
router.get('/:id', getTeamDetails);

module.exports = router;