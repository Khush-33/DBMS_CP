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

// @desc    Add a bid (simple insert; DB triggers will validate if present)
// @route   POST /api/bids
exports.addBid = async (req, res) => {
    try {
        const { Auction_ID, Player_ID, Team_ID, Bid_Amount } = req.body;
        if (!Auction_ID || !Player_ID || !Team_ID || !Bid_Amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        await db.query('INSERT INTO Bids (Auction_ID, Player_ID, Team_ID, Bid_Amount) VALUES (?, ?, ?, ?)', 
            [Auction_ID, Player_ID, Team_ID, Bid_Amount]);
        return res.status(201).json({ message: 'Bid added successfully' });
    } catch (error) {
        console.error('Error adding bid:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};