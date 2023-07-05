import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useHistory } from "react-router-dom";
import "nes.css/css/nes.min.css";
import Errors from "../Errors";
import "./SignUpForm.css";



const EMPTY_PLAYER = {
    playerId: 0,
    username: '',
    password: '',
};

function SignUpForm() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
      });

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
            .catch(err => setErrors(err));
        }
    }, [id]);

    const handleChange = (evt) => {
        const nextCredentials = { ...credentials };
        nextCredentials[evt.target.name] = evt.target.value;
        setCredentials(nextCredentials);
      };


    const handleSubmit = (event) => {
        event.preventDefault();
        addPlayer();
        navigate('/login');
        }



    const addPlayer = () => {
        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        };
        fetch(url, init)
            .then(response => {
                if (response.status === 201 || response.status === 400) {
                    return response.json();
                } else {
                    return Promise.reject(`Unexpected status code: ${response.status}`);
                }
            })
            .then(data => {
                if (data.id) {
                    navigate('/')
                } else {
                    setErrors(data);
                }
            })
            .catch(err => setErrors(err))
    }


    return(
    <div className="container-fluid">
        <section id="signUpBorder" className="nes-container with-title is-rounded is-dark">
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
                        onChange={handleChange}
                        required/>
                </fieldset>
                <fieldset className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input placeholder="8 Character Min. Must Contain: Digit, Letter, Special Character"
                        type="password" 
                        className="nes-input"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required/>
                </fieldset>
                <div>
                    <button id="signUpSubmit" className="nes-btn is-primary" type="submit">
                        Submit
                    </button>
                    <Link id="signUpCancel" className="nes-btn is-error" type="button" to={"/landing"}>
                        Cancel
                    </Link>
                </div>
            </form>
        </section>
    </div>)
}

export default SignUpForm;