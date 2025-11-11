const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db'); // Import the database connection
const createIndexes = require('./config/indexes'); // Import the index creation function

// Load env vars
dotenv.config();

// --- DATA (Fetched from the database) ---
let availablePlayers = [];
let teamsData = [];
let clients = new Map(); // Tracks connected clients and their roles

// --- Bidding step (0.5 Cr) ---
const STEP = 5_000_000; // 0.5 Cr in INR
const roundUpToStep = (amount) => Math.ceil(amount / STEP) * STEP;
const formatCr = (amount) => {
    const cr = amount / 10_000_000;
    return Number.isInteger(cr) ? `${cr.toFixed(0)} Cr` : `${cr.toFixed(1)} Cr`;
};

// Ensure Players.Base_Price default is 2 Cr and update existing rows
const ensureBasePriceDefault = async () => {
    try {
        // Preferred syntax (MySQL 8.0.13+)
        await db.query("ALTER TABLE Players ALTER COLUMN Base_Price SET DEFAULT 20000000");
        console.log('Set Players.Base_Price default to 2 Cr using ALTER COLUMN');
    } catch (e1) {
        try {
            // Fallback: also ensures a decimal type with default
            await db.query("ALTER TABLE Players MODIFY Base_Price DECIMAL(12,2) DEFAULT 20000000");
            console.log('Set Players.Base_Price default to 2 Cr using MODIFY');
        } catch (e2) {
            console.error('Failed to set Players.Base_Price default:', e2.message || e2);
        }
    }

    try {
        // Update all existing rows to 2 Cr
        await db.query('UPDATE Players SET Base_Price = 20000000');
        console.log('Updated all Players.Base_Price values to 2 Cr');
    } catch (e3) {
        console.error('Failed to update Players.Base_Price values:', e3.message || e3);
    }
};

// --- AUCTION STATE ---
let auctionState = {
    status: 'pending', // pending, active, sold, finished
    currentPlayerIndex: -1,
    currentPlayer: null,
    currentBid: 0,
    highestBidder: null, // Team name
    highestBidderId: null, // Team ID
    timer: 10,
    soldHistory: [],
};
let timerInterval = null;

// --- DATABASE HYDRATION ---
const initializeAuctionData = async () => {
    try {
        // Hydrate players without resetting state so auction can resume
        const [playersResult] = await db.query(
            "SELECT Player_ID as id, Name as name, Country as country, Role as role, Base_Price as basePrice, Status as status FROM Players"
        );
        availablePlayers = playersResult;

        // Hydrate teams from persisted budgets
        const [teamsResult] = await db.query(
            "SELECT Team_ID as id, Team_Name as name, Budget_Remaining as budget FROM Teams"
        );
        teamsData = teamsResult;

        // Hydrate sold history from existing Team_Players records
        const [soldRows] = await db.query(`
            SELECT 
                p.Player_ID as id,
                p.Name as name,
                p.Role as role,
                p.Country as country,
                tp.Price as price,
                t.Team_Name as team
            FROM Team_Players tp
            JOIN Players p ON tp.Player_ID = p.Player_ID
            JOIN Teams t ON tp.Team_ID = t.Team_ID
            ORDER BY tp.Auction_ID, tp.Player_ID
        `);
        auctionState.soldHistory = (soldRows || []).map(r => ({
            player: { id: r.id, name: r.name, role: r.role, country: r.country },
            team: r.team,
            price: r.price,
        }));

        console.log('Successfully fetched and initialized data from the database.');
    } catch (error) {
        console.error('FATAL: Could not initialize data from database.', error);
        process.exit(1);
    }
};

