import { useEffect, useState } from 'react';
import maintenanceService from '../Services/maintenanceService.js';
import MaintenancePage from '../../sections/Maintenance/MaintenancePage.jsx';

function isAdminToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.role === 'admin';
  } catch {
    return false;
  }
}

const MaintenanceGuard = ({ children }) => {
  const [maintenance, setMaintenance] = useState(false);
  const [checked,     setChecked]     = useState(false);

  useEffect(() => {
    maintenanceService.getStatus()
      .then(data => {
        const isOn = data?.maintenance === true || data?.maintenance === 'true';
        setMaintenance(isOn);
      })
      .catch((err) => {
        console.error('[MaintenanceGuard] Erreur:', err?.message || err);
        setMaintenance(false);
      })
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;

  // Les admins contournent pour garder l'accès au dashboard
  if (maintenance && !isAdminToken()) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
