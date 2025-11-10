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
  } catch (error) {
    console.error('Error initializing triggers:', error);
  }
}

module.exports = initializeTriggers;
