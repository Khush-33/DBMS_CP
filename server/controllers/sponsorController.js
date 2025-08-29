const db = require('../config/db');

// @desc    Fetch all sponsors and the team they sponsor
// @route   GET /api/sponsors
exports.getAllSponsors = async (req, res) => {
  try {
    const query = `
        SELECT 
            s.Sponsor_ID, 
            s.Sponsor_Name, 
            s.Amount, 
            t.Team_Name
        FROM Sponsors s
        JOIN Teams t ON s.Team_ID = t.Team_ID
        ORDER BY s.Amount DESC;
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};