import NotAuth from '../../../assets/icons/expression.svg';
import { useNavigate } from 'react-router-dom';

export default function NotAuthorized() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6" style={{ background: '#0d0d19' }}>
      <img src={NotAuth} width={80} alt="icon not authorized" />
      <h1 className="text-4xl font-bold" style={{ color: '#ef4444' }}>Unauthorized Access</h1>
      <p className="text-base text-center max-w-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
        This page is strictly reserved for the administrators of this application.
      </p>
      <button onClick={() => navigate(-1)} className="btn-primary-glow">
        Back
      </button>
    </div>
  );
}