// Create or replace useful views for reporting
const createViews = async () => {
    try {
        // View 1 (fixed): SoldPlayerDetails (with IDs)
        await db.query(`CREATE OR REPLACE VIEW SoldPlayerDetails AS
            SELECT
                P.Player_ID,
                T.Team_ID,
                P.Name AS Player_Name,
                P.Role,
                P.Country,
                T.Team_Name AS Team_Name,
                TP.Price AS Sold_Price,
                TP.Auction_ID
            FROM
                Team_Players TP
            JOIN
                Players P ON TP.Player_ID = P.Player_ID
            JOIN
                Teams T ON TP.Team_ID = T.Team_ID`);

        // View 2 (fixed): TeamBudgetSummary (with Team_ID and computed Total_Spent)
        await db.query(`CREATE OR REPLACE VIEW TeamBudgetSummary AS
            SELECT
                T.Team_ID,
                T.Team_Name,
                T.Budget_Remaining AS Budget_Remaining,
                (SELECT COALESCE(SUM(Price), 0)
                 FROM Team_Players TP
                 WHERE TP.Team_ID = T.Team_ID) AS Total_Spent
            FROM
                Teams T`);

        // View 3 (fixed): PlayerPerformanceSummary (with Player_ID and season 2025)
        await db.query(`CREATE OR REPLACE VIEW PlayerPerformanceSummary AS
            SELECT
                P.Player_ID,
                P.Name,
                P.Role,
                P.Country,
                P.Status,
                COALESCE(PS.Matches_Played, 0) AS Matches_Played,
                COALESCE(PS.Runs, 0) AS Runs,
                COALESCE(PS.Wickets, 0) AS Wickets,
                COALESCE(PS.Strike_Rate, 0.00) AS Strike_Rate,
                COALESCE(PS.Economy, 0.00) AS Economy
            FROM
                Players P
            LEFT JOIN
                Player_Stats PS ON P.Player_ID = PS.Player_ID AND PS.Season = 2025`);

        // Ensure analytics columns exist before creating advanced views
        try {
            // Players.PlayerTier
            const [[ptCol]] = await db.query(`
                SELECT COUNT(1) AS cnt FROM information_schema.columns
                WHERE table_schema = DATABASE() AND table_name = 'Players' AND column_name = 'PlayerTier'
            `);
            if (!ptCol || ptCol.cnt === 0) {
                await db.query("ALTER TABLE Players ADD COLUMN PlayerTier ENUM('Marquee','Capped','Uncapped') NOT NULL DEFAULT 'Uncapped' AFTER Country");
                await db.query("UPDATE Players SET PlayerTier = 'Marquee' WHERE Name IN ('Virat Kohli','Rohit Sharma','Pat Cummins','Jos Buttler')");
            }
        } catch (e) {
            console.error('PlayerTier ensure failed:', e.message || e);
        }

        try {
            // Player_Stats.Balls_Faced & Overs_Bowled
            const [[bf]] = await db.query(`
                SELECT COUNT(1) AS cnt FROM information_schema.columns
                WHERE table_schema = DATABASE() AND table_name = 'Player_Stats' AND column_name = 'Balls_Faced'
            `);
            if (!bf || bf.cnt === 0) {
                await db.query("ALTER TABLE Player_Stats ADD COLUMN Balls_Faced INT DEFAULT 0 AFTER Runs");
            }
            const [[ob]] = await db.query(`
                SELECT COUNT(1) AS cnt FROM information_schema.columns
                WHERE table_schema = DATABASE() AND table_name = 'Player_Stats' AND column_name = 'Overs_Bowled'
            `);
            if (!ob || ob.cnt === 0) {
                await db.query("ALTER TABLE Player_Stats ADD COLUMN Overs_Bowled DECIMAL(5,1) DEFAULT 0.0 AFTER Wickets");
            }
        } catch (e) {
            console.error('Player_Stats columns ensure failed:', e.message || e);
        }

        // View 4: PlayerCareerSummaryView (uses new analytics columns)
        await db.query(`CREATE OR REPLACE VIEW PlayerCareerSummaryView AS
            SELECT
                P.Player_ID,
                P.Name,
                P.Role,
                P.Country,
                P.PlayerTier,
                COUNT(PS.Season) AS Seasons_Played,
                SUM(PS.Matches_Played) AS Career_Matches,
                SUM(PS.Runs) AS Career_Runs,
                SUM(PS.Balls_Faced) AS Career_Balls_Faced,
                SUM(PS.Wickets) AS Career_Wickets,
                SUM(PS.Overs_Bowled) AS Career_Overs_Bowled,
                (SUM(PS.Runs) / SUM(CASE WHEN PS.Balls_Faced = 0 THEN 1 ELSE PS.Balls_Faced END)) * 100 AS Career_Strike_Rate,
                (SUM(PS.Economy * PS.Overs_Bowled) / SUM(CASE WHEN PS.Overs_Bowled = 0 THEN 1 ELSE PS.Overs_Bowled END)) AS Career_Economy_Rate
            FROM Players P
            LEFT JOIN Player_Stats PS ON P.Player_ID = PS.Player_ID
            GROUP BY P.Player_ID, P.Name, P.Role, P.Country, P.PlayerTier`);

        // View 5: v_BiddingHistory for simpler frontend queries
        await db.query(`CREATE OR REPLACE VIEW v_BiddingHistory AS
            SELECT 
                B.Bid_ID,
                B.Auction_ID,
                P.Player_ID,
                P.Name AS Player_Name,
                T.Team_ID,
                T.Team_Name AS Team_Name,
                B.Bid_Amount,
                B.Bid_Time
            FROM Bids B
            JOIN Players P ON B.Player_ID = P.Player_ID
            JOIN Teams T ON B.Team_ID = T.Team_ID
            ORDER BY B.Bid_Time DESC`);

        console.log('Database views ensured: SoldPlayerDetails, TeamBudgetSummary, PlayerPerformanceSummary, PlayerCareerSummaryView, v_BiddingHistory');
    } catch (error) {
        console.error('Error creating database views:', error);
    }
};

