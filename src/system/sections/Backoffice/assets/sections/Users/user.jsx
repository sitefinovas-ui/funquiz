import './user.css';
import { useEffect } from 'react';

const UserManagement = () => {
     useEffect(() => {
        document.title = "FUNQUIZ Pro | Management des utilisateurs";
      }, []);
  return (
    <div className="user-management  mt-5">
        <div className="">
            <h1 style={{fontSize:'3em'}} className="fw-bold">Gestion des utilisateurs</h1>
            <p className="text-muted-custom">
                Gérez les utilisateurs, modifiez leurs rôles et surveillez leur activité.
            </p>
        </div>
      {/* Contenu de la gestion des utilisateurs */}
    </div>
  );
};

export default UserManagement;