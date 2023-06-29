import { Route, Routes } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Landing from "./components/Landing";

function App() {
  return (
  <>
    <Router>
      <Routes>
        <Route path='/' element={<Landing/>}/>
      </Routes>
    </Router>
  </>
  );
}

export default App;
