import { useCallback, useEffect, useState, useContext, useRef } from "react";
import { Stomp } from '@stomp/stompjs';
import SockJS from "sockjs-client";
import { useNavigate, useParams } from "react-router";
import './Room.css';
import Card from "./Card";
import AuthContext from "../contexts/AuthContext";

var stompClient = null;

function Room({ stake, seats, playerCount }){
    const ws_url = 'http://localhost:8080/ws';
    const player_url = 'http://localhost:8080/api/player';
    const room_url = 'http://localhost:8080/api/room';
    const navigate = useNavigate();
    const { id } = useParams();
    const auth = useContext(AuthContext);

    const gameStarted = useRef(false)
    const hero = useRef(null);
    const villain = useRef(null);
    const room = useRef({
        "roomId": id,
        "stake": stake,
        "seats": seats,
        "playerCount": playerCount
    });

    const [connected, setConnected] = useState(false);

    const [heroHoleCards, setHeroHoleCards] = useState(['EMPTY', 'EMPTY']);
    const [flop, setFlop] = useState(['EMPTY', 'EMPTY', 'EMPTY']);
    const [turn, setTurn] = useState('EMPTY');
    const [river, setRiver] = useState('EMPTY');
    const [heroIcon, setHeroIcon] = useState('');
    const [villainIcon, setVillainIcon] = useState('')

    const [herosAction, setHerosAction] = useState(false);
    const [bet, setBet] = useState('0');

    const connect = useCallback(() => {
        stompClient = Stomp.over(() => {
            return new SockJS(ws_url);
        });
        stompClient.connect({}, () => {
            setConnected(true);
            console.log('successfully connected');
            stompClient.subscribe(`/topic/game/${room.current.roomId}`, (message) => {
                const roomResponse = JSON.parse(message.body);
                room.current = roomResponse;
                console.log('Latest game state:');
                console.log(roomResponse);
                if (roomResponse.game !== null) {
                    // setInitialized(true);
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
            setHeroIcon(chooseIcon);
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
                console.log('Successfully retrieved user from server');
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
                console.log("Room data from server recieved upon joining room:");
                console.log(data);
                if (room.current.game === null || room.current.game.gameId === null) {
                    stompClient.send(`/app/init/${room.current.roomId}`, {}, JSON.stringify(room.current)); 
                } else if(room.current.game !== null) {
                    handleAddPlayers();
                    handleRoomState();
                }
            })
            .catch(console.log);
        }
    }, [id, connected])

    const handleDisconnect = () => {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
        navigate('/lobby');
    }

    const startGame = () => {
        stompClient.send(`/app/start-game/${room.current.roomId}`, {}, JSON.stringify(room.current));
        // gameStarted.current = true;
    }

    const handleBet = () => {
        room.current.game.betAmount = bet;
        stompClient.send(`/app/bet/${room.current.roomId}`, {}, JSON.stringify(room.current));
    }

    const handleRaise = () => {
        room.current.game.betAmount = bet;
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

    const handleLeave = () => {
            stompClient.send(`/app/leave-game/${room.current.roomId}/${auth.user.username}`, {}, JSON.stringify(room.current));
            handleDisconnect();
    } 

    const handleAddPlayers = () => {
        console.log(`Room state when handle add players is triggered:`);
        console.log(room.current);
        if (room.current.game.players === null) {
            room.current.game.players = [hero.current]
            stompClient.send(`/app/add-players/${room.current.roomId}`, {}, JSON.stringify(room.current));
        } else if (room.current.game.players.length === 1 
                    && (!room.current.game.players.some(
                        p => p.username === auth.user.username))) {
            room.current.game.players = [...room.current.game.players, hero.current];
            stompClient.send(`/app/add-players/${room.current.roomId}`, {}, JSON.stringify(room.current));
        }
    }

    const handleRoomState = () => {
        let game = room.current.game;
        let players;

        handleAddPlayers();

        if (game.players.length < 2) { 
            gameStarted.current = false;
            // room.current.game.pot = 0;
            villain.current = null;
            setVillainIcon("")
            return; 
        } 
        else {
            players = game.players;
            hero.current = players.find(p => p.username === auth.user.username);
            villain.current = players.find(p => p.username !== auth.user.username);
            if(!villainIcon) {
                setVillainIcon(chooseIcon);
            }
        }

        hero.current.holeCards ? gameStarted.current = true : gameStarted.current = false;

        setHeroHoleCards(hero.current.holeCards ? hero.current.holeCards : ['EMPTY', 'EMPTY']);
        setHerosAction(hero.current.playersAction);

        setFlop(game.board ? game.board.flop : ['EMPTY', 'EMPTY', 'EMPTY']);
        setTurn(game.board ? game.board.turn : 'EMPTY');
        setRiver(game.board ? game.board.river : 'EMPTY'); 

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
                handleLeave();
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

    const chooseIcon = () => {
        const random = Math.floor(Math.random() * 7)
        let icon = <></>;
        switch(random) {
            case 0:
                icon = <i className="nes-mario"></i>
                break;
            case 1:
                icon = <i className="nes-ash"></i>
                break;
            case 2:
                icon = <i className="nes-pokeball"></i>
                break;
            case 3:
                icon = <i className="nes-bulbasaur"></i>
                break;
            case 4:
                icon = <i className="nes-charmander"></i>
                break;
            case 5:
                icon = <i className="nes-squirtle"></i>
                break;
            case 6:
                icon = <i className="nes-kirby"></i>
                break;
            default:
                break;
        }

        if (icon !== <></> && icon === heroIcon) {
            return chooseIcon;
        } else {
            return icon;
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
                {!gameStarted.current ? 
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
                            <div>
                                {villainIcon}
                            </div>
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
                        {<Card value={`${flop[0]}`} />}
                    </div>
                    <div id="board-flop2">
                        {<Card value={`${flop[1]}`} />}
                    </div>
                    <div id="board-flop3">
                        {<Card value={`${flop[2]}`} />}
                    </div>
                    <div id="board-turn">
                        {<Card value={`${turn}`} />}
                    </div>
                    <div id="board-river">
                        {<Card value={`${river}`} />}
                    </div>
                </div>
                {/* <div id="item13">13</div>
                <div id="item14">14</div> */}
                <div id="item15"></div>
                <div id="game-info">
                    {room.current.game 
                    ? <p>{room.current.game.winner ? `${room.current.game.winner} wins` : ""}</p> 
                    : <div></div>}
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
                        <div>{heroIcon}</div>
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
