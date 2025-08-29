const db = require('../config/db');

// @desc    Fetch the squad for a given team
// @route   GET /api/squads/:teamId
exports.getSquadByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const query = `
        SELECT 
            p.Player_ID,
            p.Name,
            p.Role,
            p.Country,
            tp.Price
        FROM Team_Players tp
        JOIN Players p ON tp.Player_ID = p.Player_ID
        WHERE tp.Team_ID = ?;
    `;
    const [rows] = await db.query(query, [teamId]);
    
    if (rows.length === 0) {
        return res.status(404).json({ message: 'No players found for this team or team does not exist.' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching squad:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};