import { useCallback, useEffect, useState, useMemo, useContext, useRef } from "react";
import { Stomp } from '@stomp/stompjs';
import SockJS from "sockjs-client";
import { useNavigate, useParams } from "react-router";
import './Room.css';
import Card from "./Card";
import AuthContext from "../contexts/AuthContext";

var stompClient = null;

function Room({ stake, seats, playerCount }){
    const auth = useContext(AuthContext);
    const ws_url = 'http://localhost:8080/ws';
    const player_url = 'http://localhost:8080/api/player';
    const room_url = 'http://localhost:8080/api/room';
    const navigate = useNavigate();
    const { id } = useParams();

    const [connected, setConnected] = useState(false);
    const [timeToGetRoom, setTimeToGetRoom] = useState(false);

    const hero = useRef(null);
    const room = useRef({
        "roomId": id,
        "stake": stake,
        "seats": seats,
        "playerCount": playerCount
    });
    
    const connect = useCallback(() => {
        stompClient = Stomp.over(() => {
            return new SockJS(ws_url);
        });
        stompClient.connect({}, () => {
            stompClient.subscribe('/topic/game', (message) => {
                const roomResponse = JSON.parse(message.body);
                console.log(roomResponse);
                room.current = roomResponse;
            });
            stompClient.subscribe('/topic/errors', (error) => {
                console.log(error.body);
            });
            setConnected(true);
        });
    }, []);

    useEffect(() => {
        connect();
    }, [connect])

    //triggered on page load, set Players
    useEffect(() => {
        if (connected) {
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
                hero.current = data;
                setTimeToGetRoom(true);
            })
            .catch(console.log);
        }
    }, [auth.user.username, connected]);

    useEffect(() => { 
        if (connected) {
            const jwtToken = localStorage.getItem('jwt_token');
            const init = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }}
    
            fetch(`${room_url}/${id}`, init)
            .then(response => {
                if(response.status === 200) {
                    return response.json();
                }else{
                    return Promise.reject(`Unexpected Status Code: ${response.status}`);
                }
            })
            .then(data => {
                room.current = data;
                stompClient.send("/app/init", {}, JSON.stringify(room.current)); 
            })
            .then(() =>{
                // if (!room.current.game.players.some(p => p.username === auth.user.username)) {

                // }
                console.log(hero.current);
                room.current.game.players = [...room.current.game.players, hero.current]
                console.log(room.current.game.players)
                console.log(room.current);
                stompClient.send('/app/add-players', {}, JSON.stringify(room.current));
            })
            .catch(console.log);
        }
    }, [id, timeToGetRoom, connected])

    const disconnect = () => {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
        navigate('/lobby');
    }

    const startGame = () => {
        stompClient.send("/app/start-game", {}, JSON.stringify(room.current));
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        switch(event.target.id) {
            case 'leave':
                console.log('disconnecting');
                disconnect();
                break;
            case 'start':
                startGame();
                break;
            default:
                break;
        }

    }

    return (
        <div id="room">
            <button id="leave"
                    className="nes-btn is-error"
                    type="button"
                    onClick={handleSubmit}>
                Leave
            </button><br></br><br></br>
            <section id="game-container" className="nes-container is-centered is-rounded">
                <div id="item1">
                <button id="start"
                    className="nes-btn is-primary"
                    type="button"
                    onClick={handleSubmit}>
                Start Game
                </button>
                </div>
                <div id="item2"></div>
                <div id="item3">
                    <div>displayName</div>
                    <div className="icon-stack">
                            <div><i className="nes-mario"></i></div>
                            <div>500<i className="nes-icon coin is-med"></i></div>
                    </div>
                </div>
                <div id="item4"></div>
                <div id="item5"></div>
                <div id="item6"></div>
                <div id="item7"></div>
                <div id="item8">
                    <div id="villain-card1">
                        {<Card value={'EMPTY'}/>}
                    </div>
                    <div id="villain-card2">
                        {<Card value={'EMPTY'}/>}
                    </div>
                    </div>
                <div id="item9"></div>
                <div id="item10"></div>
                <div id="pot">Pot</div>
                <div id="item12">
                    <div id="board-flop1">
                        {<Card value={'EMPTY'}/>}
                    </div>
                    <div id="board-flop2">
                        {<Card value={'EMPTY'}/>}
                    </div>
                    <div id="board-flop3">
                        {<Card value={'EMPTY'}/>}
                    </div>
                    <div id="board-turn">
                        {<Card value={'EMPTY'}/>}
                    </div>
                    <div id="board-river">
                        {<Card value={'EMPTY'}/>}
                    </div>
                </div>
                {/* <div id="item13">13</div>
                <div id="item14">14</div> */}
                <div id="item15"></div>
                <div id="game-info">
                    <div>Mario bets 16</div>
                </div>
                {/* <div id="item17">17</div> */}
                <div id="item18">
                    <div id="hero-card1">
                        {/* {<Card value={holeCards[0] ? `${holeCards[0]}` : 'EMPTY'} />} */}
                    </div>
                    <div id="hero-card2">
                        {/* {<Card value={holeCards[1] ? `${holeCards[1]}` : 'EMPTY'} />} */}
                    </div>
                </div>
                <div id="item19"></div>
                <div id="item20">                    
                <div id="player-option-btns">
                        <button id="bet"
                            className="nes-btn is-primary"
                            type="button"
                            onClick={handleSubmit}>
                        Raise
                        </button>
                        <button id="check"
                            className="nes-btn is-primary"
                            type="button"
                            onClick={handleSubmit}>
                        Check
                        </button>
                        <button id="fold"
                            className="nes-btn is-primary"
                            type="button"
                            onClick={handleSubmit}>
                        Fold
                        </button>
                    </div></div>
                {/* <div id="item21">21</div> */}
                <div id="item22"></div>
                <div id="item23"></div>
                <div id="item24">
                    <div className="icon-stack">
                        <div><i className="nes-ash"></i></div>
                        <div>500<i className="nes-icon coin is-med"></i></div>
                    </div>
                    <div>displayName</div>
                </div>
                <div id="item25"></div>

            </section>
            {/* <div>{room.game ? `Game ${room.game.gameId} successfully initialized` : 'Currently no game'}</div> */}
        </div>
    );

}

export default Room;
