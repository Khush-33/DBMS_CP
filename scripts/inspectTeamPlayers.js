const db = require('../server/config/db');

(async () => {
  try {
    const [create] = await db.query("SHOW CREATE TABLE Team_Players");
    console.log('SHOW CREATE TABLE Team_Players:');
    console.log(create[0]['Create Table']);

    const [constraints] = await db.query(`
      SELECT tc.CONSTRAINT_NAME, tc.CONSTRAINT_TYPE, kcu.COLUMN_NAME
      FROM information_schema.TABLE_CONSTRAINTS tc
      JOIN information_schema.KEY_COLUMN_USAGE kcu
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
        AND tc.TABLE_NAME = kcu.TABLE_NAME
      WHERE tc.TABLE_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'Team_Players'
    `);

    console.log('\nConstraints / Keys:');
    console.table(constraints);

    process.exit(0);
  } catch (err) {
    console.error('Error inspecting Team_Players:', err);
    process.exit(1);
  }
})();
