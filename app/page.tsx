'use client';

import { useState } from 'react';

const Home = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean; url?: string; error?: string } | null>(
    null
  );

  const handleCommit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/commit', { method: 'POST' });

      if (response.ok) {
        const data = await response.json();
        setResult({ success: true, url: data.commitUrl });
      } else {
        const errorData = await response.json();
        setResult({ success: false, error: errorData.error });
      }
    } catch (error) {
      setResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>GitHub Commit App (App Router)</h1>
      <button onClick={handleCommit} disabled={loading}>
        {loading ? 'Committing...' : 'Add & Commit Changes'}
      </button>
      {result && (
        <div style={{ marginTop: '20px' }}>
          {result.success ? (
            <p>
              ✅ Commit successful!{' '}
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                View Commit
              </a>
            </p>
          ) : (
            <p style={{ color: 'red' }}>❌ {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
