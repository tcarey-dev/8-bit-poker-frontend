import React from "react";
// import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing(){

// const navigate = useNavigate();

return(<>
    <section id="imageContainer">
        <div>
            <h1>Welcome to<br/>8-Bit Poker Showdown!</h1>
        </div>
    </section>
    <section>
        <h2>Select Option Below</h2>
        <button className="btn btn-primary btn-lg" >
            <i className="bi btn-primary btn-lg" 
            // onClick={() => navigate()}
            ></i>Login
        </button>
        <button className="btn btn-primary btn-lg" >
            <i className="bi btn-primary btn-lg"></i>Sign-Up
        </button>
    </section>
</>)
}

export default Landing;