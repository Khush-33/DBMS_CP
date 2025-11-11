# IPL Auction Management System - Complete Features Documentation

## 📊 DATABASE FEATURES

### 1. **VIEWS (5 Views)**

#### View 1: `SoldPlayerDetails`
**Purpose:** Display complete information about sold players with their teams
**Joins Used:** 
- `Team_Players` JOIN `Players` (ON Player_ID)
- `Team_Players` JOIN `Teams` (ON Team_ID)
**Columns:** Player_ID, Team_ID, Player_Name, Role, Country, Team_Name, Sold_Price, Auction_ID
**Usage:** Used in Reports page to show all sold players with their purchase details

#### View 2: `TeamBudgetSummary`
**Purpose:** Show team budget status and total spending
**Joins Used:** Teams with subquery on Team_Players
**Columns:** Team_ID, Team_Name, Budget_Remaining, Total_Spent (computed)
**Usage:** Financial reports and budget tracking for teams

#### View 3: `PlayerPerformanceSummary`
**Purpose:** Display player statistics for season 2025
**Joins Used:** `Players` LEFT JOIN `Player_Stats` (ON Player_ID AND Season = 2025)
**Columns:** Player_ID, Name, Role, Country, Status, Matches_Played, Runs, Wickets, Strike_Rate, Economy
**Usage:** Player statistics page and performance analysis

#### View 4: `PlayerCareerSummaryView`
**Purpose:** Aggregate career statistics across all seasons
**Joins Used:** `Players` LEFT JOIN `Player_Stats` (ON Player_ID) with GROUP BY
**Columns:** Player_ID, Name, Role, Country, PlayerTier, Seasons_Played, Career_Matches, Career_Runs, Career_Balls_Faced, Career_Wickets, Career_Overs_Bowled, Career_Strike_Rate, Career_Economy_Rate
**Usage:** Advanced analytics and player career tracking

#### View 5: `v_BiddingHistory`
**Purpose:** Simplified bidding history with player and team names
**Joins Used:** 
- `Bids` JOIN `Players` (ON Player_ID)
- `Bids` JOIN `Teams` (ON Team_ID)
**Columns:** Bid_ID, Auction_ID, Player_ID, Player_Name, Team_ID, Team_Name, Bid_Amount, Bid_Time
**Usage:** Bid history display and auction analytics

---

### 2. **TRIGGERS (3 Triggers)**

#### Trigger 1: `after_player_sold_trigger`
**Type:** AFTER INSERT
**Table:** Team_Players
**Purpose:** Automatically update team budget and player status when a player is sold
**Actions:**
1. Deducts the purchase price from team's Budget_Remaining
2. Updates player Status to 'Sold'
**Business Logic:** Ensures data consistency when a sale is finalized

#### Trigger 2: `before_bid_insert_trigger`
**Type:** BEFORE INSERT
**Table:** Bids
**Purpose:** Validate bid amounts before insertion
**Validations:**
1. Checks if player exists
2. Checks if team exists
3. Validates team has sufficient budget
4. Ensures bid is not less than player's base price
**Error Handling:** Raises SQLSTATE '45000' with descriptive error messages

#### Trigger 3: `after_player_update_audit`
**Type:** AFTER UPDATE
**Table:** Players
**Purpose:** Maintain audit log of all player data changes
**Tracked Fields:**
- Name
- Role
- Country
- Base_Price
- Status
**Audit Table:** PlayerAuditLog (Log_ID, Player_ID, Changed_By_User, Change_Timestamp, Field_Changed, Old_Value, New_Value)
**Usage:** Compliance, tracking changes, and data integrity

---

### 3. **INDEXES (13 Indexes)**

#### Foreign Key / Join Indexes:
1. **idx_auctions_venue** - ON Auctions(Venue_ID)
   - Purpose: Speed up joins between Auctions and Venues
   
2. **idx_bids_auction** - ON Bids(Auction_ID)
   - Purpose: Fast retrieval of bids for specific auctions
   
3. **idx_bids_player** - ON Bids(Player_ID)
   - Purpose: Quick lookup of all bids for a player
   
4. **idx_bids_team** - ON Bids(Team_ID)
   - Purpose: Retrieve all bids by a specific team
   
5. **idx_teamplayers_team** - ON Team_Players(Team_ID)
   - Purpose: Fast squad retrieval for teams
   
6. **idx_teamplayers_auction** - ON Team_Players(Auction_ID)
   - Purpose: Get all players sold in an auction
   
