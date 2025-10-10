import './result.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePopup } from '../../configurations/Context/PopupContext.jsx';
import pointService from '../../configurations/Services/pointService.js';

const Result = ({ closePopup }) => {
    const navigate = useNavigate();
    const { popupPayload } = usePopup();

    const { score = 0, total = 0, thematicTitle = '', subTitle = '', userId = null } = popupPayload || {};
    const [totalPoints, setTotalPoints] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!userId) return;
                const pts = await pointService.getUserPoints(userId);
                const total =
                    pts?.total_points ??
                    pts?.points ??
                    pts?.data?.total_points ??
                    pts?.data?.points ??
                    0;
                if (mounted) setTotalPoints(Number(total) || 0);
            } catch (e) {
                if (mounted) setTotalPoints(0);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [userId]);

    const handleHome = () => {
        closePopup?.();
        navigate('/');
    };

    return (
        <div className="blur bg-dark bg-opacity-50 top-0 bottom-0 left-0 right-0 position-absolute z-3 w-100 h-100 d-flex align-items-center justify-content-center">
            <div className="result-card bg-white shadow-lg rounded-4 p-4 text-center">
                <h3 className="fw-bold mb-3">Résultat du Quiz</h3>
                <p className="mb-2">Sous-thème : {subTitle}</p>
                <p className="mb-2">Thématique : {thematicTitle}</p>
                <p className="fw-bold fs-4 text-success mb-3">
                    {score} / {total}
                </p>
                <p className="mb-2">Total de vos points : {totalPoints ?? '...'}</p>
                <button onClick={handleHome} className="btn btn-primary rounded-pill px-4">
                    Retour à l'accueil
                </button>
            </div>
        </div>
    );
};

export default Result;
