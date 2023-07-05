import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useHistory } from "react-router-dom";
import "nes.css/css/nes.min.css";
import Errors from "../Errors";
import "./SignUpForm.css";
import { authenticate } from "../services/authApi";
import AuthContext from "../contexts/AuthContext";


const EMPTY_PLAYER = {
    playerId: 0,
    username: '',
    password: '',
    displayName: '',
    accountBalance: 0
};

function SignUpForm() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
      });
    const auth = useContext(AuthContext);
  
    const [player, setPlayer] = useState(EMPTY_PLAYER);
    const [errors, setErrors] = useState([]);


    const url = 'http://localhost:8080/api/player/create-account'

    const navigate = useNavigate();
    const history = useHistory();

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
            .catch(err => setErrors(err));
        }
    }, [id]);

    const handleChange = (evt) => {
        const nextCredentials = { ...credentials };
        nextCredentials[evt.target.name] = evt.target.value;
        setCredentials(nextCredentials);
      };

    // const handleChange = (event) => {
    //     const newPlayer = { ...player };

    //     newPlayer[event.target.name] = event.target.value;

    //     setPlayer(newPlayer);
    // };


    const handleSubmit = (event) => {
        event.preventDefault();
        addPlayer();
        navigate('/loginform');
        }


    

    const addPlayer = () => {
        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(player)
        };
        fetch(url, init)
            .then(response => {
                if(response.status === 201){

                    
                }else if(response.status === 400){
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
            .catch(err => setErrors(err))
    }






    return(
    <div className="container-fluid">
        <section id="signUpBorder" className="nes-container with-title is-rounded">
            <h2 id="signUpHeading" className="title">Sign Up</h2>
            <Errors errors={errors}/>
            <form onSubmit={handleSubmit} id="signUpForm">
                <fieldset className="form-group">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input placeholder="example@example.com"
                        type="text"
                        className="nes-input" 
                        id="username" 
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}/>
                </fieldset>
                <fieldset className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input placeholder="8 Character Min. Must Contain: Digit, Letter, Special Character"
                        type="text" 
                        className="nes-input"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}/>
                </fieldset>
                <fieldset className="form-group">
                    <label htmlFor="displayName" className="form-label" >Display Name</label>
                    <input placeholder="50 Character Max."
                        type="text"
                        className="nes-input"
                        id="displayName"
                        name="displayName"
                        value={player.displayName}
                        onChange={handleChange}/>
                </fieldset>
                <fieldset className="form-group">
                    <label htmlFor="accountBalance">Account Balance</label>
                    <input type="number"
                        className="nes-input"
                        id="accountBalance"
                        name="accountBalance"
                        value={player.accountBalance}
                        onChange={handleChange}/>
                </fieldset>
                <div>
                    <button id="signUpSubmit" className="nes-btn is-primary" type="submit">
                        Submit
                    </button>
                    <Link id="signUpCancel" className="nes-btn is-error" type="button" to={"/"}>
                        Cancel
                    </Link>
                </div>
            </form>
        </section>
    </div>)
}

export default SignUpForm;