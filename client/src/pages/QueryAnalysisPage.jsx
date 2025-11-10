import React, { useState } from 'react';
import axios from 'axios';

const QueryAnalysisPage = () => {
  const [queryResults, setQueryResults] = useState({
    playerSearch: null,
    joinQuery: null,
    bidHistory: null,
    statusFilter: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/query-analysis');
      setQueryResults(response.data);
    } catch (err) {
      setError('Failed to run query analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderQueryResult = (result, title, description) => {
    if (!result) return null;
    
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Using Indexes</h4>
            <pre className="text-sm text-green-400">{JSON.stringify(result.key || 'None', null, 2)}</pre>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Rows Examined</h4>
            <pre className="text-sm text-blue-400">{result.rows}</pre>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Possible Keys</h4>
            <pre className="text-sm text-yellow-400">{JSON.stringify(result.possible_keys || 'None', null, 2)}</pre>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Extra Info</h4>
            <pre className="text-sm text-purple-400">{result.Extra || 'None'}</pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">Query Analysis Dashboard</h1>
          <p className="text-gray-400">Analyze query performance and index usage</p>
        </header>

        <div className="mb-8 text-center">
          <button 
            onClick={runAnalysis}
            disabled={loading}
            className="btn-accent px-8 py-3"
          >
            {loading ? 'Analyzing...' : 'Run Query Analysis'}
          </button>
          {error && <div className="text-red-400 mt-3">{error}</div>}
        </div>

        {queryResults.playerSearch && (
          <div className="space-y-6">
            {renderQueryResult(
              queryResults.playerSearch,
              "Player Search Analysis",
              "Performance analysis of player name search query using name index"
            )}
            
            {renderQueryResult(
              queryResults.joinQuery,
              "Join Query Analysis",
              "Analysis of player-team join operations using foreign key indexes"
            )}
            
            {renderQueryResult(
              queryResults.bidHistory,
              "Bid History Analysis",
              "Performance of bid history sorting using time-based index"
            )}
            
            {renderQueryResult(
              queryResults.statusFilter,
              "Status Filter Analysis",
              "Analysis of player filtering by status using status index"
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryAnalysisPage;