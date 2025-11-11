const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper to check if a column exists in a table
async function columnExists(table, column) {
  const [rows] = await db.query(
    `SELECT COUNT(1) AS cnt
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column]
  );
  return rows && rows[0] && rows[0].cnt > 0;
}

// Add Team via stored procedure
router.post('/add-team', async (req, res) => {
  try {
    const { teamName, ownerName } = req.body;
    if (!teamName || !ownerName) return res.status(400).json({ message: 'teamName and ownerName are required' });
    try {
      await db.query('CALL AddTeam(?, ?)', [teamName, ownerName]);
      return res.json({ message: 'Team added (procedure)' });
    } catch (spErr) {
      // Fallback: direct INSERT depending on available columns
      const hasOwner = await columnExists('Teams', 'Owner_Name');
      if (hasOwner) {
        await db.query(
          'INSERT INTO Teams (Team_Name, Owner_Name, Budget_Remaining) VALUES (?, ?, 1000000000)',
          [teamName, ownerName]
        );
      } else {
        await db.query(
          'INSERT INTO Teams (Team_Name, Budget_Remaining) VALUES (?, 1000000000)',
          [teamName]
        );
      }
      return res.json({ message: 'Team added (fallback insert)' });
    }
  } catch (e) {
    console.error('AddTeam failed:', e);
    res.status(500).json({ message: e.sqlMessage || e.message || 'AddTeam failed' });
  }
});

// Add Sponsor via stored procedure
router.post('/add-sponsor', async (req, res) => {
  try {
    const { sponsorName, amount, teamId } = req.body;
    if (!sponsorName || amount == null || !teamId) return res.status(400).json({ message: 'sponsorName, amount, teamId are required' });
    try {
      await db.query('CALL AddSponsor(?, ?, ?)', [sponsorName, amount, teamId]);
      return res.json({ message: 'Sponsor added (procedure)' });
    } catch (spErr) {
      await db.query('INSERT INTO Sponsors (Sponsor_Name, Amount, Team_ID) VALUES (?, ?, ?)', [sponsorName, amount, teamId]);
      return res.json({ message: 'Sponsor added (fallback insert)' });
    }
  } catch (e) {
    console.error('AddSponsor failed:', e);
    res.status(500).json({ message: e.sqlMessage || e.message || 'AddSponsor failed' });
  }
});

// Add Venue via stored procedure
router.post('/add-venue', async (req, res) => {
  try {
    const { venueName, city, capacity } = req.body;
    if (!venueName || !city || capacity == null) return res.status(400).json({ message: 'venueName, city, capacity are required' });
    try {
      await db.query('CALL AddVenue(?, ?, ?)', [venueName, city, capacity]);
      return res.json({ message: 'Venue added (procedure)' });
    } catch (spErr) {
      await db.query('INSERT INTO Venues (Venue_Name, City, Capacity) VALUES (?, ?, ?)', [venueName, city, capacity]);
      return res.json({ message: 'Venue added (fallback insert)' });
    }
  } catch (e) {
    console.error('AddVenue failed:', e);
    res.status(500).json({ message: e.sqlMessage || e.message || 'AddVenue failed' });
  }
});

// Add Auction via stored procedure
router.post('/add-auction', async (req, res) => {
  try {
    const { auctionDate, season, venueId } = req.body;
    if (!auctionDate || !season || !venueId) return res.status(400).json({ message: 'auctionDate, season, venueId are required' });
    try {
      await db.query('CALL AddAuction(?, ?, ?)', [auctionDate, season, venueId]);
      return res.json({ message: 'Auction added (procedure)' });
    } catch (spErr) {
      await db.query('INSERT INTO Auctions (Auction_Date, Season, Venue_ID) VALUES (?, ?, ?)', [auctionDate, season, venueId]);
      return res.json({ message: 'Auction added (fallback insert)' });
    }
  } catch (e) {
    console.error('AddAuction failed:', e);
    res.status(500).json({ message: e.sqlMessage || e.message || 'AddAuction failed' });
  }
});

module.exports = router;
