import { useEffect, useState } from "react";

export default function Receiver() {
        const [socket,setSocket]=useState<WebSocket|null>(null);
         useEffect(() => {
                    const socket=new WebSocket("ws://localhost:8080");
                    socket.onopen=()=>{
                        socket.send(JSON.stringify({type:'identify-as-receiver'}));
                    } 
                    socket.onmessage=(event)=>{
                        const data=JSON.parse(event.data);
                        if(data.type==='createoffer'){
                            const pc=new RTCPeerConnection();
                            pc.setRemoteDescription(data.sdp);
                            pc.createAnswer().then((answer)=>{
                                pc.setLocalDescription(answer);
                                socket.send(JSON.stringify({type:'create-answer',sdp:answer}));
                            });
                        }
                    }
        }, [])


        return(
            <div>Receiver</div>
    );
}