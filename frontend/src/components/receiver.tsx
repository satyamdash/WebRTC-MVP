import { useEffect, useState } from "react";

export default function Receiver() {
         useEffect(() => {
                    const socket=new WebSocket("ws://localhost:8080");
                    socket.onopen=()=>{
                        socket.send(JSON.stringify({type:'identify-as-receiver'}));
                    } 
                    socket.onmessage=(event)=>{
                        
                        const data=JSON.parse(event.data);
                        let pc=new RTCPeerConnection();
                        if(data.type==='createoffer')
                        {
                             pc=new RTCPeerConnection();
                             pc.setRemoteDescription(data.sdp);
                                pc.onicecandidate=(event)=>{
                                    console.log(event);
                                    if(event.candidate){
                                        socket.send(JSON.stringify({type:'ice-candidate',candidate:event.candidate}));
                                    }
                                }
                                pc.ontrack=(event)=>{
                                    console.log(event);
                                    console.log('track received');
                                }
                                pc.createAnswer().then((answer)=>{
                                    pc.setLocalDescription(answer);
                                    socket.send(JSON.stringify({type:'create-answer',sdp:answer}));
                                });
                        }
                        else if(data.type==='icecandidate'){
                            pc.addIceCandidate(data.candidate);
                        }
                        
                    }
        }, [])


        return(
            <div>Receiver</div>
    );
}