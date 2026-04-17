import { useEffect, useState } from 'react';
import '../CSS/dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function DashBoard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/selected-candidates`);

        if (!response.ok) {
          throw new Error('Unable to load shortlisted candidates.');
        }

        const data = await response.json();
        const normalizedCandidates = (data.candidates || []).map((candidate) => ({
          ...candidate,
          emailSent: false,
          sending: false,
        }));

        setCandidates(normalizedCandidates);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  const updateCandidate = (username, changes) => {
    setCandidates((currentCandidates) =>
      currentCandidates.map((candidate) =>
        candidate.username === username ? { ...candidate, ...changes } : candidate,
      ),
    );
  };

  const handleSendEmail = async (username) => {
    try {
      setMessage('');
      setError('');
      updateCandidate(username, { sending: true });

      const response = await fetch(
        `${API_BASE_URL}/api/selected-candidates/${encodeURIComponent(username)}/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Email could not be sent.');
      }

      updateCandidate(username, { sending: false, emailSent: true });
      setMessage(data.message || `Email sent to ${username}.`);
    } catch (sendError) {
      updateCandidate(username, { sending: false });
      setError(sendError.message);
    }
  };

  const shortlistedCount = candidates.length;
  const sentCount = candidates.filter((candidate) => candidate.emailSent).length;
  const pendingCount = shortlistedCount - sentCount;

  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="dashboard-eyebrow">Admin shortlist console</p>
          <h1>Review matched CVs and trigger the next-round email in one place.</h1>
          <p>
            This dashboard shows the candidates already matched by the selection pipeline.
            Each row can be emailed individually for the next interview stage.
          </p>
        </div>

        <div className="dashboard-hero-card">
          <div className="hero-card-row">
            <span>Shortlisted</span>
            <strong>{shortlistedCount}</strong>
          </div>
          <div className="hero-card-row">
            <span>Email sent</span>
            <strong>{sentCount}</strong>
          </div>
          <div className="hero-card-row">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
      </section>

      {message ? <div className="notice-banner success">{message}</div> : null}
      {error ? <div className="notice-banner error">{error}</div> : null}

      <section className="dashboard-table-card">
        <div className="section-header">
          <div>
            <h2>Matched candidates</h2>
            <p>Send the next-round invite directly from the shortlist.</p>
          </div>
          <button className="refresh-button" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="table-state">Loading shortlisted candidates...</div>
        ) : candidates.length === 0 ? (
          <div className="table-state">No shortlisted candidates found yet.</div>
        ) : (
          <div className="table-scroll">
            <table className="candidate-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Followers</th>
                  <th>Cluster</th>
                  <th>Languages</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id ?? candidate.username}>
                    <td>
                      <div className="candidate-name">{candidate.username}</div>
                    </td>
                    <td>{candidate.email || 'Not available'}</td>
                    <td>{candidate.followers ?? 'N/A'}</td>
                    <td>
                      <span className="cluster-pill">{candidate.cluster}</span>
                    </td>
                    <td className="candidate-languages">{candidate.languages || 'N/A'}</td>
                    <td>
                      <span className={`status-pill ${candidate.emailSent ? 'sent' : 'pending'}`}>
                        {candidate.emailSent ? 'Email sent' : 'Ready to send'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="send-button"
                        onClick={() => handleSendEmail(candidate.username)}
                        disabled={candidate.sending || candidate.emailSent}
                      >
                        {candidate.sending ? 'Sending...' : candidate.emailSent ? 'Sent' : 'Send Email'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default DashBoard;