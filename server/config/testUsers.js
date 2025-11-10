// Test user registration and login
const testUsers = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'Admin'
    },
    {
        username: 'team1owner',
        password: 'team1pass',
        role: 'TeamOwner',
        teamId: 1
    },
    {
        username: 'viewer1',
        password: 'viewer1pass',
        role: 'Viewer'
    }
];

const registerTestUsers = async () => {
    const db = require('./db');
    const bcrypt = require('bcryptjs');

    for (const user of testUsers) {
        try {
            // Check if user exists
            const [existing] = await db.query(
                'SELECT * FROM User_Accounts WHERE username = ?',
                [user.username]
            );

            if (existing.length === 0) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);

                await db.query(
                    'INSERT INTO User_Accounts (username, password, role, team_id) VALUES (?, ?, ?, ?)',
                    [user.username, hashedPassword, user.role, user.teamId || null]
                );

                console.log(`Created test user: ${user.username}`);
            }
        } catch (error) {
            console.error(`Error creating test user ${user.username}:`, error);
        }
    }
};

module.exports = registerTestUsers;