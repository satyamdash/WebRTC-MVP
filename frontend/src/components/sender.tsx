import { useEffect, useState } from "react";

export default function Sender() {

    const [socket,setSocket]=useState<WebSocket|null>(null);

        useEffect(() => {
            const socket=new WebSocket("ws://localhost:8080");
            socket.onopen=()=>{
                socket.send(JSON.stringify({type:'identify-as-sender'}));
            } 
}, [])

    function StartSendingVideo(){
        const pc=new RTCPeerConnection();
        pc.createOffer().then((offer)=>{
            pc.setLocalDescription(offer);
            
            socket?.send(JSON.stringify({type:'create-offer',sdp:offer}));

            if(!socket){
                return;
            }
            socket.onmessage=(event)=>{
                const data=JSON.parse(event.data);
                if(data.type==='createanswer'){
                    pc.setRemoteDescription(data.sdp);
                }
            }
        });

    }
return (
        <div>   
            <div>Sender</div>
            <button onClick={StartSendingVideo}>SendVideo</button>
         </div>
    );
}