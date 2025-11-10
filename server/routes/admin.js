const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Add Team via stored procedure
router.post('/add-team', async (req, res) => {
  try {
    const { teamName, ownerName } = req.body;
    if (!teamName || !ownerName) return res.status(400).json({ message: 'teamName and ownerName are required' });
    await db.query('CALL AddTeam(?, ?)', [teamName, ownerName]);
    res.json({ message: 'Team added' });
  } catch (e) {
    console.error('AddTeam failed:', e);
    res.status(500).json({ message: 'AddTeam failed' });
  }
});

// Add Sponsor via stored procedure
router.post('/add-sponsor', async (req, res) => {
  try {
    const { sponsorName, amount, teamId } = req.body;
    if (!sponsorName || amount == null || !teamId) return res.status(400).json({ message: 'sponsorName, amount, teamId are required' });
    await db.query('CALL AddSponsor(?, ?, ?)', [sponsorName, amount, teamId]);
    res.json({ message: 'Sponsor added' });
  } catch (e) {
    console.error('AddSponsor failed:', e);
    res.status(500).json({ message: 'AddSponsor failed' });
  }
});

// Add Venue via stored procedure
router.post('/add-venue', async (req, res) => {
  try {
    const { venueName, city, capacity } = req.body;
    if (!venueName || !city || capacity == null) return res.status(400).json({ message: 'venueName, city, capacity are required' });
    await db.query('CALL AddVenue(?, ?, ?)', [venueName, city, capacity]);
    res.json({ message: 'Venue added' });
  } catch (e) {
    console.error('AddVenue failed:', e);
    res.status(500).json({ message: 'AddVenue failed' });
  }
});

// Add Auction via stored procedure
router.post('/add-auction', async (req, res) => {
  try {
    const { auctionDate, season, venueId } = req.body;
    if (!auctionDate || !season || !venueId) return res.status(400).json({ message: 'auctionDate, season, venueId are required' });
    await db.query('CALL AddAuction(?, ?, ?)', [auctionDate, season, venueId]);
    res.json({ message: 'Auction added' });
  } catch (e) {
    console.error('AddAuction failed:', e);
    res.status(500).json({ message: 'AddAuction failed' });
  }
});

module.exports = router;
