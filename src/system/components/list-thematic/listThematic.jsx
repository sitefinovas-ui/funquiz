import './listThematic.css'
import { useState, useEffect } from 'react'
import thematicService from '../../configurations/Services/thematicServices.js'

const Thematic = ({closePopup })=> {
    const [thematics, setThematics] = useState([])

    useEffect(() => {
        const fetchThematics = async () => {
            try {
                const data = await thematicService.getAllThematics();
                setThematics(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des thématiques :", error);
            }
        };

        fetchThematics();
    }, []);


    return (
        <>
        <div className=" backdrop-blur position-fixed bg-dark bg-opacity-50 top-0 end-0 bottom-0 start-0 h-100 end-0 w-100 ">

            <div className="position-relative w-100">

                <div style={{top:'-10px'}} className="text-dark p-5 start-0 end-0  bg-white position-absolute ">
                    <div className="d-flex align-items-center justify-content-between mx-5">
                        <h2  className="title-selec-quiz fw-bold">Toutes les thématiques</h2>
                        <button onClick={closePopup } className="border-0 btn-close"></button>
                    </div>
                   <div className="dropdown-menu-large w-100">
                    {/* Mega menu */}
                        <div className="dropdown-content w-100">
                        {thematics.map((thematic) => (
                        <div key={thematic.thematic_id} className="dropdown-column">
                            <div className="image-container rounded-circle overflow-hidden mb-3" style={{width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: `${thematic.color_code}`}}>
                                <img 
                                    src={thematic.icon_url}  
                                    className='rounded-circle w-100 h-100 object-fit-cover' 
                                    alt="Thematic category" 
                                />
                            </div>
                            <h4>{thematic.thematic_title}</h4>
                            <ul>
                               <ul className="list-unstyled">
                                {Array.isArray(thematic.sub_thematics) && thematic.sub_thematics.length > 0 ? (
                                    thematic.sub_thematics.map((sub) => (
                                    <li className='hover-custom' key={sub.sub_thematic_id}>
                                        <a href="#" className="text-decoration-none ">
                                        {sub.title}
                                        </a>
                                    </li>
                                    ))
                                ) : (
                                    <li className="text-muted fst-italic small">Aucune sous-thématique</li>
                                )}
                                </ul>

                            </ul>
                        </div>))}
                        </div>
                    </div>

                </div>

            </div>

        </div>
        </>
    )
}
export default Thematic