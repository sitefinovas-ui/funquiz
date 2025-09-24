import { Outlet } from "react-router-dom";
import { usePopup } from "../../configurations/Context/PopupContext.jsx";

import Header from "../Header/header.jsx";
import Footer from "../Footer/footer.jsx";
import Wel from "../Infos/Info.jsx";
import Cookie from "../Cookie/cookie.jsx";
import ListThematic from "../list-thematic/listThematic.jsx";
import DeleteUser from "../DeleteUser/delete-user.jsx";

export default function Layout() {
  const { activePopup, setActivePopup, closePopup } = usePopup();

  const popupComponents = {
    thematic: <ListThematic closePopup={closePopup} />,
    deleteUser: <DeleteUser closePopup={closePopup} />,
  };

  return (
    <div className="bg-custom-app">
      <Header openPopup={setActivePopup} />

      <main>
        <Outlet />
      </main>

      <Wel />
      <Cookie />
      <Footer openPopup={setActivePopup} />

      {/* Pop-up dynamique */}
      {activePopup && popupComponents[activePopup]}
    </div>
  );
}
