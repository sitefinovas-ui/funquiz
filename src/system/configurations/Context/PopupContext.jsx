import { createContext, useContext, useState } from "react";

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [activePopup, setActivePopup] = useState(null);

  const closePopup = () => setActivePopup(null);

  return (
    <PopupContext.Provider value={{ activePopup, setActivePopup, closePopup }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => useContext(PopupContext);