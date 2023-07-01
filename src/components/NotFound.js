import "nes.css/css/nes.min.css";
import './NotFound.css'
import { Link } from "react-router-dom";

function NotFound() {
    return(<div id="notFound">
         <div className="container">
            <div>
                <p id="noPrincess">Sorry...The Princess Is In Another Castle...</p>
            </div>
            <section id="imageContainerTwo">
                
            </section>
        </div>
        <div className="goBackButton">
            <Link className="nes-btn is-warning" type="button" to={"/"}>
                Go Back 
            </Link>
        </div>
    </div>)
}

export default NotFound;

