import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./lobby.css";
import "nes.css/css/nes.min.css";

function Lobby(){
    const [rooms, setRooms] = useState([]);
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