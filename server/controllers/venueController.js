const db = require('../config/db');

// @desc    Fetch all venues
// @route   GET /api/venues
exports.getAllVenues = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Venues');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};