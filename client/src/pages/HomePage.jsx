import React from 'react';
import { Link } from 'react-router-dom';

// Modern Sports Card Component
const SportsCard = ({ title, subtitle, image, stats, link, category }) => (
  <Link to={link} className="group block">
    <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center">
          <span className="text-6xl">{image}</span>
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold uppercase">{category}</span>
        </div>
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{title}</h3>
        <p className="text-gray-600 mb-4">{subtitle}</p>
        {stats && (
          <div className="flex justify-between text-sm text-gray-500">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-bold text-gray-900">{stat.value}</div>
                <div>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  </Link>
);

// News Article Component
const NewsCard = ({ title, excerpt, category, time, image }) => (
  <article className="group cursor-pointer">
    <div className="flex space-x-4">
      <div className="flex-shrink-0">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
          <span className="text-2xl">{image}</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-orange-600 text-xs font-semibold uppercase">{category}</span>
          <span className="text-gray-400 text-xs">{time}</span>
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{excerpt}</p>
      </div>
    </div>
  </article>
);

const HomePage = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section - Professional Sports Style */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold uppercase">LIVE AUCTION</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
                IPL 2024<br />
                <span className="text-orange-400">Mega Auction</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Experience the thrill of cricket's biggest auction with real-time bidding, 
                comprehensive analytics, and complete team management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/auctions/live" 
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🔴</span>
                  <span>Watch Live Auction</span>
                </Link>
                <Link 
                  to="/teams" 
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-lg transition-colors backdrop-blur-sm border border-white/20"
                >
                  View All Teams
                </Link>
              </div>
            </div>
            
            {/* Live Stats Panel */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-2">📈</span>
                Live Auction Stats
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-orange-400">₹156 Cr</div>
                  <div className="text-sm text-gray-300">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-green-400">87</div>
                  <div className="text-sm text-gray-300">Players Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-400">23</div>
                  <div className="text-sm text-gray-300">Unsold</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-400">10</div>
                  <div className="text-sm text-gray-300">Teams Active</div>
                </div>
              </div>
              
              {/* Current Bid */}
              <div className="mt-6 p-4 bg-red-600/20 rounded-lg border border-red-500/30">
                <div className="text-center">
                  <div className="text-sm text-red-300 mb-1">CURRENT BID</div>
                  <div className="text-2xl font-black text-red-400">Virat Kohli - ₹17 Cr</div>
                  <div className="text-xs text-red-300 mt-1">RCB leading</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-orange-400 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute bottom-32 left-16 w-6 h-6 bg-blue-400 rounded-full opacity-40 animate-bounce delay-1000"></div>
      </section>

      {/* Quick Navigation */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <SportsCard
              title="Teams"
              subtitle="10 Franchises"
              image="🏏"
              category="Teams"
              link="/teams"
              stats={[{value: "10", label: "Teams"}, {value: "₹90Cr", label: "Budget"}]}
            />
            <SportsCard
              title="Players"
              subtitle="Star Athletes"
              image="⭐"
              category="Players"
              link="/players"
              stats={[{value: "250+", label: "Players"}, {value: "₹156Cr", label: "Sold"}]}
            />
            <SportsCard
              title="Auctions"
              subtitle="Live Bidding"
              image="💰"
              category="Auctions"
              link="/auctions"
              stats={[{value: "87", label: "Sold"}, {value: "23", label: "Unsold"}]}
            />
            <SportsCard
              title="Statistics"
              subtitle="Live Data"
              image="📊"
              category="Stats"
              link="/stats"
              stats={[{value: "Live", label: "Updates"}, {value: "Real", label: "Time"}]}
            />
          </div>
        </div>
      </section>

      {/* Latest News & Updates */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900">Latest Updates</h2>
                <Link to="/news" className="text-orange-600 hover:text-orange-700 font-semibold">
                  View All News →
                </Link>
              </div>
              
              {/* Featured Article */}
              <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 group hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gradient-to-r from-blue-600 to-orange-500 flex items-center justify-center">
                  <span className="text-8xl">🏆</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold uppercase">BREAKING</span>
                    <span className="text-gray-500 text-sm">2 hours ago</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    Record-Breaking Bid! Virat Kohli Sold for ₹17 Crores to RCB
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    In a thrilling auction moment, Royal Challengers Bangalore secured their star player 
                    Virat Kohli for a record-breaking amount, making him the most expensive player in this auction.
                  </p>
                </div>
              </article>
              
              {/* News List */}
              <div className="space-y-6">
                <NewsCard
                  title="Mumbai Indians Complete Squad with Strategic Picks"
                  excerpt="MI focuses on building a balanced team with key acquisitions in bowling department."
                  category="Auctions"
                  time="4 hours ago"
                  image="🔵"
                />
                <NewsCard
                  title="CSK's Auction Strategy Pays Off with Young Talents"
                  excerpt="Chennai Super Kings invest heavily in emerging players for future seasons."
                  category="Teams"
                  time="6 hours ago"
                  image="💛"
                />
                <NewsCard
                  title="Record Prize Money Announced for IPL 2024"
                  excerpt="BCCI increases the prize pool significantly for the upcoming season."
                  category="News"
                  time="8 hours ago"
                  image="💰"
                />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Live Scores Widget */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🏏</span>
                  Live Scores
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <div className="font-semibold text-gray-900">MI vs CSK</div>
                      <div className="text-sm text-gray-600">Match 23 • Live</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">180/4</div>
                      <div className="text-xs text-green-600">(18.2 overs)</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">RCB vs KKR</div>
                      <div className="text-sm text-gray-600">Tomorrow • 7:30 PM</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Upcoming</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Top Players */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">⭐</span>
                  Top Sold Players
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Virat Kohli", team: "RCB", price: "₹17 Cr", change: "+2" },
                    { name: "MS Dhoni", team: "CSK", price: "₹15 Cr", change: "+1" },
                    { name: "Rohit Sharma", team: "MI", price: "₹14 Cr", change: "0" },
                    { name: "Jos Buttler", team: "RR", price: "₹12 Cr", change: "+3" }
                  ].map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div>
                        <div className="font-semibold text-gray-900">{player.name}</div>
                        <div className="text-sm text-gray-600">{player.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{player.price}</div>
                        <div className={`text-xs ${player.change.startsWith('+') ? 'text-green-600' : 'text-gray-400'}`}>
                          {player.change !== '0' && `${player.change} from last bid`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-6">Don't Miss Any Action!</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Get real-time updates, exclusive analysis, and comprehensive statistics 
            from the biggest cricket auction in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/auctions/live" 
              className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>🔴</span>
              <span>Watch Live Now</span>
            </Link>
            <Link 
              to="/teams" 
              className="bg-orange-700 hover:bg-orange-800 text-white font-bold py-4 px-8 rounded-lg transition-colors border-2 border-orange-500"
            >
              Explore Teams
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;