import "nes.css/css/nes.min.css";
import './NotFound.css'

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
            <button className="nes-btn is-warning">Go Back</button>
        </div>
    </div>)
}

export default NotFound;