// --- EXPRESS API SERVER ---
const app = express();
app.use(cors());
app.use(express.json());

// Mount routers
const teamRoutes = require('./routes/teams');
const playerRoutes = require('./routes/players');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const sponsorRoutes = require('./routes/sponsors');
const venueRoutes = require('./routes/venues');
const playerStatRoutes = require('./routes/playerStats');
const teamPlayerRoutes = require('./routes/teamPlayers');
const analyzeRoutes = require('./routes/analyze');
const queryAnalysisRoutes = require('./routes/queryAnalysis');
const userRoutes = require('./routes/users');
const reportsRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/stats', playerStatRoutes);
app.use('/api/squads', teamPlayerRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/query-analysis', queryAnalysisRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);

const server = http.createServer(app);

// --- WEBSOCKET SERVER ---
const wss = new WebSocket.Server({ server });

const broadcast = (data) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

const broadcastAuctionState = () => broadcast({ type: 'AUCTION_STATE', state: auctionState });
const broadcastTeamsUpdate = () => broadcast({ type: 'TEAMS_UPDATE', teams: teamsData });
const broadcastConnectedTeams = () => {
    const connectedRoles = Array.from(clients.values()).map(c => c.role);
    broadcast({ type: 'CONNECTED_TEAMS', teams: connectedRoles });
};

// --- ADMIN: Reset Auction Endpoint ---
// Clears Bids and Team_Players, resets Players status and Teams budgets, then rehydrates and notifies clients
app.post('/api/admin/reset-auction', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        await conn.query('DELETE FROM Bids');
        await conn.query('DELETE FROM Team_Players');
        await conn.query("UPDATE Players SET Status = 'Available'");
        // Store budgets in rupees (UI assumes INR), 100 Cr = 100 * 10,000,000 = 1,000,000,000
        await conn.query('UPDATE Teams SET Budget_Remaining = 1000000000');

        await conn.commit();
        conn.release();
        conn = null;

        // Reset in-memory auction state
        clearInterval(timerInterval);
        auctionState = {
            status: 'pending',
            currentPlayerIndex: -1,
            currentPlayer: null,
            currentBid: 0,
            highestBidder: null,
            highestBidderId: null,
            timer: 10,
            soldHistory: [],
        };

        // Rehydrate lists from DB
        await initializeAuctionData();

        // Notify clients
        broadcast({ type: 'AUCTION_RESET' });
        broadcastAuctionState();
        broadcastTeamsUpdate();
        broadcastConnectedTeams();

        res.json({ message: 'Auction reset successful' });
    } catch (error) {
        if (conn) {
            try { await conn.rollback(); } catch (_) {}
            try { conn.release(); } catch (_) {}
        }
        console.error('Error resetting auction:', error);
        res.status(500).json({ message: 'Failed to reset auction' });
    }
});

