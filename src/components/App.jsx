import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Ducks from "./Ducks";
import Login from "./Login";
import MyProfile from "./MyProfile";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import * as auth from "../utils/auth";
import {setToken, getToken} from "../utils/token";
import * as api from "../utils/api";
import AppContext from '../contexts/AppContext';
import "./styles/App.css";

function App() {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  const handleRegistration = ({
    username,
    email,
    password,
    confirmPassword,
  }) => {
    if (password === confirmPassword) {
      auth.register(username, password, email)
       .then(() => {
        navigate("/login");
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    const jwt = getToken();
  
    if (!jwt) {
      return;
    }
    
    // Llama a la función, pasándole el JWT.
    api
      .getUserInfo(jwt)
      .then(({ username, email }) => {
        // si la respuesta es exitosa, inicia la sesión del usuario, guarda sus
        // datos en el estado y lo dirige a /ducks.
        setIsLoggedIn(true);
        setUserData({ username, email });
      })
      .catch(console.error);
  }, []);

  const handleLogin = ({ username, password }) => {
    if (!username || !password) {
      return;
    }

    auth
      .authorize(username, password)
      .then((data) => {
        // Verifica que se incluyó un jwt antes de iniciar la sesión del usuario.
        if (data.jwt) {
          setToken(data.jwt);      // guardar el jwt en localStorage
          setUserData(data.user);  // guardar los datos de usuario en el estado
          setIsLoggedIn(true);     // inicia la sesión del usuario
          navigate("/ducks");      // enviarlo a /ducks
                  // Después de iniciar sesión, en lugar de navegar todo el tiempo a /ducks,
        // navega a la ubicación que se almacena en state. Si
        // no hay ubicación almacenada, por defecto
        // redirigimos a /ducks.
        const redirectPath = location.state?.from?.pathname || "/ducks";
        navigate(redirectPath);
        }
      })
      .catch(console.error);
  };

  return (
    <AppContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
    <Routes>
      <Route
        path="/ducks"
        element={
          <ProtectedRoute>
            <Ducks/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-profile"
        element={
          <ProtectedRoute>
            <MyProfile userData={userData}/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <ProtectedRoute anonymous>
            <div className="loginContainer">
              <Login handleLogin={handleLogin} />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/register"
        element={
          <ProtectedRoute anonymous>
            <div className="registerContainer">
              <Register handleRegistration={handleRegistration} />
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={ isLoggedIn ? (<Navigate to="/ducks" replace/>) : (<Navigate to="/login" replace/>)}/>
    </Routes>
    </AppContext.Provider>
  );
}

export default App;
