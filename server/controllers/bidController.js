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

// @desc    Add a bid (will trigger DB validations if triggers exist)
// @route   POST /api/bids
exports.addBid = async (req, res) => {
    try {
        const { Auction_ID = 1, Player_ID, Team_ID, Bid_Amount } = req.body;
        if (!Player_ID || !Team_ID || !Bid_Amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Insert into Bids; the BEFORE INSERT trigger should validate budget/base price
        await db.query('INSERT INTO Bids (Auction_ID, Player_ID, Team_ID, Bid_Amount) VALUES (?, ?, ?, ?)', [Auction_ID, Player_ID, Team_ID, Bid_Amount]);

        const [rows] = await db.query('SELECT b.*, t.Team_Name, p.Name as Player_Name FROM Bids b JOIN Teams t ON b.Team_ID = t.Team_ID JOIN Players p ON b.Player_ID = p.Player_ID WHERE b.Player_ID = ? ORDER BY b.Bid_Time DESC LIMIT 1', [Player_ID]);
        res.status(201).json(rows[0] || { message: 'Bid recorded' });
    } catch (error) {
        console.error('Error adding bid:', error);
        // If db.signaled an error from trigger, surface it
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};