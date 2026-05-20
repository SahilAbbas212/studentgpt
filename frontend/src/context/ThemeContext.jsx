import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme !== "light";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
   document.body.style.cssText = `
  background:
    radial-gradient(ellipse at 0% 0%, #0f1a3e 0%, transparent 50%),
    radial-gradient(ellipse at 100% 0%, #1a0a2e 0%, transparent 50%),
    radial-gradient(ellipse at 100% 100%, #0a1628 0%, transparent 50%),
    radial-gradient(ellipse at 0% 100%, #0d1f3c 0%, transparent 50%),
    linear-gradient(135deg, #060d1f 0%, #080613 50%, #06101e 100%);
  background-attachment: fixed;
  background-size: cover;
`;
      document.body.style.backgroundImage =
        "radial-gradient(ellipse at 20% 20%, #0a0f2e 0%, #020617 40%, #0d0a1e 70%, #020617 100%)";
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundImage = "";
      document.body.style.background =
        "linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 40%, #faf5ff 100%)";
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);