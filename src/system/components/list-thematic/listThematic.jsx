import './listThematic.css'

const Thematic = ({closePopup })=> {

    return (
        <>
        <div className=" backdrop-blur position-fixed bg-dark bg-opacity-50 top-0 end-0 bottom-0 start-0 h-100 end-0 w-100 ">

            <div className="position-relative w-100">

                <div style={{top:'0px'}} className="text-dark p-5 start-0 end-0  bg-white position-absolute ">
                    <div className="d-flex align-items-center justify-content-between mx-5">
                        <h2 style={{fontSize:'60px'}} className="fw-bold">Toutes les thématiques</h2>
                        <button onClick={closePopup } className="border-0 btn-close"></button>
                    </div>
                   <div className="dropdown-menu-large w-100">
                    {/* Mega menu */}
                        <div className="dropdown-content w-100">
                        <div className="dropdown-column">
                            <div className="image-container" style={{width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <img 
                                    src="https://i.pinimg.com/736x/7c/6c/28/7c6c286c09515026c6d415af78957deb.jpg"  
                                    className='rounded-circle w-100 h-100 object-fit-cover' 
                                    alt="Thematic category" 
                                />
                            </div>
                            <h4>🎵 Musique</h4>
                            <ul>
                            <li><a href="#">Option 1A</a></li>
                            <li><a href="#">Option 1B</a></li>
                            <li><a href="#">Option 1C</a></li>
                            </ul>
                        </div>

                        <div className="dropdown-column">
                             <div className="image-container" style={{width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <img 
                                    src="https://i.pinimg.com/736x/7c/6c/28/7c6c286c09515026c6d415af78957deb.jpg"  
                                    className='rounded-circle w-100 h-100 object-fit-cover' 
                                    alt="Thematic category" 
                                />
                            </div>
                            <h4>🍽️ Gastronomie</h4>
                            <ul>
                            <li><a href="#">Option 2A</a></li>
                            <li><a href="#">Option 2B</a></li>
                            <li><a href="#">Option 2C</a></li>
                            </ul>
                        </div>

                        <div className="dropdown-column">
                             <div className="image-container" style={{width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <img 
                                    src="https://i.pinimg.com/736x/7c/6c/28/7c6c286c09515026c6d415af78957deb.jpg"  
                                    className='rounded-circle w-100 h-100 object-fit-cover' 
                                    alt="Thematic category" 
                                />
                            </div>
                            <h4>🎭 Culture</h4>
                            <ul>
                            <li><a href="#">Option 3A</a></li>
                            <li><a href="#">Option 3B</a></li>
                            <li><a href="#">Option 3C</a></li>
                            </ul>
                        </div>

                        <div className="dropdown-column">
                             <div className="image-container" style={{width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <img 
                                    src="https://i.pinimg.com/736x/7c/6c/28/7c6c286c09515026c6d415af78957deb.jpg"  
                                    className='rounded-circle w-100 h-100 object-fit-cover' 
                                    alt="Thematic category" 
                                />
                            </div>
                            <h4>🏡 Vie Quotidienne</h4>
                            <ul>
                            <li><a href="#">Option 4A</a></li>
                            <li><a href="#">Option 4B</a></li>
                            <li><a href="#">Option 4C</a></li>
                            </ul>
                        </div>

                        <div className="dropdown-column">
                             <div className="image-container" style={{width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <img 
                                    src="https://i.pinimg.com/736x/7c/6c/28/7c6c286c09515026c6d415af78957deb.jpg"  
                                    className='rounded-circle w-100 h-100 object-fit-cover' 
                                    alt="Thematic category" 
                                />
                            </div>
                            <h4>🌍 Langue</h4>
                            <ul>
                            <li><a href="#">Français</a></li>
                            <li><a href="#">Anglais</a></li>
                            <li><a href="#">Espagnol</a></li>
                            </ul>
                        </div>

                        <div className="dropdown-column">
                             <div className="image-container" style={{width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <img 
                                    src="https://i.pinimg.com/736x/7c/6c/28/7c6c286c09515026c6d415af78957deb.jpg"  
                                    className='rounded-circle w-100 h-100 object-fit-cover' 
                                    alt="Thematic category" 
                                />
                            </div>
                            <h4>⚽ Sport</h4>
                            <ul>
                            <li><a href="#">Option 6A</a></li>
                            <li><a href="#">Option 6B</a></li>
                            <li><a href="#">Option 6C</a></li>
                            </ul>
                        </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
        </>
    )
}
export default Thematic