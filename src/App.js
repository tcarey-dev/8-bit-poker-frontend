import { Route, Routes } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Landing from "./components/Landing";
import NotFound from "./components/NotFound";
import Lobby from "./components/Lobby";
import LoginForm from "./components/Login";
import RoomForm from "./components/RoomForm";
import SignUpForm from "./components/SignUpForm";

function App() {
  return (
  <>
    <Router>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/signup' element={<SignUpForm/>}/>
        <Route path='/room/create' element={<RoomForm/>}/>
        <Route path='/room/update/:id' element={<RoomForm/>}/>
	      <Route path='/lobby' element={<Lobby/>}/>
	      <Route path='*' element={<NotFound/>}/>
      </Routes>
    </Router>
  </>
  );
}

export default App;
