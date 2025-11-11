const db = require('./db');

async function initializeTriggers() {
  try {
    // Trigger 1: after_player_sold_trigger - adjust team budget and player status on insert into Team_Players
    try {
      await db.query('DROP TRIGGER IF EXISTS after_player_sold_trigger');
      const trigger1 = `CREATE TRIGGER after_player_sold_trigger
        AFTER INSERT ON Team_Players
        FOR EACH ROW
        BEGIN
          UPDATE Teams
          SET Budget_Remaining = Budget_Remaining - NEW.Price
          WHERE Team_ID = NEW.Team_ID;

          UPDATE Players
          SET Status = 'Sold'
          WHERE Player_ID = NEW.Player_ID;
        END`;
      await db.query(trigger1);
      console.log('Created trigger after_player_sold_trigger');
    } catch (e) {
      console.error('Error creating after_player_sold_trigger:', e.message || e);
    }

    // Trigger 2: before_bid_insert_trigger - validate bid amounts
    try {
      await db.query('DROP TRIGGER IF EXISTS before_bid_insert_trigger');
      const trigger2 = `CREATE TRIGGER before_bid_insert_trigger
        BEFORE INSERT ON Bids
        FOR EACH ROW
        BEGIN
          DECLARE player_base_price DECIMAL(10,2);
          DECLARE team_budget DECIMAL(12,2);

          SELECT Base_Price INTO player_base_price FROM Players WHERE Player_ID = NEW.Player_ID;
          SELECT Budget_Remaining INTO team_budget FROM Teams WHERE Team_ID = NEW.Team_ID;

          IF player_base_price IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Player not found.';
          END IF;

          IF team_budget IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Team not found.';
          END IF;

          IF NEW.Bid_Amount > team_budget THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Team does not have sufficient budget for this bid.';
          END IF;

          IF NEW.Bid_Amount < player_base_price THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Bid amount cannot be less than the player''s base price.';
          END IF;
        END`;
      await db.query(trigger2);
      console.log('Created trigger before_bid_insert_trigger');
    } catch (e) {
      console.error('Error creating before_bid_insert_trigger:', e.message || e);
    }

    // Player audit log table and trigger
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS PlayerAuditLog (
          Log_ID INT AUTO_INCREMENT PRIMARY KEY,
          Player_ID INT NOT NULL,
          Changed_By_User VARCHAR(100) NULL,
          Change_Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          Field_Changed VARCHAR(100) NOT NULL,
          Old_Value TEXT NULL,
          New_Value TEXT NULL
        ) ENGINE=InnoDB`);
      console.log('Ensured table PlayerAuditLog exists');
    } catch (e) {
      console.error('Error ensuring PlayerAuditLog table:', e.message || e);
    }

    try {
      await db.query('DROP TRIGGER IF EXISTS after_player_update_audit');
      const auditTrigger = `CREATE TRIGGER after_player_update_audit
        AFTER UPDATE ON Players
        FOR EACH ROW
        BEGIN
          IF NEW.Name <> OLD.Name THEN
            INSERT INTO PlayerAuditLog (Player_ID, Changed_By_User, Field_Changed, Old_Value, New_Value)
            VALUES (NEW.Player_ID, NULL, 'Name', OLD.Name, NEW.Name);
          END IF;

          IF NEW.Role <> OLD.Role THEN
            INSERT INTO PlayerAuditLog (Player_ID, Changed_By_User, Field_Changed, Old_Value, New_Value)
            VALUES (NEW.Player_ID, NULL, 'Role', OLD.Role, NEW.Role);
          END IF;

          IF NEW.Country <> OLD.Country THEN
            INSERT INTO PlayerAuditLog (Player_ID, Changed_By_User, Field_Changed, Old_Value, New_Value)
            VALUES (NEW.Player_ID, NULL, 'Country', OLD.Country, NEW.Country);
          END IF;

          IF NEW.Base_Price <> OLD.Base_Price THEN
            INSERT INTO PlayerAuditLog (Player_ID, Changed_By_User, Field_Changed, Old_Value, New_Value)
            VALUES (NEW.Player_ID, NULL, 'Base_Price', CAST(OLD.Base_Price AS CHAR), CAST(NEW.Base_Price AS CHAR));
          END IF;

          IF NEW.Status <> OLD.Status THEN
            INSERT INTO PlayerAuditLog (Player_ID, Changed_By_User, Field_Changed, Old_Value, New_Value)
            VALUES (NEW.Player_ID, NULL, 'Status', OLD.Status, NEW.Status);
          END IF;
        END`;
      await db.query(auditTrigger);
      console.log('Created trigger after_player_update_audit');
    } catch (e) {
      console.error('Error creating after_player_update_audit:', e.message || e);
    }

    // Remove any bid finalization trigger to ensure budgets are only adjusted on final sale
    try {
      await db.query('DROP TRIGGER IF EXISTS after_bid_insert_finalize_sale');
      await db.query('DROP TRIGGER IF EXISTS after_player_sold_trigger');
      console.log('Ensured sale-related bid triggers are dropped (budget will be adjusted on sale only).');
    } catch (e) {
      console.error('Error dropping sale-related triggers:', e.message || e);
    }
  } catch (error) {
    console.error('Error initializing triggers:', error);
  }
}

module.exports = initializeTriggers;
