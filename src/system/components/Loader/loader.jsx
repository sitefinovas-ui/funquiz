import './loader.css';

export default function Loader({
  title = 'Chargement...',
  subtitle = 'Veuillez patienter',
}) {
  return (
    <div className="app-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="app-loader-card">
        <div className="app-loader-mark" aria-hidden="true">
          {/* Triangle Play Store style — 4 facettes colorées */}
          <svg
            className="app-loader-play"
            viewBox="0 0 60 60"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="gpBlue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00C6FF" />
                <stop offset="100%" stopColor="#0072FF" />
              </linearGradient>
              <linearGradient id="gpRed" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF4E50" />
                <stop offset="100%" stopColor="#D32F2F" />
              </linearGradient>
              <linearGradient id="gpYellow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFD24C" />
                <stop offset="100%" stopColor="#F9A825" />
              </linearGradient>
              <linearGradient id="gpGreen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5DE0A6" />
                <stop offset="100%" stopColor="#1B9E5A" />
              </linearGradient>
            </defs>
            {/* 4 facettes du triangle Play */}
            <polygon points="10,6 30,30 10,54" fill="url(#gpBlue)" />
            <polygon points="10,6 50,30 30,30" fill="url(#gpRed)" />
            <polygon points="10,54 30,30 50,30" fill="url(#gpGreen)" />
            <polygon points="50,30 30,30 30,30" fill="url(#gpYellow)" />
          </svg>
          <span className="app-loader-spinner" />
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