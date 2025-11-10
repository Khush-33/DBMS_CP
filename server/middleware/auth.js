const db = require('../config/db');

const protect = async (req, res, next) => {
    try {
        const userId = req.headers['user-id'];
        
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const [users] = await db.query(
            'SELECT * FROM User_Accounts WHERE User_ID = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { protect };