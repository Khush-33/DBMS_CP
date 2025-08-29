const db = require('../config/db');

// @desc    Fetch all player stats for a given season
// @route   GET /api/stats/:season
exports.getStatsBySeason = async (req, res) => {
  try {
    const { season } = req.params;
    const query = `
        SELECT 
            p.Name AS Player_Name,
            ps.*
        FROM Player_Stats ps
        JOIN Players p ON ps.Player_ID = p.Player_ID
        WHERE ps.Season = ?
        ORDER BY ps.Runs DESC, ps.Wickets DESC;
    `;
    const [rows] = await db.query(query, [season]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};