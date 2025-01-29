import { useEffect, useState } from "react";

export default function Sender() {

    const [socket,setSocket]=useState<WebSocket|null>(null);

        useEffect(() => {
            const socket=new WebSocket("ws://localhost:8080");
            socket.onopen=()=>{
                socket.send(JSON.stringify({type:'identify-as-sender'}));
            } 
            setSocket(socket);
}, [])

    async function  StartSendingVideo(){
        const pc=new RTCPeerConnection();

        pc.onnegotiationneeded=()=>
        {
            console.log('negotiation needed');
            pc.createOffer().then((offer)=>{
            pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({type:'create-offer',sdp:offer}));
        })};

        pc.onicecandidate=(event)=>{
            console.log(event);
            if(event.candidate){
                socket?.send(JSON.stringify({type:'ice-candidate',candidate:event.candidate}));
            }
        }

        if(!socket){
            return;
        }
        socket.onmessage=(event)=>{
            const data=JSON.parse(event.data);
            if(data.type==='createanswer'){
                pc.setRemoteDescription(data.sdp);
            }
            else if(data.type==='icecandidate'){
                pc.addIceCandidate(data.candidate);
        }}

        const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
        pc.addTrack(stream.getTracks()[0]);

        };
        return (
            <div>   
                <div>Sender</div>
                <button onClick={StartSendingVideo}>SendVideo</button>
            </div>
            );
}