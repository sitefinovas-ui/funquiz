import './loader.css';

export default function Loader({ title = 'Chargement...', subtitle = 'Veuillez patienter' }) {
  return (
    <div className="app-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="app-loader-card">
        <div className="app-loader-mark" aria-hidden="true">
          <span className="app-loader-ring" />
          <span className="app-loader-ring ring-2" />
          <span className="app-loader-glow" />
          <img className="app-loader-logo" src="/favicon_log_fun_quiz.png" alt="" />
        </div>
        <div className="app-loader-text">
          <div className="app-loader-title">{title}</div>
          <div className="app-loader-subtitle">{subtitle}</div>
          <div className="app-loader-bar" aria-hidden="true">
            <span className="app-loader-bar-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}
