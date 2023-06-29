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
        <main className="container">
            <section id="listContainer" className="listContainer">
                <h2>Rooms</h2>
                <table>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
        </>
    )

}
export default Lobby;