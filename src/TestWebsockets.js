import { useEffect, useState } from "react";
import { Stomp } from '@stomp/stompjs';
import SockJS from "sockjs-client";

var stompClient = null;

function Greetings() {
    const [connected, setConnected] = useState(false);
    const [greetings, setGreetings] = useState([]);
    const [name, setName] = useState('');

    const connect = () => {
        const socket = new SockJS('http://localhost:8080/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, () => {
            stompClient.subscribe('/topic/greetings', (message) => {
                const greeting = JSON.parse(message.body).content;
                showGreeting(greeting);
            });
        });
    }

    const disconnect = () => {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        setConnected(false);
        console.log("Disconnected");
    }

    useEffect(() => {

    }, [greetings])

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        switch (event.target.id) {
            case 'connect':
                console.log('connecting');
                connect();
                setConnected(true);
                break;
            case 'disconnect':
                disconnect();
                setConnected(false);
                break;
            case 'send':
                sendName(name);
                break;
            default:
                break;
        }
    }

    const sendName = (name) => {
        stompClient.send("/app/hello", {}, JSON.stringify({'name': name}));
    }

    const showGreeting = (message) => {
        setGreetings((prevGreetings) => [...prevGreetings, message]);
    }

    return (
        <div id="main-content" className="container">
            <div className="row">
                <div className="col-md-6">
                    <form className="form-inline">
                        <div className="form-group">
                            <label htmlFor="connect">WebSocket connection:</label>
                            <button id="connect" className="btn btn-default" type="button" onClick={handleSubmit}>
                                Connect
                            </button>
                            <button
                                id="disconnect"
                                className="btn btn-default"
                                type="button"
                                disabled={!connected}
                                onClick={handleSubmit}
                            >
                                Disconnect
                            </button>
                        </div>
                    </form>
                </div>
                <div className="col-md-6">
                    <form className="form-inline">
                        <div className="form-group">
                            <label htmlFor="name">What is your nickname?</label>
                            <input
                                type="text"
                                id="name"
                                className="form-control"
                                placeholder="Your name here..."
                                value={name}
                                onChange={handleNameChange}
                            />
                        </div>
                        <button id="send" className="btn btn-default" type="button" onClick={handleSubmit}>
                            Send
                        </button>
                    </form>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    {connected && (
                        <table id="conversation" className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Greetings</th>
                                </tr>
                            </thead>
                            <tbody id="greetings">
                                {greetings.map((message, index) => (
                                    <tr key={index}>
                                        <td>{message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Greetings;
