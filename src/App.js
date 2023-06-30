import { Route, Routes } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Landing from "./components/Landing";
import Lobby from "./components/Lobby";

function App() {
  return (
  <>
    <Router>
      <Routes>
        <Route path='/' element={<Lobby/>}/>
      </Routes>
    </Router>
  </>
  );
}

export default App;
