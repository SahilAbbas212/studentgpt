import { useLocation }
from "react-router-dom";

import AppRoutes from
"./routes/AppRoutes";

import FloatingPomodoro
from "./components/FloatingPomodoro";

function App() {

  const location =
    useLocation();

  const hidePomodoro =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (

    <>

      <AppRoutes />

      {
        !hidePomodoro && (
          <FloatingPomodoro />
        )
      }

    </>

  );
}

export default App;