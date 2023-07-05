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

    const hero = useRef(null);
    const villain = useRef(null);
    const room = useRef({
        "roomId": id,
        "stake": stake,
        "seats": seats,
        "playerCount": playerCount
    });

    const [connected, setConnected] = useState(false);
    const [timeToGetRoom, setTimeToGetRoom] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const [heroHoleCards, setHeroHoleCards] = useState(['EMPTY', 'EMPTY']);
    const [herosAction, setHerosAction] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [bet, setBet] = useState('0');

    const connect = useCallback(() => {
        stompClient = Stomp.over(() => {
            return new SockJS(ws_url);
        });
        stompClient.connect({}, () => {
            setConnected(true);
            stompClient.subscribe(`/topic/game/${room.current.roomId}`, (message) => {
                const roomResponse = JSON.parse(message.body);
                room.current = roomResponse;

                if (roomResponse.game !== null) {
                    setInitialized(true);
                    handleRoomState();
                }
            });
            stompClient.subscribe(`/topic/errors`, (error) => {
                console.log(error.body);
            });
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
                console.log("Existing room data from server:");
                console.log(data);
                if (room.current.game === null || room.current.game.gameId === null) {
                    stompClient.send(`/app/init/${room.current.roomId}`, {}, JSON.stringify(room.current)); 
                } else if(room.current.game !== null) {
                    setInitialized(true);
                }
            })
            .catch(console.log);
        }
    }, [id, timeToGetRoom, connected])

    useEffect(() => {
        if(initialized) {
            console.log(`Room state after initialization:`);
            console.log(room.current);
            if (room.current.game.players !== null) {
                if (!room.current.game.players.some(p => p.username === auth.user.username)){
                    room.current.game.players = [...room.current.game.players, hero.current]
                }
            } else if (room.current.game.players === null) {
                room.current.game.players = [hero.current]
            }
            console.log(room.current.game.players)
            stompClient.send(`/app/add-players/${room.current.roomId}`, {}, JSON.stringify(room.current));
        }
    }, [initialized, auth.user.username])

    const disconnect = () => {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
        navigate('/lobby');
    }

    const startGame = () => {
        stompClient.send(`/app/start-game/${room.current.roomId}`, {}, JSON.stringify(room.current));
    }

    const handleRoomState = () => {
        let game = room.current.game;
        let players;

        if (game.players.length < 2) { return; } 
        else {
            players = game.players;
            hero.current = players.find(p => p.username === auth.user.username);
            villain.current = players.find(p => p.username !== auth.user.username);
        }

        setHeroHoleCards(hero.current.holeCards ? hero.current.holeCards : ['EMPTY', 'EMPTY']);
        setHerosAction(hero.current.playersAction);


    }

    const handleBet = () => {
        stompClient.send(`/app/bet/${room.current.roomId}`, {}, JSON.stringify(room.current));
    }

    const handleRaise = () => {
        stompClient.send(`/app/raise/${room.current.roomId}`, {}, JSON.stringify(room.current))
    }

    const handleCheck = () => {
        stompClient.send(`/app/check/${room.current.roomId}`, {}, JSON.stringify(room.current));
    }

    const handleCall = () => {
        stompClient.send(`/app/call/${room.current.roomId}`, {}, JSON.stringify(room.current));
    }

    const handleFold = () => {
        stompClient.send(`/app/fold/${room.current.roomId}`, {}, JSON.stringify(room.current));
    }

    const handleChange = (event) => {
        if (event.target.id === 'bet-input-slider') {
            setBet(event.target.value);
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        switch(event.target.id) {
            case 'leave':
                disconnect();
                break;
            case 'start':
                startGame();
                break;
            case 'call':
                handleCall();
                break;
            case 'bet':
                handleBet();
                break;
            case 'raise':
                handleRaise()
                break;
            case 'check':
                handleCheck();
                break;
            case 'fold':
                handleFold();
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
                {!gameStarted ? 
                    <div id="item1">
                    <button id="start"
                        className="nes-btn is-primary"
                        type="button"
                        onClick={handleSubmit}>
                    Start Game
                    </button>
                    </div> : <div></div>}
                <div id="item2"></div>
                <div id="item3">
                    <div>{villain.current ? villain.current.displayName : ""}</div>
                    <div className="icon-stack">
                            <div><i className="nes-mario"></i></div>
                            <div>{villain.current ? villain.current.accountBalance : 0}<i className="nes-icon coin is-med"></i></div>
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
                <div id="pot">Pot: {!room.current.game 
                                        ? <div></div>
                                        : room.current.game.pot === 0
                                        ? <div></div> 
                                        :  
                                        <>
                                            <i className="nes-icon coin is-small"></i>&nbsp;{room.current.game.pot}</>}
                    </div> 
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
                    {/* custom messages could be displayed here */}
                    <div></div>
                </div>
                {/* <div id="item17">17</div> */}
                <div id="item18">
                    <div id="hero-card1">
                        {<Card value={`${heroHoleCards[0]}`} />}
                    </div>
                    <div id="hero-card2">
                    {<Card value={`${heroHoleCards[1]}`} />}                  
                    </div>
                </div>
                {/* <div id="item19"></div> */}
                <div id="item20">                    
                    <div id="player-option-container">
                        <div id="player-option-section1">
                            <div id="player-options-section1-info-subsection"></div>
                            <div id="player-options-section1-btn-subsection">
                            { !herosAction 
                                    ? <div></div> 
                                    : ((!room.current.game.lastAction
                                        || room.current.game.lastAction === 'NONE') 
                                        && hero.current.position === 'SMALLBLIND')
                                        || (room.current.game.lastAction === 'BET' 
                                        || room.current.game.lastAction === 'RAISE')
                                        ? <div id="player-option-btns">
                                            <button id="call"
                                                className="nes-btn is-primary"
                                                type="button"
                                                onClick={handleSubmit}>
                                            Call
                                            </button>
                                            <button id="raise"
                                                className="nes-btn is-primary"
                                                type="button"
                                                onClick={handleSubmit}>
                                            Raise
                                            </button>
                                            <button id="fold"
                                                className="nes-btn is-primary"
                                                type="button"
                                                onClick={handleSubmit}>
                                            Fold
                                            </button>
                                        </div> 
                                        : room.current.game.lastAction === 'CHECK' 
                                            || room.current.game.lastAction === 'CALL' 
                                            ? <div id="player-option-btns">
                                                <button id="check"
                                                    className="nes-btn is-primary"
                                                    type="button"
                                                    onClick={handleSubmit}>
                                                Check
                                                </button>
                                                <button id="raise"
                                                    className="nes-btn is-primary"
                                                    type="button"
                                                    onClick={handleSubmit}>
                                                Raise
                                                </button>
                                                <button id="fold"
                                                    className="nes-btn is-primary"
                                                    type="button"
                                                    onClick={handleSubmit}>
                                                Fold
                                                </button>
                                            </div> 
                                            : <div></div>
                            }
                            </div>
                            </div>
                        </div>
                        <div id="player-option-section2">
                            <input type="range" 
                                    id="bet-input-slider" 
                                    className="nes-progress"
                                    min={room.current ? room.current.stake : '0'} 
                                    max={hero.current ? hero.current.accountBalance : '500'}
                                    onChange={handleChange}/>
                            <p>Bet amount: {bet} </p>
                        </div>
                </div>
                {/* <div id="item21">21</div> */}
                <div id="item22"></div>
                <div id="item23"></div>
                <div id="item24">
                    <div className="icon-stack">
                        <div><i className="nes-ash"></i></div>
                        <div>{hero.current ? hero.current.accountBalance : 0}<i className="nes-icon coin is-med"></i></div>
                    </div>
                    <div>{hero.current ? hero.current.displayName : ""}</div>
                </div>
                {/* <div id="item25"></div> */}

            </section>
            {/* <div>{room.game ? `Game ${room.game.gameId} successfully initialized` : 'Currently no game'}</div> */}
        </div>
    );

}

export default Room;
