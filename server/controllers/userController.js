const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Map app roles <-> DB roles per schema: Manager, TeamOwner, Viewer, Auctioneer
const mapAppToDbRole = (appRole) => {
    switch ((appRole || '').toLowerCase()) {
        case 'owner':
            return 'TeamOwner';
        case 'manager':
            return 'Manager';
        case 'auctioneer':
            return 'Auctioneer';
        default:
            return 'Viewer';
    }
};

const mapDbToAppRole = (dbRole) => {
    switch (dbRole) {
        case 'TeamOwner':
            return 'owner';
        case 'Manager':
            return 'manager';
        case 'Auctioneer':
            return 'auctioneer';
        default:
            return 'user';
    }
};

// @desc    Register a new user
// @route   POST /api/users/register
exports.registerUser = async (req, res) => {
    try {
        const { username, password, role, teamId } = req.body;

        // Check if user already exists
        const [existingUser] = await db.query(
            'SELECT * FROM User_Accounts WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert directly into existing User_Accounts schema
        const dbRole = mapAppToDbRole(role);
        const [insertResult] = await db.query(
            'INSERT INTO User_Accounts (Username, Password_Hash, Role, Team_ID) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, dbRole, teamId || null]
        );
        const userIdOut = insertResult.insertId;

        // Generate token for auto-login after registration
        const token = jwt.sign(
            { 
                id: userIdOut,
                username: username,
                role: mapDbToAppRole(dbRole),
                teamId: teamId || null
            },
            process.env.JWT_SECRET || 'dev-secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: userIdOut,
            token,
            user: {
                userId: userIdOut,
                username: username,
                role: mapDbToAppRole(dbRole),
                teamId: teamId || null
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Login user
// @route   POST /api/users/login
exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Get user from existing schema
        const [users] = await db.query(
            'SELECT User_ID, Username, Password_Hash, Role, Team_ID FROM User_Accounts WHERE Username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

            // Check password
        const isMatch = await bcrypt.compare(password, user.Password_Hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.User_ID,
                username: user.Username,
                role: mapDbToAppRole(user.Role),
                teamId: user.Team_ID
            },
            process.env.JWT_SECRET || 'dev-secret',  
            { expiresIn: '24h' }
        );

        // Send response
        res.json({
            token,
            user: {
                userId: user.User_ID,
                username: user.Username,
                role: mapDbToAppRole(user.Role),
                teamId: user.Team_ID
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const [users] = await db.query(
            `SELECT 
                ua.User_ID,
                ua.Username,
                ua.Role,
                ua.Team_ID,
                t.Team_Name
            FROM User_Accounts ua
            LEFT JOIN Teams t ON ua.Team_ID = t.Team_ID
            WHERE ua.User_ID = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];
        res.json({
            userId: user.User_ID,
            username: user.Username,
            role: user.Role,
            teamId: user.Team_ID,
            teamName: user.Team_Name
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};