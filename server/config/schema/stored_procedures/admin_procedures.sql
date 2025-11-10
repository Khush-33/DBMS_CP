-- Admin procedures for adding core entities
DELIMITER //

DROP PROCEDURE IF EXISTS AddTeam //
CREATE PROCEDURE AddTeam(
    IN p_team_name VARCHAR(100),
    IN p_owner_name VARCHAR(100)
)
BEGIN
    -- If Owner_Name column exists, this will work; otherwise ensure schema includes it
    INSERT INTO Teams (Team_Name, Owner_Name, Budget_Remaining)
    VALUES (p_team_name, p_owner_name, 1000000000);
END //

DROP PROCEDURE IF EXISTS AddSponsor //
CREATE PROCEDURE AddSponsor(
    IN p_sponsor_name VARCHAR(100),
    IN p_amount DECIMAL(12,2),
    IN p_team_id INT
)
BEGIN
    INSERT INTO Sponsors (Sponsor_Name, Amount, Team_ID)
    VALUES (p_sponsor_name, p_amount, p_team_id);
END //

DROP PROCEDURE IF EXISTS AddVenue //
CREATE PROCEDURE AddVenue(
    IN p_venue_name VARCHAR(150),
    IN p_city VARCHAR(100),
    IN p_capacity INT
)
BEGIN
    INSERT INTO Venues (Venue_Name, City, Capacity)
    VALUES (p_venue_name, p_city, p_capacity);
END //

DROP PROCEDURE IF EXISTS AddAuction //
CREATE PROCEDURE AddAuction(
    IN p_auction_date DATE,
    IN p_season INT,
    IN p_venue_id INT
)
BEGIN
    INSERT INTO Auctions (Auction_Date, Season, Venue_ID)
    VALUES (p_auction_date, p_season, p_venue_id);
END //

DELIMITER ;
