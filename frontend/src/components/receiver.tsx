import { useEffect } from "react";

export default function Receiver() {

         useEffect(() => {
                    const socket=new WebSocket("ws://localhost:8080");
                    socket.onopen=()=>{
                        socket.send(JSON.stringify({type:'identify-as-sender'}));
                    } 
        }, [])
        return(
            <div>Receiver</div>
    );
}