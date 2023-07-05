import { Link } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { signOut } from "../services/authApi";
import "nes.css/css/nes.min.css";
import './NavBar.css';
import { useEffect, useState, useContext } from "react";

function Navbar(){
    const player_url = 'http://localhost:8080/api/player';
    const [id, setId] = useState('');
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
            
            fetch(`${player_url}/${auth.user.username}`, init)
            .then(response => {
                if(response.status === 200) {
                    return response.json();
                }else{
                    return Promise.reject(`Unexpected Status Code: ${response.status}`);
                }
            })
            .then(data => {
                setId(data.playerId);
            })
            .catch(console.log);
        
    }, [auth.user.username]);

    return(<>
    <i id="nesController" class="nes-logo"></i>
    <i id="nesController2" class="nes-logo"></i>
        <nav>
            {/* <Link to={'/lobby'}>Lobby</Link> */}
            <Link to={'/landing'} onClick={() => signOut()}>Log Out</Link>
            <Link to={`/player/${id}`}>Profile</Link>
        </nav>
    </>)
}

export default Navbar;