7. **idx_playerstats_player** - ON Player_Stats(Player_ID)
   - Purpose: Quick player statistics lookup
   
8. **idx_sponsors_team** - ON Sponsors(Team_ID)
   - Purpose: Retrieve sponsors for a team
   
9. **idx_useraccounts_team** - ON User_Accounts(Team_ID)
   - Purpose: Find users associated with a team

#### Filtering Indexes:
10. **idx_players_status** - ON Players(Status)
    - Purpose: Filter players by availability (Available/Sold/Unsold)
    
11. **idx_players_name** - ON Players(Name)
    - Purpose: Search players by name
    
12. **idx_auctions_season** - ON Auctions(Season)
    - Purpose: Filter auctions by season

#### Ordering Index:
13. **idx_bids_time** - ON Bids(Bid_Time)
    - Purpose: Sort bids chronologically

---

### 4. **STORED PROCEDURES (4 Procedures)**

#### Procedure 1: `AddTeam`
**Parameters:** 
- IN p_team_name VARCHAR(100)
- IN p_owner_name VARCHAR(100)
**Purpose:** Add a new team with default budget of 100 Cr
**Usage:** Team registration and setup

#### Procedure 2: `AddSponsor`
**Parameters:**
- IN p_sponsor_name VARCHAR(100)
- IN p_amount DECIMAL(12,2)
- IN p_team_id INT
**Purpose:** Register a new sponsor for a team
**Usage:** Sponsor management

#### Procedure 3: `AddVenue`
**Parameters:**
- IN p_venue_name VARCHAR(100)
- IN p_city VARCHAR(50)
- IN p_capacity INT
**Purpose:** Add a new auction venue
**Usage:** Venue setup

#### Procedure 4: `AddAuction`
**Parameters:**
- IN p_auction_date DATE
- IN p_season YEAR
- IN p_venue_id INT
**Purpose:** Create a new auction event
**Usage:** Auction scheduling

---

### 5. **COMPLEX JOINS USED**

#### Join 1: Sold Players with Team Details
```sql
SELECT p.Name, p.Role, p.Country, t.Team_Name, tp.Price
FROM Team_Players tp
JOIN Players p ON tp.Player_ID = p.Player_ID
JOIN Teams t ON tp.Team_ID = t.Team_ID
```
**Purpose:** Display complete sold player information
**Used In:** AuctionController.getAuctionDetails(), Reports page

#### Join 2: Auction with Venue Information
```sql
SELECT a.Auction_ID, a.Auction_Date, a.Season, v.Venue_Name, v.City
FROM Auctions a
LEFT JOIN Venues v ON a.Venue_ID = v.Venue_ID
```
**Purpose:** Show auction details with venue
**Used In:** AuctionController.getAllAuctions()

#### Join 3: Bidding History with Player and Team Names
```sql
SELECT B.Bid_ID, P.Name AS Player_Name, T.Team_Name, B.Bid_Amount, B.Bid_Time
FROM Bids B
JOIN Players P ON B.Player_ID = P.Player_ID
JOIN Teams T ON B.Team_ID = T.Team_ID
```
**Purpose:** Complete bid history with readable names
**Used In:** v_BiddingHistory view, Bids page

#### Join 4: Player Performance with Stats
```sql
SELECT P.Name, P.Role, PS.Matches_Played, PS.Runs, PS.Wickets
FROM Players P
LEFT JOIN Player_Stats PS ON P.Player_ID = PS.Player_ID AND PS.Season = 2025
```
**Purpose:** Player statistics display
**Used In:** PlayerPerformanceSummary view

#### Join 5: Team Squad Retrieval
```sql
SELECT p.Name, p.Role, p.Country, tp.Price
FROM Team_Players tp
JOIN Players p ON tp.Player_ID = p.Player_ID
WHERE tp.Team_ID = ?
```
**Purpose:** Get complete squad for a team
**Used In:** TeamPlayersPage, Squad management

---

## 🎮 BUTTON FUNCTIONALITIES

### 1. **AUCTION CONTROL BUTTONS**

#### Button: "Start Auction"
**Location:** AuctionPortalPage (Auctioneer only)
**Function:** Initiates the auction process
**Action:**
- Sends WebSocket message: `{ type: 'START_AUCTION' }`
- Changes auction status from 'pending' to 'active'
- Loads first available player
- Starts 10-second countdown timer
**Access:** Only Auctioneer role

