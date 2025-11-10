const express = require('express');
const router = express.Router();
const {
  getSoldPlayerDetails,
  getTeamBudgetSummary,
  getPlayerPerformanceSummary,
  callGetTeamSquad,
  getPlayerCareerSummary,
  getPlayerAuditLog
} = require('../controllers/reportController');

router.get('/sold-players', getSoldPlayerDetails);
router.get('/team-budgets', getTeamBudgetSummary);
router.get('/player-performance', getPlayerPerformanceSummary);
router.get('/team-squad/:teamId', callGetTeamSquad);
router.get('/player-career', getPlayerCareerSummary);
router.get('/player-audit-log', getPlayerAuditLog);

module.exports = router;
