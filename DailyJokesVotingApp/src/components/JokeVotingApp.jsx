import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api/joke';

export default function JokeVotingApp() {
    const [joke, setJoke] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch a joke with votes
    const fetchJoke = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setJoke(data);
        } catch (error) {
            console.error('Failed to fetch joke:', error);
        }
        setLoading(false);
    };

    // Submit a vote
    const handleVote = async (emoji) => {
        if (!joke) return;
        try {
            const response = await fetch(`${API_URL}/${joke.jokeId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emoji })
            });
            const updatedJoke = await response.json();
            setJoke(updatedJoke);
        } catch (error) {
            console.error('Failed to submit vote:', error);
        }
    };

    useEffect(() => {
        fetchJoke();
    }, []);

    if (loading) return <div className="text-center text-xl mt-10">Loading joke...</div>;
    if (!joke) return <div className="text-center text-xl mt-10">No jokes available.</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
                <h2 className="text-2xl font-bold mb-4">{joke.question}</h2>
                <p className="text-xl text-gray-700 mb-6">{joke.answer}</p>

                {/* Emoji Voting */}
                <div className="flex justify-center gap-6 mb-4">
                    {(joke?.availableVotes ?? ['\u{1F602}', '\u{1F44D}', '\u2764']).map((emoji) => {
                        const voteCount = joke.votes.find((v) => v.label === emoji)?.value || 0;
                        return (
                            <button
                                key={emoji}
                                onClick={() => handleVote(emoji)}
                                className="text-3xl hover:scale-110 transition-transform"
                            >
                                {emoji} <span className="text-sm ml-2">{voteCount}</span>
                            </button>
                        );
                    })}
                </div>


                {/* Next Joke Button */}
                <button
                    onClick={fetchJoke}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    Next Joke
                </button>
            </div>
        </div>
    );
}