#### Button: "Next Player"
**Location:** AuctionPortalPage (Auctioneer only)
**Function:** Move to next player after current player is sold
**Action:**
- Sends WebSocket message: `{ type: 'NEXT_PLAYER' }`
- Increments currentPlayerIndex
- Loads next available player
- Resets bid amount and timer
- Updates auction state to all clients
**Access:** Only Auctioneer role, only when status is 'sold'

#### Button: "Reset Auction"
**Location:** AuctionPortalPage (Auctioneer only)
**Function:** Reset entire auction to initial state
**Action:**
- Calls API: `POST /api/admin/reset-auction`
- Clears all Team_Players entries
- Resets all player Status to 'Available'
- Restores team budgets to 100 Cr
- Clears bid history
- Resets auction state to 'pending'
**Warning:** This is a destructive operation
**Access:** Only Auctioneer role

#### Button: "Place Bid" (Team Paddles)
**Location:** AuctionPortalPage (Team Owners/Managers)
**Function:** Place a bid for current player
**Action:**
- Sends WebSocket message: `{ type: 'PLACE_BID', team, amount }`
- Validates bid amount (must be in 0.5 Cr increments)
- Checks team budget sufficiency
- Prevents same team from consecutive bids
- Inserts bid into Bids table
- Resets 10-second timer
- Updates highest bidder
**Validation:**
- Amount must be multiple of 0.5 Cr (5,000,000)
- Amount must be >= current bid + 0.5 Cr
- Team must have sufficient budget
**Access:** Only Team Owners/Managers for their team

---

### 2. **CRUD OPERATION BUTTONS**

#### Button: "Add New Player"
**Location:** PlayersPage
**Function:** Open modal to add new player
**Action:**
- Opens AddPlayerModal
- Form fields: Name, Role, Country, Base_Price, Status
- On submit: `POST /api/players`
- Inserts new player into Players table
- Refreshes player list

#### Button: "Edit Player"
**Location:** PlayersPage (each row)
**Function:** Modify player details
**Action:**
- Opens EditPlayerModal with pre-filled data
- On submit: `PUT /api/players/:id`
- Updates player record
- Triggers `after_player_update_audit` trigger
- Refreshes player list

#### Button: "Delete Player"
**Location:** PlayersPage (each row)
**Function:** Remove player from system
**Action:**
- Confirmation dialog
- `DELETE /api/players/:id`
- Removes player record
- Cascades to related records
**Warning:** Cannot delete if player is sold

#### Button: "Save" (Teams Page)
**Location:** TeamsPage
**Function:** Add new team
**Action:**
- Calls stored procedure: `CALL AddTeam(?, ?)`
- Creates team with 100 Cr budget
- Refreshes team list
**CSS Class:** `btn-save` (blue gradient)

#### Button: "Save" (Auctions Page)
**Location:** AuctionsPage
**Function:** Create new auction
**Action:**
- Calls stored procedure: `CALL AddAuction(?, ?, ?)`
- Links auction to venue
- Sets season and date
**CSS Class:** `btn-save` (blue gradient)

#### Button: "Save" (Venues Page)
**Location:** VenuesPage
**Function:** Add new venue
**Action:**
- Calls stored procedure: `CALL AddVenue(?, ?, ?)`
- Creates venue with capacity
**CSS Class:** `btn-save` (blue gradient)

#### Button: "Save" (Sponsors Page)
**Location:** SponsorsPage
**Function:** Register new sponsor
**Action:**
- Calls stored procedure: `CALL AddSponsor(?, ?, ?)`
- Links sponsor to team
- Records sponsorship amount
**CSS Class:** `btn-save` (blue gradient)

---

### 3. **FILTER & SEARCH BUTTONS**

#### Button: "Apply"
**Location:** BidsPage, TeamPlayersPage
**Function:** Apply selected filters
**Action:**
- Filters data based on selected criteria
- Updates table display
- Maintains filter state
**CSS Class:** `btn-apply` (purple gradient)

#### Button: "Reset"
**Location:** BidsPage, TeamPlayersPage
**Function:** Clear all filters
**Action:**
- Resets filter selections to default
- Shows all records
- Clears search inputs
**CSS Class:** `btn-reset` (red gradient)

#### Button: "Post Bid"
**Location:** BidsPage
**Function:** Manually record a bid
**Action:**
- `POST /api/bids`
- Validates with `before_bid_insert_trigger`
- Inserts bid record
- Updates bid history
**CSS Class:** `btn-accent` (orange)

