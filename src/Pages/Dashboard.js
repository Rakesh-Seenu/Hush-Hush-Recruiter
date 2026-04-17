import { useEffect, useState } from 'react';
import { FiMail, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
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
        
        // Ensure candidates are unique by username
        const uniqueCandidates = Array.from(new Map((data.candidates || []).map(item => [item.username, item])).values());

        const normalizedCandidates = uniqueCandidates.map((candidate) => ({
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
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Review matched CVs and trigger next-round emails.</p>
      </header>

      {message && (
        <div className="toast toast-success">
          <FiCheckCircle /> {message}
        </div>
      )}
      {error && (
        <div className="toast toast-error">
          <FiAlertCircle /> {error}
        </div>
      )}

      <section className="dashboard-metrics">
        <div className="metric-card">
          <h2>Shortlisted</h2>
          <p>{shortlistedCount}</p>
        </div>
        <div className="metric-card">
          <h2>Emails Sent</h2>
          <p>{sentCount}</p>
        </div>
        <div className="metric-card">
          <h2>Pending</h2>
          <p>{pendingCount}</p>
        </div>
      </section>

      <section className="dashboard-table">
        {loading ? (
          <div className="loading-state">
            <FiLoader className="spinner" />
            <p>Loading candidates...</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>GitHub Profile</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.username}>
                  <td>{candidate.username}</td>
                  <td>{candidate.email || 'N/A'}</td>
                  <td>
                    <a
                      href={`https://github.com/${candidate.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Profile
                    </a>
                  </td>
                  <td>{candidate.total_score}</td>
                  <td>
                    <button
                      className="btn-send-email"
                      onClick={() => handleSendEmail(candidate.username)}
                      disabled={candidate.sending || candidate.emailSent}
                    >
                      {candidate.sending ? (
                        <FiLoader className="spinner" />
                      ) : candidate.emailSent ? (
                        <FiCheckCircle />
                      ) : (
                        <FiMail />
                      )}
                      <span>
                        {candidate.sending
                          ? 'Sending...'
                          : candidate.emailSent
                          ? 'Sent'
                          : 'Send Email'}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default DashBoard;