const db = require('../config/db');

// @desc    Fetch all teams
// @route   GET /api/teams
exports.getAllTeams = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT Team_ID, Team_Name, Owner_Name, Budget_Remaining FROM Teams');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch a single team with its players and sponsors
// @route   GET /api/teams/:id
exports.getTeamDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const [team] = await db.query('SELECT * FROM Teams WHERE Team_ID = ?', [id]);
        if (team.length === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const [players] = await db.query(`
            SELECT p.Player_ID, p.Name, p.Role, tp.Price
            FROM Players p
            JOIN Team_Players tp ON p.Player_ID = tp.Player_ID
            WHERE tp.Team_ID = ?
        `, [id]);

        const [sponsors] = await db.query('SELECT Sponsor_Name, Amount FROM Sponsors WHERE Team_ID = ?', [id]);

        res.status(200).json({
            team: team[0],
            players,
            sponsors
        });

    } catch (error) {
        console.error('Error fetching team details:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};