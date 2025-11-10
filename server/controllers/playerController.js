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

// @desc    Add a new player (calls stored procedure if available)
// @route   POST /api/players
exports.addPlayer = async (req, res) => {
  try {
    const { Name, Role, Base_Price, Country } = req.body;
    if (!Name || !Role || !Base_Price || !Country) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Try to call stored procedure; fall back to direct INSERT if it fails
    try {
      await db.query('CALL AddPlayerToAuction(?, ?, ?, ?)', [Name, Role, Base_Price, Country]);
    } catch (spErr) {
      console.warn('Stored procedure call failed or not found, falling back to INSERT:', spErr.message);
      await db.query('INSERT INTO Players (Name, Role, Base_Price, Country, Status) VALUES (?, ?, ?, ?, ?)', [Name, Role, Base_Price, Country, 'Available']);
    }

    // Fetch recently added player (best-effort by name)
    const [rows] = await db.query('SELECT Player_ID, Name, Role, Base_Price, Country, Status FROM Players WHERE Name = ? ORDER BY Player_ID DESC LIMIT 1', [Name]);
    const added = rows[0] || null;

    // If server maintains an in-memory list used by auctions, we can't update it here directly
    // The server will re-hydrate at restart; clients should re-fetch players after success.

    return res.status(201).json({ message: 'Player added', player: added });
  } catch (error) {
    console.error('Error adding player:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};