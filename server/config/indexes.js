const db = require('./db');

async function indexExists(tableName, indexName) {
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

async function createIndexes() {
    try {
        // Index definitions as { table, name, sql }
        const indexes = [
            { table: 'Auctions', name: 'idx_auctions_venue', sql: 'CREATE INDEX idx_auctions_venue ON Auctions(Venue_ID)' },
            { table: 'Bids', name: 'idx_bids_auction', sql: 'CREATE INDEX idx_bids_auction ON Bids(Auction_ID)' },
            { table: 'Bids', name: 'idx_bids_player', sql: 'CREATE INDEX idx_bids_player ON Bids(Player_ID)' },
            { table: 'Bids', name: 'idx_bids_team', sql: 'CREATE INDEX idx_bids_team ON Bids(Team_ID)' },
            { table: 'Player_Stats', name: 'idx_player_stats_player', sql: 'CREATE INDEX idx_player_stats_player ON Player_Stats(Player_ID)' },
            { table: 'Team_Players', name: 'idx_team_players_team', sql: 'CREATE INDEX idx_team_players_team ON Team_Players(Team_ID)' },
            { table: 'Team_Players', name: 'idx_team_players_auction', sql: 'CREATE INDEX idx_team_players_auction ON Team_Players(Auction_ID)' },
            { table: 'Team_Sponsors', name: 'idx_team_sponsors_team', sql: 'CREATE INDEX idx_team_sponsors_team ON Team_Sponsors(Team_ID)' },
            { table: 'Team_Sponsors', name: 'idx_team_sponsors_sponsor', sql: 'CREATE INDEX idx_team_sponsors_sponsor ON Team_Sponsors(Sponsor_ID)' }
        ];

        for (const idx of indexes) {
            try {
                const exists = await indexExists(idx.table, idx.name);
                if (!exists) {
                    await db.query(idx.sql);
                    console.log(`Created index ${idx.name} on ${idx.table}`);
                } else {
                    // Already exists; skip
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