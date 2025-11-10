const db = require('./db');

const indexUtils = {
    async tableExists(tableName) {
        const sql = `
            SELECT COUNT(1) as cnt
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
              AND table_name = ?
        `;
        const [rows] = await db.query(sql, [tableName]);
        return rows && rows[0] && rows[0].cnt > 0;
    },

    async indexExists(tableName, indexName) {
        const sql = `
            SELECT COUNT(1) as cnt
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = ?
              AND index_name = ?
        `;
        const [rows] = await db.query(sql, [tableName, indexName]);
        return rows && rows[0] && rows[0].cnt > 0;
    }
};

async function createIndexes() {
    try {
        // Index definitions as { table, name, sql }
        const indexes = [
            // Foreign key / join indexes
            { table: 'Auctions', name: 'idx_auctions_venue', sql: 'CREATE INDEX idx_auctions_venue ON Auctions(Venue_ID)' },
            { table: 'Bids', name: 'idx_bids_auction', sql: 'CREATE INDEX idx_bids_auction ON Bids(Auction_ID)' },
            { table: 'Bids', name: 'idx_bids_player', sql: 'CREATE INDEX idx_bids_player ON Bids(Player_ID)' },
            { table: 'Bids', name: 'idx_bids_team', sql: 'CREATE INDEX idx_bids_team ON Bids(Team_ID)' },
            { table: 'Team_Players', name: 'idx_teamplayers_team', sql: 'CREATE INDEX idx_teamplayers_team ON Team_Players(Team_ID)' },
            { table: 'Team_Players', name: 'idx_teamplayers_auction', sql: 'CREATE INDEX idx_teamplayers_auction ON Team_Players(Auction_ID)' },
            { table: 'Player_Stats', name: 'idx_playerstats_player', sql: 'CREATE INDEX idx_playerstats_player ON Player_Stats(Player_ID)' },
            { table: 'Sponsors', name: 'idx_sponsors_team', sql: 'CREATE INDEX idx_sponsors_team ON Sponsors(Team_ID)' },
            { table: 'User_Accounts', name: 'idx_useraccounts_team', sql: 'CREATE INDEX idx_useraccounts_team ON User_Accounts(Team_ID)' },

            // Frequently filtered columns
            { table: 'Players', name: 'idx_players_status', sql: "CREATE INDEX idx_players_status ON Players(Status)" },
            { table: 'Players', name: 'idx_players_name', sql: "CREATE INDEX idx_players_name ON Players(Name)" },
            { table: 'Auctions', name: 'idx_auctions_season', sql: 'CREATE INDEX idx_auctions_season ON Auctions(Season)' },

            // Ordering
            { table: 'Bids', name: 'idx_bids_time', sql: 'CREATE INDEX idx_bids_time ON Bids(Bid_Time)' }
        ];

        for (const idx of indexes) {
            try {
                // First check if the table exists
                const tableExists = await indexUtils.tableExists(idx.table);
                if (!tableExists) {
                    console.log(`Skipping index creation for ${idx.name}: Table ${idx.table} does not exist`);
                    continue;
                }

                // Then check if the index already exists
                const exists = await indexUtils.indexExists(idx.table, idx.name);
                if (!exists) {
                    await db.query(idx.sql);
                    console.log(`Created index ${idx.name} on ${idx.table}`);
                } else {
                    // Already exists; skip silently
                    // console.log(`Index ${idx.name} on ${idx.table} already exists`);
                }
            } catch (err) {
                // Log unexpected errors but continue creating other indexes
                console.error(`Error creating index ${idx.name} on ${idx.table}:`, err.message || err);
            }
        }
    } catch (error) {
        console.error('Error creating database indexes:', error);
    }
}

module.exports = createIndexes;