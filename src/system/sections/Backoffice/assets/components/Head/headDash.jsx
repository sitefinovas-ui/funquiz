import './headDash.css'

const HeadDash = () => {
  return (
    <div className="bg-head-custom w-100 position-absolute bg-dark text-light text-center py-3 mt-auto">
      <p className="mb-0">&copy; {new Date().getFullYear()} Dashboard - Tous droits réservés</p>
    </div>
  );
};

export default HeadDash;