---

### 4. **AUTHENTICATION BUTTONS**

#### Button: "Login"
**Location:** LoginPage
**Function:** Authenticate user
**Action:**
- `POST /api/users/login`
- Validates credentials (bcrypt)
- Returns JWT token
- Stores token in localStorage
- Redirects based on role:
  - Auctioneer → `/dashboard/auctioneer`
  - Owner/Manager → `/dashboard/owner`
  - User → `/dashboard/user`
**CSS Class:** `btn-save` (blue gradient)

#### Button: "Register"
**Location:** LoginPage
**Function:** Create new user account
**Action:**
- `POST /api/users/register`
- Hashes password with bcrypt
- Creates User_Accounts record
- Links to team (if Owner/Manager)
- Auto-login after registration
**CSS Class:** `btn-add` (green gradient)

#### Button: "Logout"
**Location:** Navbar
**Function:** End user session
**Action:**
- Clears localStorage token
- Resets auth context
- Redirects to login page
**CSS Class:** `btn-outline` (gray border)

---

### 5. **NAVIGATION BUTTONS**

#### Button: "Dashboard"
**Location:** Navbar (when logged in)
**Function:** Navigate to role-specific dashboard
**Routes:**
- Auctioneer: `/dashboard/auctioneer`
- Owner/Manager: `/dashboard/owner`
- User: `/dashboard/user`

#### Button: "Sign In"
**Location:** Navbar (when logged out)
**Function:** Navigate to login page
**Route:** `/login`

---

## 🔄 REAL-TIME FEATURES (WebSocket)

### WebSocket Messages:

1. **AUCTION_STATE** - Broadcast current auction status to all clients
2. **TEAMS_UPDATE** - Send updated team budgets
3. **BID_LOG** - Real-time bid notifications
4. **SOLD_ANNOUNCEMENT** - Player sold/unsold announcement
5. **CONNECTED_TEAMS** - Show which teams are online
6. **REGISTER_ROLE** - Client registers as Auctioneer or Team

---

## 📈 ANALYTICS & REPORTS

### Available Reports:
1. **Sold Player Details** - Uses `SoldPlayerDetails` view
2. **Team Budget Summary** - Uses `TeamBudgetSummary` view
3. **Player Performance** - Uses `PlayerPerformanceSummary` view
4. **Player Career Summary** - Uses `PlayerCareerSummaryView` view
5. **Player Audit Log** - From `PlayerAuditLog` table
6. **Team Squad** - Uses `GetTeamSquad` stored procedure

---

## 🎨 UI FEATURES

### Button Styling System:
- **btn-add** (Green) - Create/Register operations
- **btn-save** (Blue) - Save/Submit operations
- **btn-apply** (Purple) - Apply filters
- **btn-reset** (Red) - Reset/Clear operations
- **btn-close** (Gray) - Close/Cancel operations
- **btn-outline** (Gray border) - Secondary actions

### Pages:
1. **HomePage** - Landing page with features
2. **LoginPage** - Authentication with role selection
3. **PlayersPage** - Player CRUD with EnhancedTable
4. **TeamsPage** - Team management with EnhancedTable
5. **AuctionsPage** - Auction scheduling
6. **BidsPage** - Bid history and manual bidding
7. **SponsorsPage** - Sponsor management
8. **VenuesPage** - Venue management
9. **TeamPlayersPage** - Squad management
10. **PlayerStatsPage** - Player statistics
11. **ReportsPage** - Analytics and reports
12. **AuctionPortalPage** - Live auction interface

---

## 🔐 SECURITY FEATURES

1. **JWT Authentication** - Token-based auth
2. **Password Hashing** - bcrypt with salt rounds
3. **Role-Based Access Control** - Different permissions per role
4. **SQL Injection Prevention** - Parameterized queries
5. **CORS Protection** - Configured CORS middleware

---

## 📊 DATABASE SCHEMA

### Main Tables:
1. **Players** - Player information
2. **Teams** - Team details and budgets
3. **Auctions** - Auction events
4. **Bids** - Bidding history
5. **Team_Players** - Sold players (junction table)
6. **Player_Stats** - Player performance statistics
7. **Sponsors** - Team sponsors
8. **Venues** - Auction venues
9. **User_Accounts** - Authentication and authorization
10. **PlayerAuditLog** - Audit trail for player changes

---

This documentation covers all major database features, button functionalities, and system capabilities of the IPL Auction Management System.
