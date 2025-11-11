const db = require('./db');

// Run guarded schema migrations compatible with MySQL 8 (and avoids IF NOT EXISTS on ALTER COLUMN)
async function runSafeMigrations() {
  try {
    // Ensure Players.PlayerTier
    try {
      const [[pt]] = await db.query(`
        SELECT COUNT(*) AS cnt FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'Players' AND column_name = 'PlayerTier'
      `);
      if (!pt || pt.cnt === 0) {
        await db.query(`ALTER TABLE Players ADD COLUMN PlayerTier ENUM('Marquee','Capped','Uncapped') NOT NULL DEFAULT 'Uncapped' AFTER Country`);
        await db.query(`UPDATE Players SET PlayerTier = 'Marquee' WHERE Name IN ('Virat Kohli','Rohit Sharma','Pat Cummins','Jos Buttler')`);
        console.log('Added Players.PlayerTier and seeded marquee players');
      }
    } catch (e) {
      console.error('Migration: PlayerTier failed:', e.message || e);
    }

    // Ensure Player_Stats.Balls_Faced
    try {
      const [[bf]] = await db.query(`
        SELECT COUNT(*) AS cnt FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'Player_Stats' AND column_name = 'Balls_Faced'
      `);
      if (!bf || bf.cnt === 0) {
        await db.query(`ALTER TABLE Player_Stats ADD COLUMN Balls_Faced INT DEFAULT 0 AFTER Runs`);
        console.log('Added Player_Stats.Balls_Faced');
      }
    } catch (e) {
      console.error('Migration: Balls_Faced failed:', e.message || e);
    }

    // Ensure Player_Stats.Overs_Bowled
    try {
      const [[ob]] = await db.query(`
        SELECT COUNT(*) AS cnt FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'Player_Stats' AND column_name = 'Overs_Bowled'
      `);
      if (!ob || ob.cnt === 0) {
        await db.query(`ALTER TABLE Player_Stats ADD COLUMN Overs_Bowled DECIMAL(5,1) DEFAULT 0.0 AFTER Wickets`);
        console.log('Added Player_Stats.Overs_Bowled');
      }
    } catch (e) {
      console.error('Migration: Overs_Bowled failed:', e.message || e);
    }

    console.log('Schema migrations completed');
  } catch (err) {
    console.error('Fatal: migrations error', err);
  }
}

module.exports = runSafeMigrations;
