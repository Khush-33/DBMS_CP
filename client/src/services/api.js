import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Add auth token to requests if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (userData) => axios.post(`${API_BASE_URL}/users/register`, userData);
export const loginUser = (userData) => axios.post(`${API_BASE_URL}/users/login`, userData);

// Teams
export const fetchTeams = () => axios.get(`${API_BASE_URL}/teams`);
export const fetchTeamDetails = (teamId) => axios.get(`${API_BASE_URL}/teams/${teamId}`);

// Players
export const fetchPlayers = () => axios.get(`${API_BASE_URL}/players`);
export const fetchPlayerById = (playerId) => axios.get(`${API_BASE_URL}/players/${playerId}`);
export const addPlayer = (payload) => axios.post(`${API_BASE_URL}/players`, payload);
export const searchPlayers = (query) => axios.get(`${API_BASE_URL}/players/search?query=${encodeURIComponent(query)}`);

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

// Reports
export const fetchSoldPlayerDetails = () => axios.get(`${API_BASE_URL}/reports/sold-players`);
export const fetchTeamBudgetSummary = () => axios.get(`${API_BASE_URL}/reports/team-budgets`);
export const fetchPlayerPerformanceSummary = (season = 2025) => axios.get(`${API_BASE_URL}/reports/player-performance`, { params: { season } });
export const callGetTeamSquad = (teamId) => axios.get(`${API_BASE_URL}/reports/team-squad/${teamId}`);
export const fetchPlayerCareerSummary = () => axios.get(`${API_BASE_URL}/reports/player-career`);
export const fetchPlayerAuditLog = () => axios.get(`${API_BASE_URL}/reports/player-audit-log`);

// Admin
export const adminAddTeam = (teamName, ownerName) => axios.post(`${API_BASE_URL}/admin/add-team`, { teamName, ownerName });
export const adminAddSponsor = (sponsorName, amount, teamId) => axios.post(`${API_BASE_URL}/admin/add-sponsor`, { sponsorName, amount, teamId });
export const adminAddVenue = (venueName, city, capacity) => axios.post(`${API_BASE_URL}/admin/add-venue`, { venueName, city, capacity });
export const adminAddAuction = (auctionDate, season, venueId) => axios.post(`${API_BASE_URL}/admin/add-auction`, { auctionDate, season, venueId });