const startTimer = () => {
    clearInterval(timerInterval);
    auctionState.timer = 10;
    broadcastAuctionState();

    timerInterval = setInterval(() => {
        auctionState.timer--;
        if (auctionState.timer <= 0) {
            clearInterval(timerInterval);
            sellPlayer();
        }
        broadcastAuctionState();
    }, 1000);
};

const sellPlayer = async () => {
    auctionState.status = 'sold';
    let soldMessage = `${auctionState.currentPlayer.name} goes UNSOLD.`;

    if (auctionState.highestBidderId) {
        soldMessage = `${auctionState.currentPlayer.name} SOLD to ${auctionState.highestBidder} for ₹${auctionState.currentBid.toLocaleString()}`;
        try {
            // Use atomic upsert to avoid duplicate-key errors regardless of unique/index setup
            const AUCTION_ID = 1;
            const upsertSql = `
                INSERT INTO Team_Players (Team_ID, Player_ID, Auction_ID, Price)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    Team_ID = VALUES(Team_ID),
                    Price = VALUES(Price)
            `;
            await db.query(upsertSql, [auctionState.highestBidderId, auctionState.currentPlayer.id, AUCTION_ID, auctionState.currentBid]);
            console.log(`Upserted Team_Players entry for Player_ID=${auctionState.currentPlayer.id}`);

            await db.query("UPDATE Players SET Status = 'Sold' WHERE Player_ID = ?", [auctionState.currentPlayer.id]);

            // Deduct budget in DB only at final sale price
            await db.query(
                'UPDATE Teams SET Budget_Remaining = Budget_Remaining - ? WHERE Team_ID = ?',
                [auctionState.currentBid, auctionState.highestBidderId]
            );

            // Reflect deduction in in-memory cache
            const winningTeam = teamsData.find(t => t.id === auctionState.highestBidderId);
            if (winningTeam) winningTeam.budget -= auctionState.currentBid;

            auctionState.soldHistory.push({
                player: auctionState.currentPlayer,
                team: auctionState.highestBidder,
                price: auctionState.currentBid,
            });

        } catch (error) {
            console.error("Database error during sellPlayer:", error);
        }
    } else {
        await db.query("UPDATE Players SET Status = 'Unsold' WHERE Player_ID = ?", [auctionState.currentPlayer.id]);
    }
    
    broadcastAuctionState();
    broadcastTeamsUpdate();
    broadcast({ type: 'SOLD_ANNOUNCEMENT', message: soldMessage });
};

const nextPlayer = () => {
    auctionState.currentPlayerIndex++;
    const nextAvailablePlayer = availablePlayers.find((p, index) => index >= auctionState.currentPlayerIndex && p.status === 'Available');

    if (!nextAvailablePlayer) {
        auctionState.status = 'finished';
        auctionState.currentPlayer = null;
        clearInterval(timerInterval);
    } else {
        auctionState.currentPlayer = nextAvailablePlayer;
        auctionState.currentPlayerIndex = availablePlayers.indexOf(nextAvailablePlayer);
        auctionState.status = 'active';
        auctionState.currentBid = 0;
        auctionState.highestBidder = null;
        auctionState.highestBidderId = null;
        startTimer();
    }
    broadcastAuctionState();
};

