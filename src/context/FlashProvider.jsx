import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

export const FlashContext = createContext();
let flashTimer;

function FlashProvider({ children }) {
  const [flashMessage, setFlashMessage] = useState({});
  const [visible, setVisible] = useState(false);

  const flash = (message, type, heading, duration = 10) => {
    if (flashTimer) {
      clearTimeout(flashTimer);
      flashTimer = undefined;
    }
    setFlashMessage({ message, type, heading });
    setVisible(true);
    if (duration) {
      flashTimer = setTimeout(hideFlash, duration * 1000);
    }
  };

  const hideFlash = () => {
    setVisible(false);
  };

  return (
    <FlashContext.Provider value={{ flash, hideFlash, flashMessage, visible }}>
      {children}
    </FlashContext.Provider>
  );
}

// ✅ Add PropTypes validation
FlashProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validates children
};

export default FlashProvider;

export function useFlash() {
  return useContext(FlashContext);
}
