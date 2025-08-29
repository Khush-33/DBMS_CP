const db = require('../config/db');

// @desc    Fetch all players
// @route   GET /api/players
exports.getAllPlayers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT Player_ID, Name, Role, Base_Price, Country, Status FROM Players');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch a single player by ID with their stats
// @route   GET /api/players/:id
exports.getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [player] = await db.query('SELECT * FROM Players WHERE Player_ID = ?', [id]);

    if (player.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const [stats] = await db.query('SELECT * FROM Player_Stats WHERE Player_ID = ? ORDER BY Season DESC', [id]);

    res.status(200).json({
      playerDetails: player[0],
      playerStats: stats
    });
  } catch (error) {
    console.error(`Error fetching player ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};