wss.on('connection', ws => {
    const clientId = Date.now(); // Simple unique ID for the connection
    clients.set(clientId, { ws, role: null, userId: null });
    console.log('Client connected.');

    ws.send(JSON.stringify({ type: 'AUCTION_STATE', state: auctionState }));
    ws.send(JSON.stringify({ type: 'TEAMS_UPDATE', teams: teamsData }));
    broadcastConnectedTeams();

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            const clientInfo = clients.get(clientId);

            switch (data.type) {
                case 'REGISTER_ROLE': {
                    // Verify user exists and has appropriate role using external schema
                    const [users] = await db.query(
                        'SELECT Role, Team_ID FROM User_Accounts WHERE User_ID = ?',
                        [data.userId]
                    );

                    if (users.length === 0) {
                        ws.send(JSON.stringify({ type: 'ERROR', message: 'User not found' }));
                        return;
                    }

                    const user = users[0];
                    let assignedRoleLabel = null;

                    if (user.Role === 'Auctioneer') {
                        // Auctioneer
                        assignedRoleLabel = 'Auctioneer';
                    } else if (user.Role === 'TeamOwner' || user.Role === 'Manager') {
                        // Must match Team_ID; use teamId provided by client and map to name
                        if (!data.teamId || data.teamId !== user.Team_ID) {
                            ws.send(JSON.stringify({ type: 'ERROR', message: 'Unauthorized team access' }));
                            return;
                        }
                        const team = teamsData.find(t => t.id === data.teamId);
                        if (!team) {
                            ws.send(JSON.stringify({ type: 'ERROR', message: 'Team not found' }));
                            return;
                        }
                        assignedRoleLabel = team.name; // use team name label for paddles/bids
                    } else {
                        ws.send(JSON.stringify({ type: 'ERROR', message: 'Viewer role cannot register a bidding role' }));
                        return;
                    }

                    clientInfo.role = assignedRoleLabel;
                    clientInfo.userId = data.userId;
                    console.log(`Client registered as ${assignedRoleLabel} (User ID: ${data.userId})`);
                    broadcastConnectedTeams();
                    break;
                }
                case 'START_AUCTION':
                    if (clientInfo.role === 'Auctioneer' && auctionState.status === 'pending') {
                        console.log('Auction started by Auctioneer!');
                        nextPlayer();
                    }
                    break;
                case 'NEXT_PLAYER':
                    if (clientInfo.role === 'Auctioneer' && auctionState.status === 'sold') {
                        console.log('Moving to next player');
                        nextPlayer();
                    }
                    break;
                case 'PLACE_BID':
                    if (auctionState.status === 'active' && clientInfo.role === data.team) {
                        const { team, amount } = data;
                        const biddingTeam = teamsData.find(t => t.name === team);
                        if (!biddingTeam || biddingTeam.budget < amount) return;

                        // Prevent the same team from bidding consecutively
                        if (auctionState.highestBidderId && auctionState.highestBidderId === biddingTeam.id) {
                            // Ignore or optionally notify client
                            return;
                        }

                        // Enforce 0.5 Cr step and minimum next bid
                        const base = auctionState.currentPlayer.basePrice;
                        const minNext = auctionState.currentBid > 0
                            ? auctionState.currentBid + STEP
                            : roundUpToStep(base);
                        const isStepAligned = (amount % STEP) === 0;

                        if (!isStepAligned || amount < minNext) {
                            // Invalid bid step or too low; ignore
                            return;
                        }

                        if (amount >= minNext) {
                            auctionState.currentBid = amount;
                            auctionState.highestBidder = team;
                            auctionState.highestBidderId = biddingTeam.id;
                            
                            await db.query('INSERT INTO Bids (Auction_ID, Player_ID, Team_ID, Bid_Amount) VALUES (?, ?, ?, ?)', [1, auctionState.currentPlayer.id, biddingTeam.id, amount]);
                            
                            startTimer();
                            broadcast({ type: 'BID_LOG', log: { team, amount: formatCr(amount) } });
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Failed to process message:', error);
        }
    });

    ws.on('close', () => {
        const clientInfo = clients.get(clientId);
        console.log(`Client ${clientInfo?.role || 'unknown'} disconnected`);
        clients.delete(clientId);
        broadcastConnectedTeams();
    });
});

// --- START THE SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    // Initialize auth, stored procedures, views, indexes and data
    const initializeAuth = require('./config/auth');
    const initializeStoredProcedures = require('./config/stored_procedures');
    const initializeTriggers = require('./config/triggers');
    const runSafeMigrations = require('./config/migrations');
    await initializeAuth();
    await initializeStoredProcedures();
    await runSafeMigrations();
    await initializeTriggers();
    await createViews();
    await ensureBasePriceDefault();
    await createIndexes();
    await initializeAuctionData();
    
    // Register test users if needed
    const registerTestUsers = require('./config/testUsers');
    await registerTestUsers();
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server started on port ${PORT}`);
});

