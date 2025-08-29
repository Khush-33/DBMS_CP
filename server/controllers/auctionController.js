const db = require('../config/db');

// @desc    Fetch all auctions with venue details
// @route   GET /api/auctions
exports.getAllAuctions = async (req, res) => {
  try {
    const query = `
        SELECT 
            a.Auction_ID, 
            a.Auction_Date, 
            a.Season, 
            v.Venue_Name, 
            v.City
        FROM Auctions a
        LEFT JOIN Venues v ON a.Venue_ID = v.Venue_ID
        ORDER BY a.Season DESC;
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get details for a single auction, including all players bought
// @route   GET /api/auctions/:id
exports.getAuctionDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT
                p.Name AS Player_Name,
                p.Role,
                p.Country,
                t.Team_Name,
                tp.Price
            FROM Team_Players tp
            JOIN Players p ON tp.Player_ID = p.Player_ID
            JOIN Teams t ON tp.Team_ID = t.Team_ID
            WHERE tp.Auction_ID = ?
            ORDER BY t.Team_Name, tp.Price DESC;
        `;
        const [playersBought] = await db.query(query, [id]);

        if (playersBought.length === 0) {
            // It's possible an auction exists but no players have been logged yet
            return res.status(200).json({ message: 'No players recorded for this auction yet.', players: [] });
        }

        res.status(200).json({ players: playersBought });

    } catch (error) {
        console.error('Error fetching auction details:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};