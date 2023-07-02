import { useCallback, useEffect, useState, useMemo } from "react";
import { Stomp } from '@stomp/stompjs';
import SockJS from "sockjs-client";
import { useNavigate, useParams } from "react-router";
import './Room.css';
import Card from "./Card";

var stompClient = null;
const PLAYER_ONE = {
    "playerId": 3,
    "username": "fred@astair.com",
    "displayName": null,
    "enabled": true,
    "accountBalance": 25,
    "authorities": [
        "USER"
    ],
    "holeCards": null,
    "position": null,
    "playersAction": false
}
const PLAYER_TWO = {
    "playerId": 6,
    "username": "lisa@simpson.com",
    "displayName": null,
    "enabled": true,
    "accountBalance": 225,
    "authorities": [
        "USER"
    ],
    "holeCards": null,
    "position": null,
    "playersAction": false
}
const INITIALIZED_GAME = 
{
    "roomId": 3,
    "stake": 2,
    "seats": 2,
    "game": {
        "gameId": 1,
        "pot": 0,
        "winner": null,
        "lastAction": null,
        "board": null,
        "players": [
        {
            "playerId": 3,
            "username": "fred@astair.com",
            "displayName": null,
            "enabled": true,
            "accountBalance": 25,
            "authorities": [
            "USER"
            ],
            "holeCards": null,
            "position": null,
            "playersAction": false
        },
        {
            "playerId": 6,
            "username": "lisa@simpson.com",
            "displayName": null,
            "enabled": true,
            "accountBalance": 225,
            "authorities": [
            "USER"
            ],
            "holeCards": null,
            "position": null,
            "playersAction": false
        }
        ]
    }
}

function Room(){

    const url = 'http://localhost:8080/ws';
    const navigate = useNavigate();
    const { id } = useParams();

    const DEFAULT_ROOM = useMemo(() => ({
        "roomId": id,
        "stake": 2,
        "seats": 2,
        "game": null
    }), [id]); 

    const [room, setRoom] = useState(DEFAULT_ROOM);
    const [holeCards, setHoleCards] = useState([]);

    const connect = useCallback(() => {
        const socket = new SockJS(url);
        stompClient = Stomp.over(socket);
        stompClient.connect({}, () => {
            stompClient.subscribe('/topic/game', (message) => {
                const room = JSON.parse(message.body);
                setRoom(room);
            });
            // stompClient.send("/app/init", {}, JSON.stringify(DEFAULT_ROOM));
        })
    }, []);

    //triggered on page load
    useEffect(() => {
        connect(); 
    }, [id, connect]);

    // triggerred on room state change
    useEffect(() => {
        if(room.game != null 
            && room.game.players[0] != null
            && room.game.players[0].holeCards != null){
            let cards = room.game.players[0].holeCards;
            setHoleCards(cards);
        }
    }, [room]);

    const disconnect = () => {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
        navigate('/lobby');
    }

    const startGame = () => {
        stompClient.send("/app/start-game", {}, JSON.stringify(INITIALIZED_GAME));
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
                            <div><i class="nes-mario"></i></div>
                            <div>500<i class="nes-icon coin is-med"></i></div>
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
                        {<Card value={`${holeCards[0]}`} />}
                    </div>
                    <div id="hero-card2">
                        {<Card value={`${holeCards[1]}`} />}
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
                        <div><i class="nes-ash"></i></div>
                        <div>500<i class="nes-icon coin is-med"></i></div>
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