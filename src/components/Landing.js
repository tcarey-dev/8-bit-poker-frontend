import React from "react";
// import { useNavigate } from 'react-router-dom';
import './Landing.css';
import "nes.css/css/nes.min.css";

function Landing(){

// const navigate = useNavigate();

return(<>
    <section id="imageContainer">
        <div>
            <header>
                <h1>Welcome to<br/>8-Bit Poker Showdown!</h1>
            </header>
        </div>
    </section>
    <section id="buttonContainer">
        <h2>Select Option Below</h2>
        <button className="nes-btn is-primary" >
            <i 
            // onClick={() => navigate()}
            ></i>Login
        </button>
        <button className="nes-btn is-primary" >
            <i></i>Sign-Up
        </button>
    </section>
</>)
}

export default Landing;