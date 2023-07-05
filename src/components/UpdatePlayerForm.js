import { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useParams, useHistory } from "react-router-dom";
import "nes.css/css/nes.min.css";
import Errors from "../Errors";
import AuthContext from "../contexts/AuthContext";

const EMPTY_PLAYER = {
    playerId: 0,
    username: '',
    password: '',
};


function UpdatePlayerForm(){

    const [player, setPlayer] = useState(EMPTY_PLAYER);
    const [errors, setErrors] = useState([]);
    const url = 'http://localhost:8080/api/player'
    const navigate = useNavigate();
    const { id } = useParams();
    const jwtToken = localStorage.getItem('jwt_token');
    const auth = useContext(AuthContext);

    useEffect(() => {
        const jwtToken = localStorage.getItem('jwt_token');

        const init = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }}

        if(id){
            fetch(`${url}/${auth.user.username}`, init)
            .then(response => {
                if(response.status === 200){
                    return response.json();
                }else{
                    return Promise.reject(`Unexpected Status Code: ${response.status}`);
                }
            })
            .then(data => {
                setPlayer(data)
            })
            .catch(err => setErrors(err));
        }
    }, [auth.user.username]);

    const handleChange = (event) => {
        const newPlayer = { ...player };
        newPlayer[event.target.name] = event.target.value;
        setPlayer(newPlayer);
    }

    const handlesubmit = (event) => {
        event.preventDefault();
        updatePlayer();
    }

    const updatePlayer = () => {
        player.playerId = id;

        const init = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(player)
        };

        fetch(`${url}/${id}`, init)
            .then(response => {
                if (response.status === 204) {
                    return null;
                } else if (response.status === 400) {
                    return response.json();
                }
                else {
                    return Promise.reject(`Unexpected Status Code: ${response.status}`);
                }
            })
            .then(data => {
                if (!data) {
                    navigate('/lobby')
                } else {
                    setErrors(data);
                }
            })
            .catch(err => setErrors(err))
    }

    return(
        <>
        <div className="container-fluid">
            <section id="signUpBorder" className="nes-container with-title is-rounded">
                <h2 id="signUpHeading" className="title">Update Account</h2>
                <Errors errors={errors}/>
                <form onSubmit={handlesubmit} id="signUpForm"></form>
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
                    {/* <fieldset id="selectFieldSeats" className="nes-select">
                        <label id="seatsTitle" htmlFor="seats">Icon</label>
                        <select id="seats"
                                name="seats"
                                required 
                                type="number" 
                                className="nes-input" 
                                value={player.icon} //we dont have a player.icon yet
                                onChange={handleChange}>
                                <option value={""} disable select hidden>Select...</option>
                                <option value={1}>Mario</option>
                                <option value={2}>Ash</option>
                                <option value={3}>Pokeball</option>
                                <option value={4}>Bulbasaur</option>
                                <option value={5}>Charmander</option>
                                <option value={6}>Squirtle</option>
                                <option value={7}>Kirby</option>
                        </select>
                    </fieldset> */}
                    <div>
                    <button id="updateSubmit" className="nes-btn is-primary" type="submit">
                        UPDATE
                    </button>
                    <Link id="updateCancel" className="nes-btn is-error" type="button" to={"/lobby"}>
                        CANCEL
                    </Link>
                </div>
            </section>
        </div>
        </>
    )
}

export default UpdatePlayerForm;
