import { Link } from "react-router-dom";
import "nes.css/css/nes.min.css";
import './NavBar.css';

function Navbar(){
    return(<>
    <i id="nesController" class="nes-logo"></i>
    <i id="nesController2" class="nes-logo"></i>
        <nav>
            <Link to={'/lobby'}>Lobby</Link>
            <Link to={'/'}>Log Out</Link>
        </nav>
    </>)
}

export default Navbar;