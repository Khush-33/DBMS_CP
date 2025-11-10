const db = require('./db');
const fs = require('fs').promises;
const path = require('path');

const initializeStoredProcedures = async () => {
    try {
        const dir = path.join(__dirname, 'schema', 'stored_procedures');
        const files = await fs.readdir(dir);

        for (const file of files) {
            if (!file.endsWith('.sql')) continue;
            const sql = await fs.readFile(path.join(dir, file), 'utf8');

            // Detect delimiter
            const delimMatch = sql.match(/DELIMITER\s+([^\r\n]+)/i);
            if (delimMatch) {
                const delimiter = delimMatch[1].trim(); // e.g., // or $$
                // Extract body between first DELIMITER <tok> and next 'DELIMITER ;' or end
                const afterFirst = sql.split(delimMatch[0])[1];
                const body = afterFirst.includes('DELIMITER ;')
                    ? afterFirst.split('DELIMITER ;')[0]
                    : afterFirst;

                // Split by delimiter token
                const parts = body.split(delimiter);
                for (let stmt of parts) {
                    stmt = stmt.trim();
                    if (!stmt) continue;
                    await db.query(stmt);
                }
            } else {
                // No delimiter — execute as-is (single statements only)
                const stmt = sql.trim();
                if (stmt) await db.query(stmt);
            }

            console.log(`Loaded stored procedure script: ${file}`);
        }

        console.log('Stored procedures initialized successfully');
    } catch (error) {
        console.error('Error initializing stored procedures:', error);
    }
};

module.exports = initializeStoredProcedures;