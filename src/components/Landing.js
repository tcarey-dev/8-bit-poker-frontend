import React from "react";
// import { useNavigate } from 'react-router-dom';
import './Landing.css';
import "nes.css/css/nes.min.css";

function Landing(){

// const navigate = useNavigate();

return(<>
        <header>
            <h1>Welcome to<br/>8-Bit Poker Showdown!</h1>
        </header>
        <div className="landingImage">
            <img id="kirby" src="https://preview.redd.it/new-kirby-copy-ability-i-made-card-kirby-v0-jobdbb5ucxv81.png?width=584&format=png&auto=webp&s=ab160467e0a28dd29637217d68e523921a42d6a3"></img>
        </div>
        <section id="buttonContainer">
            <h2 className="optionText">Select Option Below</h2>
                <button className="nes-btn is-primary">
                    <i></i>Log In
                </button>
                <button className="nes-btn is-primary">
                    <i></i>Sign Up
                </button>
        </section>
</>)
}

export default Landing;

// return(<>
//     <section id="imageContainer">
//         <div>
//             <header>
//                 <h1>Welcome to<br/>8-Bit Poker Showdown!</h1>
//             </header>
//         </div>
//     </section>
//     <section id="buttonContainer">
//         <h2>Select Option Below</h2>
//         <button className="nes-btn is-primary" >
//             <i 
//             // onClick={() => navigate()}
//             ></i>Log In
//         </button>
//         <button className="nes-btn is-primary" >
//             <i></i>Sign Up
//         </button>
//     </section>
// </>)