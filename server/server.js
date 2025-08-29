const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load env vars
dotenv.config();

// Route files
const teamRoutes = require('./routes/teams');
const playerRoutes = require('./routes/players');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const sponsorRoutes = require('./routes/sponsors');
const venueRoutes = require('./routes/venues');
const playerStatRoutes = require('./routes/playerStats');
const teamPlayerRoutes = require('./routes/teamPlayers');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/stats', playerStatRoutes);
app.use('/api/squads', teamPlayerRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));