import { useEffect, useState } from "react";
import "./Card.css";

function Card({ value }) {
    const [card, setCard] = useState("");

    useEffect(() => {
        if(value){
            convertCard(value);
        }
    }, [value])

    const convertCard = (input) => {
        let suitValueArray;
        if (!input || input === 'EMPTY') {
            setCard("");
        }

        if (input !== "EMPTY") {
            suitValueArray = input.split("_OF_");

            let v = suitValueArray[0];
            let s = suitValueArray[1];
            let value;
            let suit;
        
            switch (v) {
                case "ACE":
                    value = "A";
                    break;
                case "KING":
                    value = "K";
                    break;
                case "QUEEN":
                    value = "Q";
                    break;
                case "JACK":
                    value = "J";
                    break;
                case "TEN":
                    value = "10";
                    break;
                case "NINE":
                    value = "9";
                    break;
                case "EIGHT":
                    value = "8";
                    break;
                case "SEVEN":
                    value = "7";
                    break;
                case "SIX":
                    value = "6";
                    break;
                case "FIVE":
                    value = "5";
                    break;
                case "FOUR":
                    value = "4";
                    break;
                case "THREE":
                    value = "3";
                    break;
                case "TWO":
                    value = "2";
                    break;
                default:
                    break;
            }
        
            switch(s) {
                case "SPADES":
                    suit = "♠";
                    break;
                case "CLUBS": 
                    suit = "♣";
                    break;
                case "HEARTS": 
                    suit = "♥";
                    break;
                case "DIAMONDS":
                    suit = "♦";
                    break;
                default:
                    break;
            }
        
            setCard(value + suit);
        } else {
            setCard("");
        }
    };

    return (
        <>
        <div className="deck card nes-container is-rounded is-dark">{card}</div>
        </>
    );
}

export default Card;
