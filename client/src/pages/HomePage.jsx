import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionButton, OutlineButton } from '../components/ui/PrimaryButton';
import InfoCards from '../components/ui/InfoCards';
import Icon from '../components/ui/Icon';
import { fetchTeams, fetchPlayers, fetchAuctions, fetchBids } from '../services/api';

// Small section wrapper to keep a consistent, minimal card look
const SectionBox = ({ children, className = '' }) => (
  <div className={`stat-card glass ${className}`}>{children}</div>
);

// Clean, minimal Sports Card used for navigation
const SportsCard = ({ title, subtitle, image, stats, link, category }) => (
  <Link to={link} className="group block">
    <article className="stat-card overflow-hidden transition-all duration-200 hover:translate-y-0.5">
      <div className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-800/40 flex items-center justify-center text-xl">{image}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-white mb-1">{title}</h3>
          <div className="text-sm text-gray-400">{subtitle}</div>
        </div>
        {stats && (
          <div className="text-right text-sm text-gray-300">
            {stats[0] ? <div className="font-bold">{stats[0].value}</div> : null}
            {stats[1] ? <div className="text-xs text-gray-400">{stats[1].label}</div> : null}
          </div>
        )}
      </div>
    </article>
  </Link>
);

// News Article Component — simplified layout
const NewsCard = ({ title, excerpt, category, time, image }) => (
  <article className="group cursor-pointer">
    <div className="flex space-x-4">
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-gray-800/30 rounded-lg flex items-center justify-center text-lg">{image}</div>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-gray-400 text-xs uppercase">{category}</span>
          <span className="text-gray-500 text-xs">{time}</span>
        </div>
        <h3 className="font-semibold text-gray-100 group-hover:text-orange-400 transition-colors line-clamp-2">{title}</h3>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{excerpt}</p>
      </div>
    </div>
  </article>
);

const HomePage = () => {
  const [stats, setStats] = useState({ teams: null, players: null, auctions: null, bids: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([fetchTeams(), fetchPlayers(), fetchAuctions(), fetchBids()])
      .then(([teamsRes, playersRes, auctionsRes, bidsRes]) => {
        if (!mounted) return;
        setStats({
          teams: Array.isArray(teamsRes.data) ? teamsRes.data.length : (teamsRes.data.count || null),
          players: Array.isArray(playersRes.data) ? playersRes.data.length : (playersRes.data.count || null),
          auctions: Array.isArray(auctionsRes.data) ? auctionsRes.data.length : (auctionsRes.data.count || null),
          bids: Array.isArray(bidsRes.data) ? bidsRes.data.length : (bidsRes.data.count || null),
        });
      })
      .catch((err) => {
        console.error('Failed to load home stats', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden card-elevated p-8 rounded-2xl animate-fade-in-scale">
          <div className="absolute -top-1/2 -right-1/4 w-3/4 h-3/4 bg-blue-900/30 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="relative z-10">
            <h1 className="text-6xl font-extrabold gradient-text">Premier League Auction</h1>
            <p className="text-gray-300 mt-3 max-w-2xl">Modern, professional live auction platform with real-time bidding, analytics, and team management tools.</p>
            <div className="mt-6 flex items-center gap-3">
              <ActionButton to="/live-auction">Go Live</ActionButton>
              <OutlineButton to="/players">Explore Players</OutlineButton>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-4">
        {/* Top summary cards (dynamic) */}
        <InfoCards items={[
          { label: 'Teams Active', value: stats.teams, loading },
          { label: 'Players', value: stats.players, loading },
          { label: 'Auctions', value: stats.auctions, loading },
          { label: 'Bids', value: stats.bids, loading }
        ]} />

        {/* Sports / Navigation cards */}
        <section className="my-8 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SportsCard title="Teams" subtitle="10 Franchises" image={<Icon name="teams" />} category="Teams" link="/teams" stats={[{value: "10", label: "Teams"}, {value: "₹90Cr", label: "Budget"}]} />
            <SportsCard title="Players" subtitle="Star Athletes" image={<Icon name="players" />} category="Players" link="/players" stats={[{value: "250+", label: "Players"}, {value: "₹156Cr", label: "Sold"}]} />
            <SportsCard title="Auctions" subtitle="Live Bidding" image={<Icon name="auctions" />} category="Auctions" link="/auctions" stats={[{value: "87", label: "Sold"}, {value: "23", label: "Unsold"}]} />
            <SportsCard title="Statistics" subtitle="Live Data" image={<Icon name="stats" />} category="Stats" link="/stats" stats={[{value: "Live", label: "Updates"}, {value: "Real", label: "Time"}]} />
          </div>
        </section>

        {/* Content grid: main + sidebar (both card-based) */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 animate-fade-in-up">
            <SectionBox className="mb-6">
              <div className="p-4">
                <h3 className="text-2xl font-bold text-white mb-2">Featured</h3>
                <p className="text-gray-300">Record-Breaking Bid! Virat Kohli Sold for ₹17 Crores to RCB</p>
              </div>
            </SectionBox>

            <SectionBox>
              <h3 className="text-xl font-bold text-white mb-4">Latest Updates</h3>
              <div className="space-y-4">
                <NewsCard title="Mumbai Indians Complete Squad with Strategic Picks" excerpt="MI focuses on building a balanced team with key acquisitions in bowling department." category="Auctions" time="4 hours ago" image="🔵" />
                <NewsCard title="CSK's Auction Strategy Pays Off with Young Talents" excerpt="Chennai Super Kings invest heavily in emerging players for future seasons." category="Teams" time="6 hours ago" image="💛" />
                <NewsCard title="Record Prize Money Announced for IPL 2024" excerpt="BCCI increases the prize pool significantly for the upcoming season." category="News" time="8 hours ago" image="💰" />
              </div>
            </SectionBox>
          </div>

          <aside className="animate-fade-in-up">
            <SectionBox className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Live Scores</h3>
              <div className="space-y-3">
                <div className="p-3 glass rounded-lg">
                  <div className="font-semibold text-white">MI vs CSK</div>
                  <div className="text-sm text-gray-300">180/4 (18.2 overs)</div>
                </div>
                <div className="p-3 glass rounded-lg">
                  <div className="font-semibold text-white">RCB vs KKR</div>
                  <div className="text-sm text-gray-300">Tomorrow • 7:30 PM</div>
                </div>
              </div>
            </SectionBox>

            <SectionBox>
              <h3 className="text-xl font-bold text-white mb-4">Top Sold Players</h3>
              <div className="space-y-3">
                {[{ name: 'Virat Kohli', team: 'RCB', price: '₹17 Cr' }, { name: 'MS Dhoni', team: 'CSK', price: '₹15 Cr' }].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-transparent">
                    <div>
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-sm text-gray-300">{p.team}</div>
                    </div>
                    <div className="font-bold text-white">{p.price}</div>
                  </div>
                ))}
              </div>
            </SectionBox>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default HomePage;