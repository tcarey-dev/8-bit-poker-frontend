import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./lobby.css";
import "nes.css/css/nes.min.css";
import Errors from "../Errors";

function Lobby(){
    const [rooms, setRooms] = useState([]);
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();
    const url = "http://localhost:8080/api/room";

    useEffect(() => {
        fetch(url)
        .then(response => {
            if(response.status === 200) {
                return response.json();
            }else{
                return Promise.reject(`Unexpected Status Code: ${response.status}`);
            }
        })
        .then(data => setRooms(data))
        .catch(console.log);
    }, []);

    function handleDeleteRoom(roomId){
        const room = rooms.find(room => room.roomId === roomId);
        if(window.confirm(`Delete room: ${room.roomId}, with ${room.seats} seats and $${room.stake} stakes?`)){
            const init = {
                method: 'DELETE'
            };
    
        fetch(`${url}/${roomId}`, init)
        .then(response => {
            if(response.status === 204){
                const newRooms = rooms.filter(room => room.roomId !== roomId);
                setRooms(newRooms);
            }else{
                return Promise.reject(`Unexpected Status Code: ${response.status}`);
            }
        })
        .catch(err => setErrors(err));
    }
}

    return(
        <>
        <div id="listBorder" className="nes-container is-centered is-rounded">
            <h2 class="title">Rooms</h2>
                <div id="listContainer" className="nes-table-responsive">
                    <table className="nes-table is-bordered is-centered is-dark">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Stake</th>
                                <th>Seats</th>
                                <th>&nbsp;</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.roomId}>
                                    <td>{room.roomId}</td>
                                    <td>{room.stake}</td>
                                    <td>{room.seats}</td>
                                    <td>
                                        <Link className="nes-btn is-success" type="button" to={"/room"}>
                                            JOIN <i className="nes-icon coin is-small"/>
                                        </Link>
                                        <Link className="nes-btn is-warning" to={`/room/edit/${room.id}`}>
                                            UPDATE
                                        </Link>
                                        <button className="nes-btn is-error" onClick={() => handleDeleteRoom(room.roomId)}>
                                            DELETE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )

}
export default Lobby;