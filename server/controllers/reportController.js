const db = require('../config/db');

exports.getSoldPlayerDetails = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SoldPlayerDetails');
    res.json(rows);
  } catch (e) {
    console.error('Error fetching SoldPlayerDetails:', e);
    res.status(500).json({ message: 'Server Error' });
  }
};

// New: Player career summary view
exports.getPlayerCareerSummary = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM PlayerCareerSummaryView');
    res.json(rows);
  } catch (e) {
    console.error('Error fetching PlayerCareerSummaryView:', e);
    res.status(500).json({ message: 'Server Error' });
  }
};

// New: Player audit log
exports.getPlayerAuditLog = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM PlayerAuditLog ORDER BY Change_Timestamp DESC, Log_ID DESC');
    res.json(rows);
  } catch (e) {
    console.error('Error fetching PlayerAuditLog:', e);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getTeamBudgetSummary = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM TeamBudgetSummary');
    res.json(rows);
  } catch (e) {
    console.error('Error fetching TeamBudgetSummary:', e);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getPlayerPerformanceSummary = async (req, res) => {
  try {
    const season = req.query.season || 2025;
    const [rows] = await db.query(
      `SELECT * FROM PlayerPerformanceSummary` + (season ? '' : '')
    );
    res.json(rows);
  } catch (e) {
    console.error('Error fetching PlayerPerformanceSummary:', e);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.callGetTeamSquad = async (req, res) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    if (!teamId) return res.status(400).json({ message: 'Invalid teamId' });
    const [rows] = await db.query('CALL GetTeamSquad(?)', [teamId]);
    // mysql2 returns [ [rows], [meta] ] for CALL
    res.json(rows[0] || rows);
  } catch (e) {
    console.error('Error calling GetTeamSquad:', e);
    res.status(500).json({ message: 'Server Error' });
  }
};
