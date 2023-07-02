import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "nes.css/css/nes.min.css";
import Errors from "../Errors";
import "./SignUpForm.css";

const EMPTY_PLAYER = {
    playerId: 0,
    username: '',
    password: '',
    displayName: '',
    accountBalance: 0
};

function SignUpForm() {

    const [player, setPlayer] = useState(EMPTY_PLAYER);
    const [errors, setErrors] = useState([]);

    const url = 'http://localhost:8080/api/player/create-account'

    const navigate = useNavigate();

    const { id } = useParams();

    useEffect(() => {
        if (id) {
            fetch(`${url}/${id}`)
            .then(response => {
                if(response.status === 200) {
                    return response.json();
                }else{
                    return Promise.reject(`Unexpected status code: ${response.status}`);
                }
            })
            .then( data => {
                setPlayer(data)
            })
            .catch(console.log);
        }
    }, [id]);

    const handleChange = (event) => {
        const newPlayer = { ...player };

        newPlayer[event.target.name] = event.target.value;

        setPlayer(newPlayer);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        addPlayer();
        }
    

    const addPlayer = () => {
        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(player)
        };
        fetch(url, init)
            .then(response => {
                if(response.status === 201 || response.status === 400) {
                    return response.json();
                }else{
                    return Promise.reject(`Unexpected status code: ${response.status}`);
                }
            })
            .then(data => {
                if (data.playerId) {
                    navigate('/lobby')
                }else{
                    setErrors(data)
                }
            })
            .catch(console.log)
    }




    return(
    <div className="container-flud">
        <section id="signUpBorder" className="nes-container with-title is-rounded">
            <h2 id="signUpHeading" className="title">Sign Up</h2>
            {errors.length > 0 && (
                <div className="alert alert-danger">
                    <p>The Following errors were found:</p>
                    <ul>
                        {errors.map(error =>
                            <li key={error}>{error}</li>
                        )}
                    </ul>
                </div>
            )}
            <form onSubmit={handleSubmit} id="signUpForm">
                <fieldset className="form-group">
                    <label htmlFor="username" className="nes-textarea">Username</label>
                    <input placeholder="example@example.com"
                        type="text"
                        className="nes-textarea" 
                        id="username" 
                        name="username"
                        value={player.username}
                        onChange={handleChange}/>
                </fieldset>
                <fieldset className="form-group">
                    <label htmlFor="password" className="nex-textarea">Password</label>
                    <input placeholder="8 Character Min. Must Contain: Digit, Letter, Special Character"
                        type="text" 
                        className="nes-textarea"
                        id="password"
                        name="password"
                        value={player.password}
                        onChange={handleChange}/>
                </fieldset>
                <fieldset className="form-group">
                    <label htmlFor="displayName" className="nes-textarea" >Display Name</label>
                    <input placeholder="50 Character Max."
                        type="text"
                        className="nes-textarea"
                        id="displayName"
                        name="displayName"
                        value={player.displayName}
                        onChange={handleChange}/>
                </fieldset>
                <fieldset className="form-group">
                    <label htmlFor="accountBalance">Account Balance</label>
                    <input type="text"
                        className="nes-textarea"
                        id="accountBalance"
                        name="accountBalance"
                        value={player.accountBalance}
                        onChange={handleChange}/>
                </fieldset>
                <div className="mt-4">
                    <button id="signUpSubmit" className="nes-btn is-primary" type="submit">
                        <i>Submit</i>
                    </button>
                    <Link id="signUpCancel" className="nes-btn is-error" type="button" to={"/"}>
                        <i>Cancel</i>
                    </Link>
                </div>
            </form>
        </section>
    </div>)
}

export default SignUpForm;