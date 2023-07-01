import { Route, Routes } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Landing from "./components/Landing";
import NotFound from "./components/NotFound";
import Lobby from "./components/Lobby";
import Navbar from "./components/NavBar";

function App() {
  return (
  <>
    <Router>
      <Routes>
        <Route path='/' element={<Landing/>}/>
	      <Route path='/lobby' element={<Lobby/>}/>
	      <Route path='*' element={<NotFound/>}/>
      </Routes>
    </Router>
  </>
  );
}

export default App;
