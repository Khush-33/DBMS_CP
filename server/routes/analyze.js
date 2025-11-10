const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        // Test 1: Player search by name (using idx_players_name)
        const [nameSearchResult] = await db.query('EXPLAIN SELECT * FROM Players WHERE Name LIKE ?', ['%Smith%']);

        // Test 2: Join performance for sold players (using multiple FK indexes)
        const [joinResult] = await db.query(`
            EXPLAIN SELECT 
                p.Name, t.Team_Name, tp.Price 
            FROM Team_Players tp
            JOIN Players p ON tp.Player_ID = p.Player_ID
            JOIN Teams t ON tp.Team_ID = t.Team_ID`);

        // Test 3: Bid history sorting (using idx_bids_time)
        const [bidResult] = await db.query(`
            EXPLAIN SELECT * FROM Bids 
            WHERE Player_ID = ? 
            ORDER BY Bid_Time DESC`, [1]);

        // Test 4: Filter by player status (using idx_players_status)
        const [statusResult] = await db.query(`
            EXPLAIN SELECT * FROM Players 
            WHERE Status = ?`, ['Available']);

        // Return all results
        res.json({
            nameSearch: nameSearchResult[0],
            joinQuery: joinResult[0],
            bidHistory: bidResult[0],
            statusFilter: statusResult[0]
        });
    } catch (error) {
        console.error('Error in analyze queries:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;