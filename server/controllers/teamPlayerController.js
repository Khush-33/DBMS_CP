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
//          Creates a Bid so DB triggers can update Team_Players, Players.Status, and Teams budget.
// @route   POST /api/squads
exports.addTeamPlayer = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { Team_ID, Player_ID, Auction_ID = 1, Price } = req.body;
    if (!Team_ID || !Player_ID || !Price) {
      conn.release();
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await conn.beginTransaction();

    // Ensure player not already assigned in this auction
    const [existing] = await conn.query(
      'SELECT 1 FROM Team_Players WHERE Player_ID = ? AND Auction_ID = ? LIMIT 1',
      [Player_ID, Auction_ID]
    );
    if (existing.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'Player is already assigned to a team in this auction' });
    }

    // Optional budget check before bid
    const [[team]] = await conn.query('SELECT Budget_Remaining FROM Teams WHERE Team_ID = ?', [Team_ID]);
    if (!team) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: 'Team not found' });
    }
    if (team.Budget_Remaining < Price) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'Insufficient team budget' });
    }

    // Create a bid; AFTER INSERT trigger on Bids will upsert Team_Players, set player Sold, and adjust budget
    await conn.query(
      'INSERT INTO Bids (Auction_ID, Player_ID, Team_ID, Bid_Amount, Bid_Time) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [Auction_ID, Player_ID, Team_ID, Price]
    );

    await conn.commit();

    // Fetch the assignment row after trigger effects
    const [rows] = await db.query(
      `SELECT 
        tp.*,
        p.Name as Player_Name,
        t.Team_Name as Team_Name 
      FROM Team_Players tp 
      JOIN Players p ON tp.Player_ID = p.Player_ID 
      JOIN Teams t ON tp.Team_ID = t.Team_ID 
      WHERE tp.Player_ID = ? AND tp.Auction_ID = ?`,
      [Player_ID, Auction_ID]
    );

    conn.release();
    return res.status(201).json(rows[0] || { message: 'Player sold and recorded via bid' });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    conn.release();
    console.error('Error adding team player:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Player is already assigned to a team' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
};