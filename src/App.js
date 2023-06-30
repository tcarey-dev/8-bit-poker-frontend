import { Route, Routes } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Landing from "./components/Landing";
import NotFound from "./components/NotFound";

function App() {
  return (
  <>
    <Router>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </Router>
  </>
  );
}

export default App;
