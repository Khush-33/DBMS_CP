import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Teams
export const fetchTeams = () => axios.get(`${API_BASE_URL}/teams`);
export const fetchTeamDetails = (teamId) => axios.get(`${API_BASE_URL}/teams/${teamId}`);

// Players
export const fetchPlayers = () => axios.get(`${API_BASE_URL}/players`);
export const fetchPlayerById = (playerId) => axios.get(`${API_BASE_URL}/players/${playerId}`);
export const addPlayer = (payload) => axios.post(`${API_BASE_URL}/players`, payload);

// Auctions
export const fetchAuctions = () => axios.get(`${API_BASE_URL}/auctions`);
export const fetchAuctionDetails = (auctionId) => axios.get(`${API_BASE_URL}/auctions/${auctionId}`);

// Bids
export const fetchBids = () => axios.get(`${API_BASE_URL}/bids`);
export const postBid = (payload) => axios.post(`${API_BASE_URL}/bids`, payload);

// Sponsors
export const fetchSponsors = () => axios.get(`${API_BASE_URL}/sponsors`);

// Venues
export const fetchVenues = () => axios.get(`${API_BASE_URL}/venues`);

// Player Stats
export const fetchStatsBySeason = (season) => axios.get(`${API_BASE_URL}/stats/${season}`);

// Team Players (Squads)
export const fetchSquadByTeam = (teamId) => axios.get(`${API_BASE_URL}/squads/${teamId}`);
export const postTeamPlayer = (payload) => axios.post(`${API_BASE_URL}/squads`, payload);