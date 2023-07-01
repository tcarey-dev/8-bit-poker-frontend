import Errors from "../Errors";
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import "nes.css/css/nes.min.css";
import "./roomForm.css";

const ROOM_DEFAULT = {
    stake: 0.0,
    seats: 0
}

function RoomForm(){
    const [room, setRoom] = useState(ROOM_DEFAULT);
    const [errors, setErrors] = useState([]);
    const url = 'http://localhost:8080/api/room';
    const navigate = useNavigate();
    const { id } = useParams(); 

    useEffect(() => {
        if(id) {
            fetch('${url}/${id}')
            .then(response => {
                if(response.status === 200){
                    return response.json();
                }else{
                    return Promise.reject(`Unexpected Status Code: ${response.status}`);
                }
            })
            .then(data => {
                setRoom(data)
            })
            .catch(err => setErrors(err));
        }
    }, [id]);

    const handleChange = (event) => {
        const newRoom = { ...room };

        newRoom[event.target.name] = event.target.value;

        setRoom(newRoom);
    }

    const handlesubmit = (event) => {
        event.preventDefault();
        if(id) {
            updateRoom();
        }else{
            createRoom();
        }
    }

    const createRoom = () => {
        const init = {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(room)
        };
        fetch(url, init)
            .then(response => {
                if(response.status === 201 || response.status === 400){
                    return response.json();
                }else{
                    return Promise.reject(`Unexpected Status Code: ${response.status}`);
                }
            })
            .then(data => {
                if(data.roomId){
                    navigate('/lobby')
                }else{
                    setErrors(data);
                }
            })
            .catch(err => setErrors(err))
    }

    const updateRoom = () => {
        room.roomId = id;

        const init = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(room)
        };

        fetch(`${url}/${id}`, init)
            .then(response => {
                if(response.status === 204){
                    return null;
                }else if(response.status === 400){
                    return response.json();
                }else{
                    return Promise.reject(`Unexpected Status Code: ${response.status}`);
                }
            })
            .then(data => {
                if(!data){
                    navigate('/lobby')
                }else{
                    setErrors(data);
                }
            })
            .catch(err => setErrors(err));
    }

    return(
        <>
        <div id="roomFormBorder" className="nes-container with-title is-rounded">
            <p id="roomFormHeading"className="title">{id > 0 ? 'Update Room' : 'Create a Room'}</p>
            <Errors errors={errors}/>
            <form onSubmit={handlesubmit}>
                <div className="form-row">
                    <fieldset id="inputStake" className="nes-field">
                        <label id="stakeTitle" htmlFor="stake">Stakes</label>
                        <input id="stake" 
                            name="stake" 
                            required 
                            type="number" 
                            className="nes-input"
                            value={room.stake} 
                            onChange={handleChange}
                        />
                    </fieldset>
                    <fieldset id="selectFieldSeats" className="nes-select">
                        <label id="seatsTitle" htmlFor="seats"># of seats</label>
                        <select id="seats"
                                name="seats"
                                required 
                                type="number" 
                                className="nes-input" 
                                value={room.seats} 
                                onChange={handleChange}>
                                <option value={""} disable select hidden>Select...</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                                <option value={6}>6</option>
                                <option value={7}>7</option>
                                <option value={8}>8</option>
                        </select>
                    </fieldset>
                    <div id="buttons">
                        <button id="buttonYes" className="nes-btn is-primary" type="Submit">{id > 0 ? 'Update' : 'Create'}</button>
                        <Link id="buttonNo" className="nes-btn is-error" type="button" to={'/lobby'}>Cancel</Link>
                    </div>
                </div>
            </form>
        </div>

        </>
    )
}
export default RoomForm;