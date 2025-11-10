import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QueryAnalyzerPage = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/analyze');
                setResults(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, []);

    const renderExplainResult = (result, title) => (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-3 rounded">
                    <p className="font-semibold mb-1 text-gray-300">Rows Examined</p>
                    <p className="text-cyan-400">{result.rows}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                    <p className="font-semibold mb-1 text-gray-300">Index Used</p>
                    <p className="text-green-400">{result.key || 'None'}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                    <p className="font-semibold mb-1 text-gray-300">Extra Operations</p>
                    <p className="text-yellow-400">{result.Extra || 'None'}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                    <p className="font-semibold mb-1 text-gray-300">Type</p>
                    <p className="text-purple-400">{result.type || 'N/A'}</p>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-400 bg-red-400/10 p-4 rounded-lg">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 bg-gray-900">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold mb-8 text-white text-center">Query Performance Analysis</h1>
                
                {results && (
                    <div className="grid grid-cols-1 gap-6">
                        {renderExplainResult(results.nameSearch, "Player Name Search Query")}
                        {renderExplainResult(results.joinQuery, "Player-Team Join Query")}
                        {renderExplainResult(results.bidHistory, "Bid History Query")}
                        {renderExplainResult(results.statusFilter, "Player Status Filter Query")}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueryAnalyzerPage;