const db = require('../config/db');

// @desc    Fetch all bids with team and player names
// @route   GET /api/bids
exports.getAllBids = async (req, res) => {
    try {
        const query = `
            SELECT
                b.Bid_ID,
                p.Name AS Player_Name,
                t.Team_Name,
                b.Bid_Amount,
                b.Bid_Time,
                b.Auction_ID
            FROM Bids b
            JOIN Players p ON b.Player_ID = p.Player_ID
            JOIN Teams t ON b.Team_ID = t.Team_ID
            ORDER BY b.Bid_Time DESC;
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};