import NotAuth from '../../../assets/icons/expression.svg'
import { useNavigate } from 'react-router-dom';
export default function NotAuthorized() {
  const navigate = useNavigate();
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark">
      <img src={NotAuth} width={100} alt="icon not authorized" />
  <h1 className="display-4 text-danger fw-bold mb-3">Unauthorized Access</h1>
  <p className="lead mb-4 text-muted-custom">This page is strictly reserved for the administrators of this application.</p>
  <button onClick={()=>navigate(-1)} className="btn btn-primary">Back</button>
</div>
  );
} 