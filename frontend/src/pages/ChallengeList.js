import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function ChallengeList() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/challenges')
      .then(res => {
        setChallenges(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container"><p>Loading challenges...</p></div>;
  if (error) return <div className="container"><p>Error: {error}</p></div>;

  // Group by category
  const byCategory = {};
  challenges.forEach(ch => {
    if (!byCategory[ch.category]) {
      byCategory[ch.category] = [];
    }
    byCategory[ch.category].push(ch);
  });

  return (
    <div className="container">
      <h1>All Heidi Challenges</h1>
      <p style={{ color: '#666' }}>Explore solutions across all {challenges.length} challenges</p>

      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category} style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#2563eb', borderBottom: '2px solid #2563eb', paddingBottom: '0.5rem' }}>
            {category}
          </h2>
          <div className="challenges-grid">
            {items.map(challenge => (
              <Link 
                key={challenge.id} 
                to={`/challenges/${challenge.id}`}
                className="challenge-card"
              >
                <h3>{challenge.title}</h3>
                <div className="category">{challenge.category}</div>
                <p>{challenge.description.substring(0, 150)}...</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChallengeList;
