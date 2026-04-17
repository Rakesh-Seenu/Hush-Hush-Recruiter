import '../CSS/candidate.css';
import { useAuth } from '../context/AuthContext';

function CandidateDashboard() {
  const { user } = useAuth();

  return (
    <div className="candidate-shell">
      <div className="candidate-card">
        <p className="candidate-eyebrow">Candidate Dashboard</p>
        <h1>Welcome {user?.email || 'Candidate'}</h1>
        <p>
          Your profile has been received. If your CV matches the current role, the recruiter will send a next-round
          invitation directly from the admin dashboard.
        </p>

        <div className="candidate-status-grid">
          <div className="candidate-status-item">
            <span>Application</span>
            <strong>Received</strong>
          </div>
          <div className="candidate-status-item">
            <span>Screening</span>
            <strong>In Progress</strong>
          </div>
          <div className="candidate-status-item">
            <span>Next Update</span>
            <strong>By Email</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;
