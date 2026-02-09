import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api';

function Home() {
  const [challengeCount, setChallengeCount] = useState(0);

  useEffect(() => {
    api.get('/api/challenges')
      .then(res => setChallengeCount(res.data.length))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <div className="hero">
        <h1>Heidi Challenge Portfolio</h1>
        <p>Solutions to all {challengeCount} Heidi growth, product, and operations challenges</p>
      </div>

      <div className="home-content">
        <div className="intro-text">
          <p>
            This project demonstrates working solutions across Heidi's core challenge categories: 
            <strong> Paid Media</strong>, <strong>Organic Growth</strong>, <strong>Product</strong>, 
            <strong> Lifecycle</strong>, <strong>Brand</strong>, <strong>Communications</strong>, and <strong>Operations</strong>.
          </p>
          <p>
            Each challenge includes a full problem description, required deliverables, and a concrete, implementable solution.
          </p>
          <p>
            Built with: <code>Python Flask</code> (API), <code>React</code> (Frontend), and <code>structured challenge data</code>.
          </p>
        </div>

        <h2 className="projects-header">Challenge Categories</h2>
        <ul>
          <li><strong>Growth & Paid Media:</strong> Media buying, creative systems, demand generation</li>
          <li><strong>Organic Growth:</strong> Flywheel assets, logged-out experiences, SEO-driven discovery</li>
          <li><strong>Product:</strong> Onboarding, UX flows, lifecycle systems, information architecture</li>
          <li><strong>Operations:</strong> Incentive design, referral systems, patient data management</li>
          <li><strong>Brand & Communications:</strong> Campaign strategy, positioning, messaging, sponsorships</li>
        </ul>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link 
            to="/challenges" 
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            View All {challengeCount} Challenges →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
