import './header.css';
import { Link } from 'react-router-dom';
import Logo from '../../../assets/logo_funquiz.svg';

import { FaFacebook, FaTwitter, FaTiktok, FaYoutube } from 'react-icons/fa';

const Header = () => {
  const size = 20;
  return (
    <header className="w-100">
      <div
        style={{ maxWidth: '', backgroundColor: 'var(--bg-purple)' }}
        className="w-100 mx-auto d-flex py-2 px-5  justify-content-between align-items-center"
      >
         <ul
          style={{ fontSize: '0.8em' }}
          className="p-0 d-flex align-items-center gap-3 text-light m-0 p-0"
        >
          <li>
            <Link className="link-white nav-item-header">Politique de confidentialité</Link>
          </li>
          <li>
            <Link className="link-white nav-item-header">Conditions générales d'utilisation</Link>
          </li>
          <li>
            <Link className="link-white nav-item-header">Mentions légales</Link>
          </li>
        </ul>
        <ul className="d-flex align-items-center gap-3 m-0 p-0">
          <li className="">
            <Link to={'/'} className="link-white">
              {' '}
              <FaFacebook size={size} />
            </Link>
          </li>
          <li className="">
            <Link to={'/'} className="link-white">
              {' '}
              <FaTwitter size={size} />
            </Link>
          </li>
          <li className="">
            <Link to={'/'} className="link-white">
              {' '}
              <FaTiktok size={size} />
            </Link>
          </li>
          <li className="">
            <Link to={'/'} className="link-white">
              {' '}
              <FaYoutube size={size} />
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};
export default Header;
