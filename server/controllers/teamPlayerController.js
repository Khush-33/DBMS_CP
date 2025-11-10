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

// @desc    Add a player to a team (records a purchase)
// @route   POST /api/squads
exports.addTeamPlayer = async (req, res) => {
  try {
    const { Team_ID, Player_ID, Auction_ID = 1, Price } = req.body;
    if (!Team_ID || !Player_ID || !Price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await db.query('INSERT INTO Team_Players (Team_ID, Player_ID, Auction_ID, Price) VALUES (?, ?, ?, ?)', [Team_ID, Player_ID, Auction_ID, Price]);

    // Return the inserted row (best-effort)
    const [rows] = await db.query('SELECT tp.*, p.Name as Player_Name, t.Team_Name as Team_Name FROM Team_Players tp JOIN Players p ON tp.Player_ID = p.Player_ID JOIN Teams t ON tp.Team_ID = t.Team_ID WHERE tp.Player_ID = ? ORDER BY tp.Team_Player_ID DESC LIMIT 1', [Player_ID]);
    res.status(201).json(rows[0] || { message: 'Player assigned to team' });
  } catch (error) {
    console.error('Error adding team player:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};