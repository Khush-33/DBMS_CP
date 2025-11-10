const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @desc    Get query analysis results
// @route   GET /api/query-analysis
router.get('/', async (req, res) => {
  try {
    // Player search analysis
    const [playerSearch] = await db.query(`
      EXPLAIN SELECT * FROM Players 
      WHERE Name LIKE '%Smith%'`
    );

    // Join query analysis
    const [joinQuery] = await db.query(`
      EXPLAIN SELECT 
        p.Name, t.Team_Name, tp.Price 
      FROM Team_Players tp
      JOIN Players p ON tp.Player_ID = p.Player_ID
      JOIN Teams t ON tp.Team_ID = t.Team_ID`
    );

    // Bid history analysis
    const [bidHistory] = await db.query(`
      EXPLAIN SELECT * FROM Bids 
      WHERE Player_ID = 1 
      ORDER BY Bid_Time DESC`
    );

    // Status filter analysis
    const [statusFilter] = await db.query(`
      EXPLAIN SELECT * FROM Players 
      WHERE Status = 'Available'`
    );

    res.json({
      playerSearch: playerSearch[0],
      joinQuery: joinQuery[0],
      bidHistory: bidHistory[0],
      statusFilter: statusFilter[0]
    });
  } catch (error) {
    console.error('Error in query analysis:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;