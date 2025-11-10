const db = require('./db');

const initializeAuth = async () => {
    try {
        // Respect existing external schema: just verify presence and log
        const [tables] = await db.query(`
            SELECT COUNT(1) AS cnt
            FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = 'User_Accounts'
        `);
        const hasTable = tables && tables[0] && tables[0].cnt > 0;

        if (!hasTable) {
            console.warn('Warning: User_Accounts table not found. Please create it before using auth.');
            return;
        }

        // Check expected columns (case-sensitive for your schema)
        const expected = ['User_ID','Username','Password_Hash','Role','Team_ID'];
        const [cols] = await db.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'User_Accounts'
        `);
        const present = new Set(cols.map(c => c.column_name));
        const missing = expected.filter(c => !present.has(c));
        if (missing.length) {
            console.warn('Warning: Missing columns in User_Accounts:', missing.join(', '));
        }

        console.log('Auth schema verified (external User_Accounts in use).');
    } catch (error) {
        console.error('Error verifying auth schema:', error);
    }
};

module.exports = initializeAuth;