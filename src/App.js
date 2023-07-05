import { useState, useCallback, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import jwtDecode from "jwt-decode";
import Landing from "./components/Landing";
import NotFound from "./components/NotFound";
import Lobby from "./components/Lobby";
import LoginForm from "./components/Login";
import RoomForm from "./components/RoomForm";
import SignUpForm from "./components/SignUpForm";
import Room from "./components/Room";
import Card from "./components/Card";
import { refreshToken, signOut } from "./services/authApi";
import AuthContext from "./contexts/AuthContext";

const EMPTY_USER = {
  playerId: null,
  username: '',
  authorities: []
};
const WAIT_TIME = 1000 * 60 * 14;

function App() {

  const [user, setUser] = useState(EMPTY_USER);
  const [restoreLoginAttemptCompleted, setRestoreLoginAttemptCompleted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      login(token);
    }
    setRestoreLoginAttemptCompleted(true);
  }, []);

  const login = (jwtToken) => {
    localStorage.setItem('jwt_token', jwtToken);

    const tokenParts = jwtToken.split('.');
    if (tokenParts.length > 1) {
      const userData = tokenParts[1];
      const decodedUserData = JSON.parse(atob(userData));
      const user = {
        playerId: decodedUserData.player_id,
        username: decodedUserData.sub,
        authorities: decodedUserData.authorities.split(',')
      }
      setUser(user);
      return user;
    }
  };

  const refreshUser = useCallback(() => {
    refreshToken()
      .then(existingUser => {
        setUser(existingUser);
        setTimeout(refreshUser, WAIT_TIME);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const auth = {
    user: user,
    isLoggedIn() {
      return !!user.username;
    },
    hasAuthorities(authority) {
      return user.authorities.includes(authority);
    },
    onAuthenticated(user) {
      console.log(user);
      setUser(user);
      setTimeout(refreshUser, WAIT_TIME);
    },
    signOut() {
      setUser(EMPTY_USER);
      signOut();
    }
  };

  const maybeRedirect = (component, authority) => {
    console.log(auth.isLoggedIn());
    if (!auth.isLoggedIn() || (authority && !auth.hasAuthorities(authority))) {
      return <Navigate to="/" />;
    }
    return component;
  }

  if (!restoreLoginAttemptCompleted) {
    return null;
  }

  return (
  <>
    <AuthContext.Provider value={auth}>
      <Router>
        <Routes>
          <Route path='/landing' element={<Landing/>}/>
          <Route path='/' element={auth.isLoggedIn() ? <Lobby /> : <Navigate to="/landing" /> } />
          <Route path='/lobby' element={auth.isLoggedIn() ? <Lobby /> : <Navigate to="/landing" /> } />
          <Route path='/login' element={<LoginForm/>} />
          <Route path='/room/create' element={maybeRedirect(<RoomForm/>, 'ADMIN')}/>
          <Route path='/room/update/:id' element={maybeRedirect(<RoomForm/>, 'ADMIN')}/>
          <Route path='/room/:id' element={auth.isLoggedIn() ? <Room /> : <Navigate to="/landing" /> } />
          <Route path='/card' element={<Card />}/>
          <Route path='*' element={<NotFound/>}/>
        </Routes>
      </Router>
    </AuthContext.Provider>
  </>
  );
}

export default App;